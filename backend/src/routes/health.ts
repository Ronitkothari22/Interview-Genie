import { Router } from "express";

import { db } from "@/config/prisma.js";
import { checkRedisConnection, testRedisFeatures } from "@/lib/redis.js";

export const healthRouter = Router();

interface ServiceCheck {
  ok: boolean;
  latency: number;
  error?: string;
}

async function checkDatabaseHealth(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    await db.user.count();
    return { ok: true, latency: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Database check failed",
      latency: Date.now() - start,
    };
  }
}

/** GET /api/health — database + cache readiness probe. */
healthRouter.get("/", async (_req, res) => {
  const start = Date.now();

  try {
    const [redisStatus, dbStatus] = await Promise.all([
      checkRedisConnection(),
      checkDatabaseHealth(),
    ]);

    const redisFeatures = await testRedisFeatures();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      latency: Date.now() - start,
      services: {
        redis: {
          status: redisStatus.ok ? "healthy" : "unhealthy",
          latency: redisStatus.latency,
          error: redisStatus.error,
          features: redisFeatures.results,
        },
        database: {
          status: dbStatus.ok ? "healthy" : "unhealthy",
          latency: dbStatus.latency,
          error: dbStatus.error,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Health check failed",
      latency: Date.now() - start,
    });
  }
});
