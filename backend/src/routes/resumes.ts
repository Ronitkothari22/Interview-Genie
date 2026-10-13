import { Document, renderToBuffer } from "@react-pdf/renderer";
import { Router } from "express";
import React from "react";
import { z } from "zod";

import { prisma } from "@/config/prisma.js";
import { authMiddleware } from "@/middleware/auth.js";
import { getGeminiModel } from "@/services/gemini.js";
import { generateTemplatePreview } from "@/services/preview.js";
import { ModernPDFTemplate } from "@/templates/pdf/modern.js";
import type { ResumeData, TemplateType } from "@/shared/types/resume.js";

export const resumesRouter = Router();

// ---------------------------------------------------------------------------
// Per-section validation schemas (kept inline to mirror the monolith exactly).
// ---------------------------------------------------------------------------

const personalSchema = z.object({
  fullName: z.string().min(1),
  jobTitle: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
  linkedIn: z.string().optional(),
  portfolio: z.string().optional(),
});

const experienceSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const educationSchema = z.object({
  school: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  gpa: z.string().optional(),
  achievements: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuingOrg: z.string().min(1),
  issueDate: z.string().min(1),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const achievementSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

const skillsSchema = z.object({
  technical: z.array(z.string()).min(1),
  soft: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

const summarySchema = z.object({
  content: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Resume collection: /api/resumes
// ---------------------------------------------------------------------------

/** POST /api/resumes — create a resume + personal info (+ skills). */
resumesRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = req.body ?? {};

    const result = await prisma.$transaction(async (tx) => {
      return tx.resume.create({
        data: {
          userId,
          title: `${data.fullName}'s Resume`,
          atsScore: null,
          personalInfo: {
            create: {
              fullName: data.fullName,
              jobTitle: data.jobTitle,
              email: data.email,
              phone: data.phoneNumber,
              location: data.location || "",
              linkedIn: data.linkedIn || "",
              portfolio: data.portfolio || "",
            },
          },
          skills: data.keySkills
            ? {
                create: {
                  technical: (data.keySkills as string)
                    .split(",")
                    .map((s: string) => s.trim()),
                  soft: [],
                  tools: [],
                },
              }
            : undefined,
        },
        include: {
          personalInfo: true,
          skills: true,
        },
      });
    });

    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create resume",
    });
  }
});

/** GET /api/resumes — list the current user's resumes. */
resumesRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    try {
      const resumes = await prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          atsScore: true,
        },
      });

      res.json({ success: true, resumes: resumes || [] });
    } catch (dbError) {
      console.error("Database error:", dbError);
      res.status(500).json({
        success: false,
        error: "Failed to fetch resumes",
        resumes: [],
      });
    }
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch resumes",
      resumes: [],
    });
  }
});

/** DELETE /api/resumes?id=… — delete a resume by query param. */
resumesRouter.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const resumeId = req.query.id as string | undefined;

    if (!resumeId) {
      res.status(400).json({ error: "Resume ID is required" });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      res.status(404).json({ error: "Resume not found or unauthorized" });
      return;
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

// Handle preflight requests (CORS middleware also handles these).
resumesRouter.options("/", (_req, res) => {
  res
    .status(204)
    .set({ Allow: "POST, OPTIONS", "Content-Type": "application/json" })
    .end();
});

// ---------------------------------------------------------------------------
// Sub-resources — registered before "/:id" so static paths win.
// ---------------------------------------------------------------------------

const ATS_ANALYSIS_PROMPT = `You are an ATS resume analyzer. Analyze the given resume and provide a structured JSON response following this exact format:

{
  "ats_analysis": {
    "total_score": number,
    "section_scores": {
      "format": number,
      "content": number,
      "language": number,
      "competencies": number,
      "keywords": number
    },
    "detailed_breakdown": {
      "format_analysis": {
        "length_depth_score": number,
        "bullet_usage_score": number,
        "bullet_length_score": number,
        "page_density_score": number,
        "formatting_score": number
      },
      "content_analysis": {
        "impact_score": number,
        "achievements_score": number,
        "relevance_score": number,
        "technical_depth_score": number
      },
      "language_analysis": {
        "verb_strength": number,
        "tense_consistency": number,
        "clarity": number,
        "spelling_grammar": number,
        "professional_tone": number
      },
      "competencies_analysis": {
        "leadership_initiative": number,
        "problem_solving": number,
        "collaboration": number,
        "results_orientation": number
      }
    },
    "keyword_match_rate": string,
    "missing_keywords": string[]
  },
  "improvement_suggestions": {
    "high_priority": string[],
    "content": string[],
    "language": string[],
    "format": string[],
    "keywords": string[]
  },
  "improvement_details": {
    "bullet_points": [
      {
        "original": string,
        "improved": string,
        "reason": string
      }
    ],
    "achievements": [
      {
        "section": string,
        "current": string,
        "suggested": string,
        "impact": string
      }
    ],
    "skills": [
      {
        "skill_area": string,
        "current": string,
        "improved": string,
        "explanation": string
      }
    ]
  }
}

Use these scoring criteria:

1. Format & Structure (20 points):
   - Length & depth (0-4): Standard 1-2 pages acceptable
   - Use of bullets (0-4): Clear bullet points with action verbs
   - Bullet lengths (0-4): 1-2 lines optimal, clear and concise
   - Page density (0-4): Balanced white space and content
   - Overall formatting (0-4): Consistent fonts and spacing

2. Content Quality (20 points):
   - Quantified impact (0-5): Numbers and metrics where applicable
   - Specific achievements (0-5): Clear accomplishments over duties
   - Relevance to field (0-5): Industry-aligned experience
   - Technical depth (0-5): Appropriate technical detail

3. Language & Communication (20 points):
   - Verb strength (0-4): Strong action verbs
   - Verb tense consistency (0-4): Proper past/present usage
   - Clarity (0-4): Clear, professional language
   - Spelling & grammar (0-4): Minimal errors acceptable
   - Professional tone (0-4): Appropriate business language

4. Core Competencies (20 points):
   - Leadership/Initiative (0-5): Shows proactive approach
   - Problem-solving (0-5): Demonstrates analytical thinking
   - Collaboration (0-5): Shows team and communication skills
   - Results-orientation (0-5): Focus on outcomes

5. Keywords & Industry Alignment (20 points):
   - Industry-specific terms (0-7): Relevant current technologies
   - Role-specific keywords (0-7): Matching job requirements
   - Soft skills alignment (0-6): Balanced technical and soft skills

IMPORTANT: Respond ONLY with the JSON object. Do not include any additional text, markdown formatting, or explanations.`;

interface ExperienceData {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface EducationData {
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string[];
}

interface ProjectData {
  name: string;
  technologies: string;
  date: string;
  description: string[];
}

interface CertificationData {
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface AchievementData {
  title: string;
  date: string;
  description: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function analyzeResumeWithGemini(resumeData: string): Promise<any> {
  const model = getGeminiModel();

  const result = await model.generateContent(
    ATS_ANALYSIS_PROMPT + "\n\nAnalyze this resume:\n" + resumeData,
  );
  const text = result.response.text().trim();

  const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Invalid JSON response from Gemini");
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** POST /api/resumes/generate — analyze + score a resume with Gemini. */
resumesRouter.post("/generate", authMiddleware, async (req, res) => {
  try {
    const body = req.body as {
      data: ResumeData;
      template: TemplateType;
      resumeId: string;
      title?: string;
    };

    const { data, template, resumeId, title: explicitTitle } = body;

    const title =
      explicitTitle?.trim() ||
      `${data.personalInfo.name}'s ${data.personalInfo.title} Resume`.trim();

    if (!data || !template || !resumeId) {
      res.status(400).json({
        error:
          "Missing required fields. Please provide data, template, and resumeId.",
      });
      return;
    }

    if (!data.personalInfo?.name || !data.personalInfo?.title) {
      res.status(400).json({
        error:
          "Missing required personal information. Name and title are required.",
      });
      return;
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { title },
    });

    const analysis = await analyzeResumeWithGemini(JSON.stringify(data));

    if (analysis?.ats_analysis?.total_score) {
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          atsScore: analysis.ats_analysis.total_score,
          atsAnalysis: {
            ats_analysis: {
              total_score: analysis.ats_analysis.total_score,
              section_scores: analysis.ats_analysis.section_scores,
              detailed_breakdown: analysis.ats_analysis.detailed_breakdown,
              keyword_match_rate: analysis.ats_analysis.keyword_match_rate,
              missing_keywords: analysis.ats_analysis.missing_keywords,
            },
            improvement_suggestions: analysis.improvement_suggestions,
            improvement_details: analysis.improvement_details,
          },
        },
      });
    }

    const expScore = data.experience.reduce(
      (acc: number, exp: ExperienceData) =>
        acc + Math.min(exp.description.length / 3, 1),
      0,
    );

    const eduScore = data.education.reduce(
      (acc: number, edu: EducationData) =>
        acc + (edu.description ? edu.description.length : 0),
      0,
    );

    const projScore = data.projects.reduce(
      (acc: number, proj: ProjectData) =>
        acc + Math.min(proj.description.length / 2, 1),
      0,
    );

    const certScore = data.certifications.reduce(
      (acc: number, cert: CertificationData) =>
        acc + (cert.description ? 2 : 1),
      0,
    );

    const achScore = data.achievements.reduce(
      (acc: number, ach: AchievementData) => acc + (ach.description ? 1 : 0),
      0,
    );

    const totalScore = Math.min(
      (expScore * 0.3 +
        eduScore * 0.2 +
        projScore * 0.2 +
        certScore * 0.15 +
        achScore * 0.15) *
        100,
      100,
    );

    res.json({
      success: true,
      data,
      template,
      analysis,
      score: Math.round(totalScore),
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/** POST /api/resumes/preview — return sample data for a template. */
resumesRouter.post("/preview", async (req, res) => {
  try {
    const { template } = req.body ?? {};

    if (!template || !["modern", "classic", "minimalist"].includes(template)) {
      res.status(400).json({ error: "Invalid template type" });
      return;
    }

    const previewData = await generateTemplatePreview(template as TemplateType);
    if (!previewData) {
      res.status(500).json({ error: "Failed to generate preview" });
      return;
    }

    res.json({ success: true, data: previewData });
  } catch (error) {
    console.error("Error generating preview:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});

/**
 * GET /api/resumes/templates/preview?template=… — template preview.
 *
 * NOTE: preserved from the monolith, which serialises the preview JSON into a
 * buffer labelled as a PDF. The frontend renders previews client-side and does
 * not call this endpoint; it is kept for API parity.
 */
resumesRouter.get("/templates/preview", async (req, res) => {
  try {
    const template = req.query.template as TemplateType;

    if (!template || !["modern", "classic", "minimalist"].includes(template)) {
      res.status(400).json({ error: "Invalid template type" });
      return;
    }

    const previewData = await generateTemplatePreview(template);

    res
      .status(200)
      .set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${template}-preview.pdf"`,
        "Cache-Control": "public, max-age=31536000",
      })
      .send(Buffer.from(JSON.stringify(previewData)));
  } catch (error) {
    console.error("Error generating template preview:", error);

    if (
      error instanceof Error &&
      error.message.includes("pdflatex: command not found")
    ) {
      res.status(500).json({
        error:
          "LaTeX is not installed on the system. Please install TeX Live using your package manager.",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to generate preview",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/** GET /api/resumes/:id/download — render the resume as a PDF. */
resumesRouter.get("/:id/download", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Resume ID is required" });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        personalInfo: true,
        experiences: true,
        education: true,
        projects: true,
        certifications: true,
        achievements: true,
        skills: true,
        summary: true,
      },
    });

    if (!resume) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    if (!resume.personalInfo) {
      res.status(400).json({ error: "Resume data is incomplete" });
      return;
    }

    const templateData = {
      personalInfo: {
        fullName: resume.personalInfo.fullName || "",
        jobTitle: resume.personalInfo.jobTitle || "",
        email: resume.personalInfo.email || "",
        phone: resume.personalInfo.phone || "",
        location: resume.personalInfo.location || "",
      },
      experiences: (resume.experiences || []).map((exp) => ({
        companyName: exp.companyName || "",
        jobTitle: exp.jobTitle || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        description: exp.description || "",
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      })),
      education: (resume.education || []).map((edu) => ({
        school: edu.school || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        gpa: edu.gpa ?? undefined,
        achievements: edu.achievements ?? undefined,
      })),
      projects: (resume.projects || []).map((proj) => ({
        name: proj.name || "",
        description: proj.description || "",
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        startDate: proj.startDate ?? undefined,
        endDate: proj.endDate ?? undefined,
        url: proj.url ?? undefined,
      })),
      certifications: (resume.certifications || []).map((cert) => ({
        name: cert.name || "",
        issuingOrg: cert.issuingOrg || "",
        issueDate: cert.issueDate || "",
        expiryDate: cert.expiryDate ?? undefined,
        credentialId: cert.credentialId ?? undefined,
        credentialUrl: cert.credentialUrl ?? undefined,
      })),
      achievements: (resume.achievements || []).map((ach) => ({
        title: ach.title ?? undefined,
        date: ach.date ?? undefined,
        description: ach.description ?? undefined,
      })),
      skills: {
        technical: Array.isArray(resume.skills?.technical)
          ? resume.skills.technical
          : [],
        soft: Array.isArray(resume.skills?.soft) ? resume.skills.soft : [],
        tools: Array.isArray(resume.skills?.tools) ? resume.skills.tools : [],
      },
      summary: resume.summary
        ? { content: resume.summary.content ?? "" }
        : undefined,
    };

    try {
      const pdfBuffer = await renderToBuffer(
        React.createElement(
          Document,
          null,
          React.createElement(ModernPDFTemplate, { data: templateData }),
        ),
      );

      if (!pdfBuffer) {
        throw new Error("PDF generation failed - buffer is empty");
      }

      const filename = `${resume.personalInfo.fullName.replace(
        /[^a-zA-Z0-9]/g,
        "-",
      )}-Resume.pdf`.toLowerCase();

      res
        .status(200)
        .set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        })
        .send(pdfBuffer);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      res.status(500).json({ error: "Failed to generate PDF document" });
    }
  } catch (error) {
    console.error("Error in download route:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/** GET /api/resumes/:id — fetch a full resume. */
resumesRouter.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Resume ID is required" });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        personalInfo: true,
        experiences: true,
        education: true,
        projects: true,
        certifications: true,
        achievements: true,
        skills: true,
        summary: true,
      },
    });

    if (!resume) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    res.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

/** PATCH /api/resumes/:id — upsert a single resume section. */
resumesRouter.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { section, data } = req.body ?? {};

    if (!id) {
      res.status(400).send("Resume ID is required");
      return;
    }

    try {
      switch (section) {
        case "personal": {
          const validatedData = personalSchema.parse(data);
          await prisma.personalInfo.upsert({
            where: { resumeId: id },
            update: validatedData,
            create: { ...validatedData, resumeId: id },
          });
          break;
        }

        case "experience": {
          const validatedData = z.array(experienceSchema).parse(data);
          await prisma.$transaction([
            prisma.experience.deleteMany({ where: { resumeId: id } }),
            prisma.experience.createMany({
              data: validatedData.map((exp) => ({ ...exp, resumeId: id })),
            }),
          ]);
          break;
        }

        case "projects": {
          const validatedData = z.array(projectSchema).parse(data);
          await prisma.$transaction([
            prisma.project.deleteMany({ where: { resumeId: id } }),
            prisma.project.createMany({
              data: validatedData.map((proj) => ({ ...proj, resumeId: id })),
            }),
          ]);
          break;
        }

        case "education": {
          const validatedData = z.array(educationSchema).parse(data);
          await prisma.$transaction([
            prisma.education.deleteMany({ where: { resumeId: id } }),
            prisma.education.createMany({
              data: validatedData.map((edu) => ({ ...edu, resumeId: id })),
            }),
          ]);
          break;
        }

        case "certifications": {
          const validatedData = z.array(certificationSchema).parse(data);
          await prisma.$transaction([
            prisma.certification.deleteMany({ where: { resumeId: id } }),
            prisma.certification.createMany({
              data: validatedData.map((cert) => ({ ...cert, resumeId: id })),
            }),
          ]);
          break;
        }

        case "achievements": {
          const validatedData = z.array(achievementSchema).parse(data);
          await prisma.$transaction([
            prisma.achievement.deleteMany({ where: { resumeId: id } }),
            prisma.achievement.createMany({
              data: validatedData.map((ach) => ({ ...ach, resumeId: id })),
            }),
          ]);
          break;
        }

        case "skills": {
          const validatedData = skillsSchema.parse(data);
          await prisma.skills.upsert({
            where: { resumeId: id },
            update: validatedData,
            create: { ...validatedData, resumeId: id },
          });
          break;
        }

        case "summary": {
          const validatedData = summarySchema.parse(data);
          await prisma.summary.upsert({
            where: { resumeId: id },
            update: validatedData,
            create: { ...validatedData, resumeId: id },
          });
          break;
        }

        default:
          res.status(400).send("Invalid section");
          return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
        return;
      }
      throw error;
    }

    res.json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).send("Internal Server Error");
  }
});

/** DELETE /api/resumes/:id — delete a resume by id. */
resumesRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Resume ID is required" });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      res.status(404).json({ error: "Resume not found or unauthorized" });
      return;
    }

    await prisma.resume.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});
