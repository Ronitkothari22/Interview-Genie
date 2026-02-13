import { NextResponse } from "next/server";
import { checkRedisConnection, testRedisFeatures } from "@/lib/redis";
import { db } from "@/lib/db";

async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await db.user.count();
    return {
      ok: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Database check failed",
      latency: Date.now() - start,
    };
  }
}

export async function GET() {
  const start = Date.now();

  try {
    // Run health checks in parallel
    const [redisStatus, dbStatus] = await Promise.all([
      checkRedisConnection(),
      checkDatabaseHealth(),
    ]);

    // Get detailed Redis features status
    const redisFeatures = await testRedisFeatures();

    const healthData = {
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
    };

    return NextResponse.json(healthData);
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
        latency: Date.now() - start,
      },
      { status: 500 },
    );
  }
}
