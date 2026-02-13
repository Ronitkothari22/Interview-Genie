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

    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!practiceSession) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Session exists and belongs to the user - return success
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error pinging practice session:", error);
    return Response.json(
      { error: "Failed to ping practice session" },
      { status: 500 },
    );
  }
}
