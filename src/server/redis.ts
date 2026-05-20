type StoreEntry = {
  value: unknown;
  expiresAt?: number;
};

const store = new Map<string, StoreEntry>();

function isExpired(entry: StoreEntry | undefined): boolean {
  return !!entry?.expiresAt && Date.now() > entry.expiresAt;
}

function cleanupIfExpired(key: string) {
  const entry = store.get(key);
  if (entry && isExpired(entry)) {
    store.delete(key);
    return true;
  }
  return false;
}

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    if (cleanupIfExpired(key)) return null;
    const entry = store.get(key);
    return (entry?.value as T) ?? null;
  },

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<"OK"> {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    store.set(key, { value, expiresAt });
    return "OK";
  },

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (store.delete(key)) count++;
    }
    return count;
  },

  async keys(pattern: string): Promise<string[]> {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);

    const results: string[] = [];
    for (const key of store.keys()) {
      cleanupIfExpired(key);
      if (store.has(key) && regex.test(key)) results.push(key);
    }
    return results;
  },

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = current + 1;
    await this.set(key, next);
    return next;
  },

  async expire(key: string, seconds: number): Promise<"OK"> {
    const entry = store.get(key);
    if (!entry) return "OK";
    entry.expiresAt = Date.now() + seconds * 1000;
    store.set(key, entry);
    return "OK";
  },
};

export const CACHE_TTL = {
  SHORT: 60 * 5,
  MEDIUM: 60 * 30,
  LONG: 60 * 60 * 24,
  SESSION: 60 * 60 * 24 * 30,
};

export const CACHE_KEYS = {
  SESSION: "session",
  USER: "user",
  STATS: "stats",
};

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await redis.set(key, data, { ex: ttl });
  return data;
}

export const sessionCache = {
  async get(token: string) {
    return redis.get(`${CACHE_KEYS.SESSION}:${token}`);
  },
  async set(token: string, data: unknown) {
    return redis.set(`${CACHE_KEYS.SESSION}:${token}`, data, {
      ex: CACHE_TTL.SESSION,
    });
  },
  async delete(token: string) {
    return redis.del(`${CACHE_KEYS.SESSION}:${token}`);
  },
};

export const userCache = {
  async get(id: string) {
    return redis.get(`${CACHE_KEYS.USER}:${id}`);
  },
  async set(id: string, data: unknown) {
    return redis.set(`${CACHE_KEYS.USER}:${id}`, data, {
      ex: CACHE_TTL.MEDIUM,
    });
  },
  async delete(id: string) {
    return redis.del(`${CACHE_KEYS.USER}:${id}`);
  },
};
