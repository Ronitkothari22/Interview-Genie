import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = "http://23.94.74.248:5000/api/v1/ats-score";

export const maxDuration = 60;
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    // Check authentication
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

    const data = await req.json();

    // Create resume and personal info in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the resume with proper user relation
      const resume = await tx.resume.create({
        data: {
          userId: user.id,
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
                  technical: data.keySkills
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

      return resume;
    });

    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create resume",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          resumes: [],
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          resumes: [],
        },
        { status: 404 },
      );
    }

    try {
      // Get resumes
      const resumes = await prisma.resume.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          atsScore: true,
        },
      });

      return NextResponse.json({
        success: true,
        resumes: resumes || [],
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resumes",
          resumes: [],
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resumes",
        resumes: [],
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("id");

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the resume and all related data (cascade delete will handle relations)
    await prisma.resume.delete({
      where: { id: resumeId },
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

// Handle preflight requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}
