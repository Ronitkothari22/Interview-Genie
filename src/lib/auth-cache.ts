import { cache, redis, CACHE_KEYS } from "./redis";
import type { User } from "next-auth";

const AUTH_CACHE_TTL = 5 * 60; // 5 minutes

interface AuthCache {
  user: User;
  sessionToken: string;
  expiresAt: number;
}

export const authCache = {
  async getSession(sessionToken: string): Promise<AuthCache | null> {
    return cache(
      `${CACHE_KEYS.SESSION}:${sessionToken}`,
      async () => {
        // This will return null if no session exists
        return redis.get<AuthCache>(`${CACHE_KEYS.SESSION}:${sessionToken}`);
      },
      {
        ttl: AUTH_CACHE_TTL,
        staleWhileRevalidate: true,
        tags: ["session"],
      },
    );
  },

  async setSession(sessionToken: string, data: AuthCache): Promise<void> {
    await redis.set(`${CACHE_KEYS.SESSION}:${sessionToken}`, data, {
      ex: AUTH_CACHE_TTL,
    });
  },

  async removeSession(sessionToken: string): Promise<void> {
    await redis.del(`${CACHE_KEYS.SESSION}:${sessionToken}`);
  },

  async getUserById(userId: string): Promise<User | null> {
    return cache(
      `${CACHE_KEYS.USER}:${userId}`,
      async () => {
        // This will return null if no user exists
        return redis.get<User>(`${CACHE_KEYS.USER}:${userId}`);
      },
      {
        ttl: AUTH_CACHE_TTL,
        staleWhileRevalidate: true,
        tags: ["user"],
      },
    );
  },

  async setUser(userId: string, user: User): Promise<void> {
    await redis.set(`${CACHE_KEYS.USER}:${userId}`, user, {
      ex: AUTH_CACHE_TTL,
    });
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
  async checkRateLimit(
    key: string,
    maxAttempts: number = 5,
    windowSeconds: number = 300, // 5 minutes
  ): Promise<boolean> {
    const attempts = await redis.incr(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
    if (attempts === 1) {
      await redis.expire(`${CACHE_KEYS.RATE_LIMIT}:${key}`, windowSeconds);
    }
    return attempts <= maxAttempts;
  },

  // Get remaining attempts
  async getRemainingAttempts(
    key: string,
    maxAttempts: number = 5,
  ): Promise<number> {
    const attempts = await redis.get<number>(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
    return Math.max(0, maxAttempts - (attempts ?? 0));
  },

  // Clear rate limit
  async clearRateLimit(key: string): Promise<void> {
    await redis.del(`${CACHE_KEYS.RATE_LIMIT}:${key}`);
  },
};
