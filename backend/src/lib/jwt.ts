import { SignJWT, jwtVerify } from "jose";

import { env } from "@/config/env.js";
import type { SessionUser } from "@/shared/types/session.js";

const ALGORITHM = "HS256";
const secret = new TextEncoder().encode(env.AUTH_SECRET);

/** Session lifetime — 30 days, matching the previous NextAuth config. */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Claims carried by the session cookie JWT. */
export interface SessionTokenClaims {
  sub: string;
  email: string;
  name: string | null;
  image: string | null;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

/** Sign a session JWT for an authenticated user. */
export async function issueSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    image: user.image,
    credits: user.credits,
    subscriptionStatus: user.subscriptionStatus,
    isVerified: user.isVerified,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

/** Verify a session JWT and return its claims, or `null` when invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      image: typeof payload.image === "string" ? payload.image : null,
      credits: typeof payload.credits === "number" ? payload.credits : 0,
      subscriptionStatus:
        typeof payload.subscriptionStatus === "string" ? payload.subscriptionStatus : "free",
      isVerified: payload.isVerified === true,
    };
  } catch {
    return null;
  }
}
