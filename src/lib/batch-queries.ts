import { db } from "@/server/db";
import { redis } from "@/server/redis";
import { CACHE_KEYS, CACHE_TTL } from "@/server/redis";
import type { Prisma, PrismaClient } from "@prisma/client";

// Types for the dashboard data
export interface DashboardData {
  user: {
    id: string;
    credits: number;
    subscriptionStatus: string;
    name: string | null;
    email: string;
  };
  stats: {
    totalDuration: number;
    weeklyDuration: number;
    lastWeekDuration: number;
    lastUpdated: Date;
  } | null;
  recentSessions: {
    id: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
    sessionType: string;
  }[];
  resumeCount: number;
}

// Cache key generators
const getDashboardCacheKey = (userId: string) =>
  `${CACHE_KEYS.USER}:${userId}:dashboard`;
const getStatsCacheKey = (userId: string) =>
  `${CACHE_KEYS.USER}:${userId}:stats`;

// Fetch all dashboard data in a single transaction
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const cacheKey = getDashboardCacheKey(userId);

  // Try to get from cache first
  const cached = await redis.get<DashboardData>(cacheKey);
  if (cached) return cached;

  // If not in cache, fetch all data in a transaction
  const data = await db.$transaction(async (tx) => {
    const [user, stats, recentSessions, resumeCount] = await Promise.all([
      tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          credits: true,
          subscriptionStatus: true,
          name: true,
          email: true,
        },
      }),
      tx.practiceStats.findUnique({
        where: { userId },
        select: {
          totalDuration: true,
          weeklyDuration: true,
          lastWeekDuration: true,
          lastUpdated: true,
        },
      }),
      tx.practiceSession.findMany({
        where: {
          userId,
          endTime: { not: null },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          duration: true,
          sessionType: true,
        },
        orderBy: { startTime: "desc" },
        take: 5,
      }),
      tx.resume.count({
        where: { userId },
      }),
    ]);

    return {
      user,
      stats,
      recentSessions,
      resumeCount,
    };
  });

  // Cache the result
  await redis.set(cacheKey, data, { ex: CACHE_TTL.SHORT });

  return data;
}

// Types for statistics data
export interface UserStatistics {
  practiceStats: {
    totalDuration: number;
    weeklyDuration: number;
    lastWeekDuration: number;
    lastUpdated: Date;
  } | null;
  sessionCounts: {
    total: number;
    completed: number;
    thisWeek: number;
  };
  resumeStats: {
    total: number;
    analyzed: number;
    optimized: number;
  };
}

// Fetch all user statistics in a single transaction
export async function getUserStatistics(
  userId: string,
): Promise<UserStatistics> {
  const cacheKey = getStatsCacheKey(userId);

  // Try to get from cache first
  const cached = await redis.get<UserStatistics>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);

  const data = await db.$transaction(async (tx) => {
    const [
      practiceStats,
      totalSessions,
      completedSessions,
      weeklySessionCount,
      resumeStats,
      analyzedCount,
    ] = await Promise.all([
      tx.practiceStats.findUnique({
        where: { userId },
        select: {
          totalDuration: true,
          weeklyDuration: true,
          lastWeekDuration: true,
          lastUpdated: true,
        },
      }),
      tx.practiceSession.count({
        where: { userId },
      }),
      tx.practiceSession.count({
        where: {
          userId,
          endTime: { not: null },
        },
      }),
      tx.practiceSession.count({
        where: {
          userId,
          startTime: { gte: weekStart },
        },
      }),
      tx.resume.count({
        where: { userId },
      }),
      tx.resumeAnalysis.count({
        where: {
          userId,
          totalScore: { gt: 0 },
        },
      }),
    ]);

    const stats: UserStatistics = {
      practiceStats,
      sessionCounts: {
        total: totalSessions,
        completed: completedSessions,
        thisWeek: weeklySessionCount,
      },
      resumeStats: {
        total: resumeStats,
        analyzed: analyzedCount,
        optimized: analyzedCount, // For now, assuming optimization happens with analysis
      },
    };

    return stats;
  });

  // Cache the result
  await redis.set(cacheKey, data, { ex: CACHE_TTL.SHORT });

  return data;
}

// Types for resume analysis data
export interface ResumeAnalysisBatch {
  analyses: {
    id: string;
    totalScore: number;
    sectionScores: Record<string, number>;
    createdAt: Date;
  }[];
  totalCount: number;
  averageScore: number;
}

// Types for practice session batch
export interface PracticeSessionBatch {
  sessions: {
    id: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
    sessionType: string;
  }[];
  totalDuration: number;
  averageScore: number;
  completionRate: number;
}

// Fetch batched resume analyses
export async function getBatchedResumeAnalyses(
  userId: string,
): Promise<ResumeAnalysisBatch> {
  const cacheKey = `${CACHE_KEYS.USER}:${userId}:resume_analyses`;

  // Try to get from cache first
  const cached = await redis.get<ResumeAnalysisBatch>(cacheKey);
  if (cached) return cached;

  const data = await db.$transaction(async (tx) => {
    const [analyses, totalCount] = await Promise.all([
      tx.resumeAnalysis.findMany({
        where: {
          userId,
          totalScore: { gt: 0 },
        },
        select: {
          id: true,
          totalScore: true,
          sectionScores: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      tx.resumeAnalysis.count({
        where: {
          userId,
          totalScore: { gt: 0 },
        },
      }),
    ]);

    const averageScore =
      analyses.reduce((acc, curr) => acc + curr.totalScore, 0) /
        analyses.length || 0;

    return {
      analyses: analyses.map((a) => ({
        ...a,
        sectionScores: a.sectionScores as Record<string, number>,
      })),
      totalCount,
      averageScore,
    };
  });

  // Cache the result
  await redis.set(cacheKey, data, { ex: CACHE_TTL.MEDIUM });

  return data;
}

// Fetch batched practice sessions
export async function getBatchedPracticeSessions(
  userId: string,
): Promise<PracticeSessionBatch> {
  const cacheKey = `${CACHE_KEYS.USER}:${userId}:practice_sessions`;

  // Try to get from cache first
  const cached = await redis.get<PracticeSessionBatch>(cacheKey);
  if (cached) return cached;

  const data = await db.$transaction(async (tx) => {
    const [sessions, stats] = await Promise.all([
      tx.practiceSession.findMany({
        where: { userId },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          duration: true,
          sessionType: true,
        },
        orderBy: { startTime: "desc" },
        take: 10,
      }),
      tx.practiceStats.findUnique({
        where: { userId },
        select: {
          totalDuration: true,
        },
      }),
    ]);

    const completedSessions = sessions.filter((s) => s.endTime !== null);
    const completionRate = (completedSessions.length / sessions.length) * 100;
    const averageScore =
      completedSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) /
        completedSessions.length || 0;

    return {
      sessions,
      totalDuration: stats?.totalDuration || 0,
      averageScore,
      completionRate,
    };
  });

  // Cache the result
  await redis.set(cacheKey, data, { ex: CACHE_TTL.SHORT });

  return data;
}

// Update cache invalidation to include new caches
export async function invalidateUserCaches(userId: string) {
  await Promise.all([
    redis.del(getDashboardCacheKey(userId)),
    redis.del(getStatsCacheKey(userId)),
    redis.del(`${CACHE_KEYS.USER}:${userId}:resume_analyses`),
    redis.del(`${CACHE_KEYS.USER}:${userId}:practice_sessions`),
  ]);
}
