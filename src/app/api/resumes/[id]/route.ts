import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { type NextRequest } from "next/server";

// Define validation schemas for each section
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

const volunteerSchema = z.object({
  organization: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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

// GET endpoint to fetch resume data
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

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 },
    );
  }
}

// PATCH endpoint to update resume data
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { section, data } = await req.json();

    // Validate the data based on the section
    let validatedData;
    switch (section) {
      case "personal":
        validatedData = personalSchema.parse(data);
        await prisma.personalInfo.upsert({
          where: { resumeId: params.id },
          update: validatedData,
          create: { ...validatedData, resumeId: params.id },
        });
        break;

      case "experience":
        validatedData = z.array(experienceSchema).parse(data);
        await prisma.$transaction([
          prisma.experience.deleteMany({ where: { resumeId: params.id } }),
          prisma.experience.createMany({
            data: validatedData.map((exp) => ({ ...exp, resumeId: params.id })),
          }),
        ]);
        break;

      case "projects":
        validatedData = z.array(projectSchema).parse(data);
        await prisma.$transaction([
          prisma.project.deleteMany({ where: { resumeId: params.id } }),
          prisma.project.createMany({
            data: validatedData.map((proj) => ({
              ...proj,
              resumeId: params.id,
            })),
          }),
        ]);
        break;

      case "education":
        validatedData = z.array(educationSchema).parse(data);
        await prisma.$transaction([
          prisma.education.deleteMany({ where: { resumeId: params.id } }),
          prisma.education.createMany({
            data: validatedData.map((edu) => ({ ...edu, resumeId: params.id })),
          }),
        ]);
        break;

      case "certifications":
        validatedData = z.array(certificationSchema).parse(data);
        await prisma.$transaction([
          prisma.certification.deleteMany({ where: { resumeId: params.id } }),
          prisma.certification.createMany({
            data: validatedData.map((cert) => ({
              ...cert,
              resumeId: params.id,
            })),
          }),
        ]);
        break;

      case "achievements":
        validatedData = z.array(achievementSchema).parse(data);
        await prisma.$transaction([
          prisma.achievement.deleteMany({ where: { resumeId: params.id } }),
          prisma.achievement.createMany({
            data: validatedData.map((ach) => ({ ...ach, resumeId: params.id })),
          }),
        ]);
        break;

      case "skills":
        validatedData = skillsSchema.parse(data);
        await prisma.skills.upsert({
          where: { resumeId: params.id },
          update: validatedData,
          create: { ...validatedData, resumeId: params.id },
        });
        break;

      case "summary":
        validatedData = summarySchema.parse(data);
        await prisma.summary.upsert({
          where: { resumeId: params.id },
          update: validatedData,
          create: { ...validatedData, resumeId: params.id },
        });
        break;

      default:
        return new NextResponse("Invalid section", { status: 400 });
    }

    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error("Error updating resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the resume (cascade delete will handle relations)
    await prisma.resume.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 },
    );
  }
}
