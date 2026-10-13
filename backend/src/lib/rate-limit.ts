import type { Request, Response } from "express";

interface RateLimitStore {
  timestamp: number;
  count: number;
}

const stores = new Map<string, Map<string, RateLimitStore>>();

class RateLimit {
  private store: Map<string, RateLimitStore>;

  constructor(private name: string) {
    if (!stores.has(name)) {
      stores.set(name, new Map());
    }
    this.store = stores.get(name)!;
  }

  async check(key: string, limit: number, windowMs = 60000) {
    const now = Date.now();
    const store = this.store.get(key) ?? { timestamp: now, count: 0 };

    // Reset if outside window
    if (now - store.timestamp > windowMs) {
      store.timestamp = now;
      store.count = 0;
    }

    store.count++;
    this.store.set(key, store);

    // Opportunistic cleanup of stale entries.
    if (now % (5 * 60 * 1000) < 1000) {
      this.cleanup(windowMs);
    }

    return {
      success: store.count <= limit,
      current: store.count,
      limit,
      remaining: Math.max(0, limit - store.count),
      reset: store.timestamp + windowMs,
    };
  }

  private cleanup(windowMs: number) {
    const now = Date.now();
    for (const [key, store] of this.store.entries()) {
      if (now - store.timestamp > windowMs) {
        this.store.delete(key);
      }
    }
  }
}

/** Resolve the client IP, honouring common proxy headers. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    (req.headers["x-real-ip"] as string | undefined) ||
    (req.headers["cf-connecting-ip"] as string | undefined) ||
    (req.headers["true-client-ip"] as string | undefined) ||
    req.ip ||
    "127.0.0.1"
  );
}

/**
 * Apply a fixed-window rate limit. When the limit is exceeded this writes a 429
 * response (including `Retry-After`) and returns `false`; callers should then
 * stop processing. Returns `true` when the request may proceed.
 */
export async function applyRateLimit(
  req: Request,
  res: Response,
  identifier: string,
  limit: number,
  windowMs = 60000,
): Promise<boolean> {
  const ip = getClientIp(req);
  const key = `${ip}:${identifier}`;

  const rateLimit = new RateLimit(identifier);
  const result = await rateLimit.check(key, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    res
      .status(429)
      .set({
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      })
      .json({ error: "Too many requests. Please try again later." });
    return false;
  }

  return true;
}
