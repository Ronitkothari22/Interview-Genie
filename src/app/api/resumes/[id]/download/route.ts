/** @jsxRuntime classic */
/** @jsx React.createElement */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, Document } from "@react-pdf/renderer";
import { ModernPDFTemplate } from "@/components/resume/pdf-templates/modern";
import React from "react";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
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
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!resume.personalInfo) {
      return NextResponse.json(
        { error: "Resume data is incomplete" },
        { status: 400 },
      );
    }

    // Transform data to match ModernPDFTemplate props
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
        ? {
            content: resume.summary.content ?? "",
          }
        : undefined,
    };

    // Generate PDF buffer
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

      // Return PDF with appropriate headers
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            `attachment; filename="${resume.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, "-")}-Resume.pdf"`.toLowerCase(),
        },
      });
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return NextResponse.json(
        { error: "Failed to generate PDF document" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in download route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
