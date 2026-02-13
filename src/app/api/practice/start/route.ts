import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, sessionType } = body;

    if (userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType,
        startTime: new Date(),
      },
    });

    return Response.json({ session: practiceSession });
  } catch (error) {
    console.error("Error starting practice session:", error);
    return Response.json(
      { error: "Failed to start practice session" },
      { status: 500 },
    );
  }
}
