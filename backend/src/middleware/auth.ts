import type { NextFunction, Request, Response } from "express";

import { SESSION_COOKIE_NAME } from "@/config/cookies.js";
import { verifySessionToken } from "@/lib/jwt.js";
import { getUser } from "@/lib/user-cache.js";
import type { SessionUser } from "@/shared/types/session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the auth middleware when a valid session is present. */
      user?: SessionUser;
    }
  }
}

/**
 * Resolve the current user from the session cookie.
 * Replaces the monolith's NextAuth `auth()` / `requireAuth` helpers.
 */
export async function authenticateRequest(req: Request): Promise<SessionUser | null> {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  // Prefer fresh DB data (credits/subscription can change); fall back to claims.
  const dbUser = await getUser({ id: claims.sub });
  if (dbUser) return dbUser;

  return {
    id: claims.sub,
    email: claims.email,
    name: claims.name,
    image: claims.image,
    credits: claims.credits,
    subscriptionStatus: claims.subscriptionStatus,
    isVerified: claims.isVerified,
  };
}

/** Require a valid session; responds 401 when absent/invalid. */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/** Attach `req.user` when a session exists, but never block the request. */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticateRequest(req);
    if (user) req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
