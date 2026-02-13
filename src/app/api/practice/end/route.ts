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
    const { sessionId } = body;

    const existingSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: { startTime: true, userId: true },
    });

    if (!existingSession) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const endTime = new Date();
    const durationInSeconds = Math.round(
      (endTime.getTime() - existingSession.startTime.getTime()) / 1000,
    );

    const updatedSession = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration: durationInSeconds,
      },
    });

    // Update practice stats
    const stats = await prisma.practiceStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalDuration: durationInSeconds,
        weeklyDuration: durationInSeconds,
        lastWeekDuration: 0,
        lastUpdated: endTime,
      },
      update: {
        totalDuration: {
          increment: durationInSeconds,
        },
        weeklyDuration: {
          increment: durationInSeconds,
        },
        lastUpdated: endTime,
      },
    });

    return Response.json({ session: updatedSession, stats });
  } catch (error) {
    console.error("Error ending practice session:", error);
    return Response.json(
      { error: "Failed to end practice session" },
      { status: 500 },
    );
  }
}
