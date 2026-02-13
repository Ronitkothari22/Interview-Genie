import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's resumes and calculate average ATS score
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      select: { atsScore: true },
    });

    const atsScores = resumes
      .map((resume) => resume.atsScore)
      .filter((score): score is number => score !== null);

    const avgAtsScore =
      atsScores.length > 0
        ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
        : 0;

    // Calculate ATS score trend
    const lastAtsScore = atsScores[atsScores.length - 1] || 0;
    const atsTrend = lastAtsScore > 0 ? avgAtsScore - lastAtsScore : 0;

    // Get next ATS target
    const getNextTarget = (score: number) => {
      if (score >= 90) return 95;
      if (score >= 85) return 90;
      if (score >= 80) return 85;
      if (score >= 70) return 80;
      return 70;
    };

    // Fetch practice stats
    const practiceStats = await prisma.practiceStats.findUnique({
      where: { userId: session.user.id },
    });

    // Fetch completed interview count
    const completedInterviews = await prisma.practiceSession.count({
      where: {
        userId: session.user.id,
        sessionType: "interview",
        endTime: { not: null },
      },
    });

    // Calculate interview trend (completed in last 7 days)
    const lastWeekInterviews = await prisma.practiceSession.count({
      where: {
        userId: session.user.id,
        sessionType: "interview",
        endTime: { not: null },
        startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    // Get user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    const stats = {
      totalScore: {
        value: `${avgAtsScore}%`,
        trend: `${atsTrend >= 0 ? "+" : ""}${atsTrend}%`,
        trendType: atsTrend >= 0 ? "positive" : "negative",
        nextMilestone: `${getNextTarget(avgAtsScore)}%`,
        progress: avgAtsScore,
      },
      interviews: {
        value: completedInterviews.toString(),
        trend: `+${lastWeekInterviews}`,
        trendType: "positive",
        nextMilestone: (completedInterviews + 3).toString(),
        progress: Math.min(Math.round((completedInterviews / 15) * 100), 100),
      },
      practiceTime: {
        value: `${Math.round((practiceStats?.totalDuration || 0) / 3600)}h`,
        trend: `${practiceStats?.weeklyDuration ? "+" : ""}${Math.round((practiceStats?.weeklyDuration || 0) / 3600)}h`,
        trendType:
          (practiceStats?.weeklyDuration || 0) >=
          (practiceStats?.lastWeekDuration || 0)
            ? "positive"
            : "negative",
        nextMilestone: "20h",
        progress: Math.min(
          Math.round(
            ((practiceStats?.weeklyDuration || 0) / (20 * 3600)) * 100,
          ),
          100,
        ),
      },
      credits: {
        value: (user?.credits || 0).toString(),
        trend: "+0",
        trendType: "positive",
        nextMilestone: ((user?.credits || 0) + 50).toString(),
        progress: Math.min(Math.round(((user?.credits || 0) / 200) * 100), 100),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
