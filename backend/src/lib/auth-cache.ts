import { cache, redis, CACHE_KEYS } from "@/lib/redis.js";
import type { SessionUser } from "@/shared/types/session.js";

const AUTH_CACHE_TTL = 5 * 60; // 5 minutes

interface AuthCache {
  user: SessionUser;
  sessionToken: string;
  expiresAt: number;
}

/**
 * Auth-related cache + rate limiting. Rate-limit counters are keyed by the
 * caller (e.g. `login:<email>:<ip>`) and backed by the in-memory store.
 */
export const authCache = {
  async getSession(sessionToken: string): Promise<AuthCache | null> {
    return cache(
      `${CACHE_KEYS.SESSION}:${sessionToken}`,
      async () => redis.get<AuthCache>(`${CACHE_KEYS.SESSION}:${sessionToken}`),
      { ttl: AUTH_CACHE_TTL, staleWhileRevalidate: true, tags: ["session"] },
    );
  },

  async setSession(sessionToken: string, data: AuthCache): Promise<void> {
    await redis.set(`${CACHE_KEYS.SESSION}:${sessionToken}`, data, { ex: AUTH_CACHE_TTL });
  },

  async removeSession(sessionToken: string): Promise<void> {
    await redis.del(`${CACHE_KEYS.SESSION}:${sessionToken}`);
  },

  async getUserById(userId: string): Promise<SessionUser | null> {
    return cache(
      `${CACHE_KEYS.USER}:${userId}`,
      async () => redis.get<SessionUser>(`${CACHE_KEYS.USER}:${userId}`),
      { ttl: AUTH_CACHE_TTL, staleWhileRevalidate: true, tags: ["user"] },
    );
  },

  async setUser(userId: string, user: SessionUser): Promise<void> {
    await redis.set(`${CACHE_KEYS.USER}:${userId}`, user, { ex: AUTH_CACHE_TTL });
  },

  async removeUser(userId: string): Promise<void> {
    await redis.del(`${CACHE_KEYS.USER}:${userId}`);
  },

  async invalidateUserSessions(userId: string): Promise<void> {
    const sessionKeys = await redis.keys(`${CACHE_KEYS.SESSION}:*`);
    for (const key of sessionKeys) {
      const session = await redis.get<AuthCache>(key);
      if (session?.user.id === userId) {
        await redis.del(key);
      }
    }
    await this.removeUser(userId);
  },

  // Rate limiting for auth attempts
  async checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 300): Promise<boolean> {
    const attempts = await redis.incr(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
    if (attempts === 1) {
      await redis.expire(`${CACHE_KEYS.RATE_LIMIT}:${key}`, windowSeconds);
    }
    return attempts <= maxAttempts;
  },

  async getRemainingAttempts(key: string, maxAttempts = 5): Promise<number> {
    const attempts = await redis.get<number>(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
    return Math.max(0, maxAttempts - (attempts ?? 0));
  },

  async clearRateLimit(key: string): Promise<void> {
    await redis.del(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
  },
};
