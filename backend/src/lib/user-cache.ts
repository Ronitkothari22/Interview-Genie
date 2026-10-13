import type { User } from "@prisma/client";

import { prisma } from "@/config/prisma.js";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis.js";
import type { SessionUser } from "@/shared/types/session.js";

// Cache key generator for the minimal user projection.
const getUserCacheKey = (params: { id?: string; email?: string }): string => {
  if (params.id) return `${CACHE_KEYS.USER}id:${params.id}`;
  if (params.email) return `${CACHE_KEYS.USER}email:${params.email}`;
  throw new Error("Either id or email must be provided");
};

/** Fetch a user by id or email, using the in-memory cache when possible. */
export async function getUser(params: { id?: string; email?: string }): Promise<SessionUser | null> {
  const cacheKey = getUserCacheKey(params);

  const cached = await redis.get<SessionUser>(cacheKey);
  if (cached) return cached;

  const user = await prisma.user.findUnique({
    where: params.id ? { id: params.id } : { email: params.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      credits: true,
      subscriptionStatus: true,
      isVerified: true,
    },
  });

  if (!user) return null;

  await redis.set(cacheKey, user, { ex: CACHE_TTL.MEDIUM });

  // Also cache by the complementary key so both lookups hit.
  if (params.id && user.email) {
    await redis.set(getUserCacheKey({ email: user.email }), user, { ex: CACHE_TTL.MEDIUM });
  } else if (params.email && user.id) {
    await redis.set(getUserCacheKey({ id: user.id }), user, { ex: CACHE_TTL.MEDIUM });
  }

  return user;
}

/** Drop cached copies of a user. */
export async function invalidateUserCache(params: { id?: string; email?: string }): Promise<void> {
  const promises: Promise<number>[] = [];

  if (params.id) promises.push(redis.del(getUserCacheKey({ id: params.id })));
  if (params.email) promises.push(redis.del(getUserCacheKey({ email: params.email })));

  await Promise.all(promises);
}

/** Update a user and invalidate its cache entries. */
export async function updateUser(
  where: { id: string } | { email: string },
  data: Partial<User>,
): Promise<User> {
  const user = await prisma.user.update({ where, data });

  await invalidateUserCache({ id: user.id, email: user.email });

  return user;
}
