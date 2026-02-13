import { db } from "@/server/db";
import { redis } from "@/server/redis";
import { CACHE_KEYS, CACHE_TTL } from "@/server/redis";
import type { User } from "@prisma/client";

// Type for the minimal user data we need most often
interface CachedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

// Cache key generator
const getUserCacheKey = (params: { id?: string; email?: string }) => {
  if (params.id) return `${CACHE_KEYS.USER}:id:${params.id}`;
  if (params.email) return `${CACHE_KEYS.USER}:email:${params.email}`;
  throw new Error("Either id or email must be provided");
};

// Get user with caching
export async function getUser(params: {
  id?: string;
  email?: string;
}): Promise<CachedUser | null> {
  const cacheKey = getUserCacheKey(params);

  // Try to get from cache first
  const cached = await redis.get<CachedUser>(cacheKey);
  if (cached) return cached;

  // If not in cache, fetch from database
  const user = await db.user.findUnique({
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

  // Cache the result
  await redis.set(cacheKey, user, { ex: CACHE_TTL.MEDIUM });

  // Also cache by the other key if we have both id and email
  if (params.id && user.email) {
    await redis.set(getUserCacheKey({ email: user.email }), user, {
      ex: CACHE_TTL.MEDIUM,
    });
  } else if (params.email && user.id) {
    await redis.set(getUserCacheKey({ id: user.id }), user, {
      ex: CACHE_TTL.MEDIUM,
    });
  }

  return user;
}

// Invalidate user cache
export async function invalidateUserCache(params: {
  id?: string;
  email?: string;
}) {
  const promises: Promise<any>[] = [];

  if (params.id) {
    promises.push(redis.del(getUserCacheKey({ id: params.id })));
  }

  if (params.email) {
    promises.push(redis.del(getUserCacheKey({ email: params.email })));
  }

  await Promise.all(promises);
}

// Update user with cache invalidation
export async function updateUser(
  where: { id: string } | { email: string },
  data: Partial<User>,
) {
  const user = await db.user.update({
    where,
    data,
  });

  // Invalidate both ID and email caches
  await invalidateUserCache({
    id: user.id,
    email: user.email,
  });

  return user;
}
