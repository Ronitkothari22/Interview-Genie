import { Router } from "express";

import { prisma } from "@/config/prisma.js";
import { authMiddleware } from "@/middleware/auth.js";

export const practiceRouter = Router();

practiceRouter.use(authMiddleware);

/** POST /api/practice/start — create a new practice session. */
practiceRouter.post("/start", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { userId: bodyUserId, sessionType } = req.body ?? {};

    if (bodyUserId !== userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId,
        sessionType,
        startTime: new Date(),
      },
    });

    res.json({ session: practiceSession });
  } catch (error) {
    console.error("Error starting practice session:", error);
    res.status(500).json({ error: "Failed to start practice session" });
  }
});

/** POST /api/practice/ping — verify a session exists and belongs to the user. */
practiceRouter.post("/ping", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.body ?? {};

    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!practiceSession) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (practiceSession.userId !== userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error pinging practice session:", error);
    res.status(500).json({ error: "Failed to ping practice session" });
  }
});

/** POST /api/practice/end — close a session and upsert the user's practice stats. */
practiceRouter.post("/end", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.body ?? {};

    const existingSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: { startTime: true, userId: true },
    });

    if (!existingSession) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (existingSession.userId !== userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const endTime = new Date();
    const durationInSeconds = Math.round(
      (endTime.getTime() - existingSession.startTime.getTime()) / 1000,
    );

    const updatedSession = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { endTime, duration: durationInSeconds },
    });

    const stats = await prisma.practiceStats.upsert({
      where: { userId },
      create: {
        userId,
        totalDuration: durationInSeconds,
        weeklyDuration: durationInSeconds,
        lastWeekDuration: 0,
        lastUpdated: endTime,
      },
      update: {
        totalDuration: { increment: durationInSeconds },
        weeklyDuration: { increment: durationInSeconds },
        lastUpdated: endTime,
      },
    });

    res.json({ session: updatedSession, stats });
  } catch (error) {
    console.error("Error ending practice session:", error);
    res.status(500).json({ error: "Failed to end practice session" });
  }
});
