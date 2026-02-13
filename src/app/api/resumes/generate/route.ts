import { type NextRequest, NextResponse } from "next/server";
import { type ResumeData, type TemplateType } from "@/lib/types/resume";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Initialize Gemini on the server side
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

async function analyzeResumeWithGemini(resumeData: string) {
  try {
    console.log("Analyzing resume with Gemini...");
    console.log("Resume data:", JSON.stringify(resumeData, null, 2));

    const result = await model.generateContent(
      ATS_ANALYSIS_PROMPT + "\n\nAnalyze this resume:\n" + resumeData,
    );
    const response = result.response;
    const text = response.text().trim();

    console.log("Raw Gemini response:", text);

    // Remove any markdown code block markers if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    console.log("Cleaned response:", cleanedText);

    try {
      const parsedResponse = JSON.parse(cleanedText);
      console.log(
        "Successfully parsed response:",
        JSON.stringify(parsedResponse, null, 2),
      );
      return parsedResponse;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);
    throw new Error("Failed to analyze resume");
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Starting resume generation process...");

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const {
      data,
      template,
      resumeId,
      title: explicitTitle,
    } = body as {
      data: ResumeData;
      template: TemplateType;
      resumeId: string;
      title?: string;
    };

    // Get title from either explicit title or generate from personal info
    const title =
      explicitTitle?.trim() ??
      `${data.personalInfo.name}'s ${data.personalInfo.title} Resume`.trim();

    // Validate request data
    if (!data || !template || !resumeId) {
      console.error("Missing required fields:", {
        data: !!data,
        template: !!template,
        resumeId: !!resumeId,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields. Please provide data, template, and resumeId.",
        },
        { status: 400 },
      );
    }

    // Validate personal info
    if (!data.personalInfo?.name || !data.personalInfo?.title) {
      console.error("Missing required personal info:", {
        name: !!data.personalInfo?.name,
        title: !!data.personalInfo?.title,
      });
      return NextResponse.json(
        {
          error:
            "Missing required personal information. Name and title are required.",
        },
        { status: 400 },
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update resume title
    console.log("Updating resume with title:", title);
    await prisma.resume.update({
      where: { id: resumeId },
      data: { title },
    });

    console.log("Updated resume title:", title);

    // Analyze resume with Gemini
    const analysis = await analyzeResumeWithGemini(JSON.stringify(data));
    console.log("Resume analysis completed");

    // Store the ATS score and analysis in the database
    if (analysis?.ats_analysis?.total_score) {
      console.log("Updating ATS score:", analysis.ats_analysis.total_score);

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

      console.log("ATS analysis stored in database");
    }

    // Calculate resume score
    console.log("Calculating resume score...");

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

    console.log("Score calculation completed:", {
      expScore,
      eduScore,
      projScore,
      certScore,
      achScore,
      totalScore: Math.round(totalScore),
    });

    // Return success response with data for client-side PDF generation
    return NextResponse.json({
      success: true,
      data,
      template,
      analysis,
      score: Math.round(totalScore),
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
