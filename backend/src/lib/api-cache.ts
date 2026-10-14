import type { Response } from "express";

import { db } from "@/config/prisma.js";
import { cache, revalidateTag } from "@/lib/redis.js";

export { cache, revalidateTag };

/**
 * Send cached JSON with the monolith's `s-maxage` headers.
 * Ported from the monolith's `src/lib/api-cache.ts` (Next `Response` → Express `Response`).
 */
export function createCachedResponse(
  res: Response,
  data: unknown,
  init?: { status?: number; headers?: Record<string, string> },
) {
  return res
    .status(init?.status ?? 200)
    .set({
      ...init?.headers,
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    })
    .json(data);
}

// Cache user data fetching
export const getUserData = (userId: string) =>
  cache(
    `user:${userId}`,
    async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          credits: true,
          subscriptionStatus: true,
          isVerified: true,
        },
      });
      return user;
    },
    {
      ttl: 300, // Cache for 5 minutes
      tags: ["user"],
    },
  );
