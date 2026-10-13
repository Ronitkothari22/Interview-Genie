import type { CookieOptions } from "express";

import { env } from "@/config/env.js";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/jwt.js";

/** Name of the httpOnly session cookie holding the JWT. */
export const SESSION_COOKIE_NAME = "ig_session";

/** Short-lived cookie used to validate the Google OAuth state parameter. */
export const OAUTH_STATE_COOKIE_NAME = "ig_oauth_state";

/**
 * Base cookie attributes. `sameSite=lax` + `httpOnly` protects against CSRF and
 * XSS. Cookies ignore ports, so in dev the cookie set by `localhost:4000` is
 * also sent to `localhost:3000`. In production set `COOKIE_DOMAIN=.yourdomain`
 * so it is shared across subdomains.
 */
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

/** Options for clearing the session cookie (no maxAge/expiry). */
export const clearSessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

/** Options for the transient OAuth state cookie (10 minutes). */
export const oauthStateCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: 10 * 60 * 1000,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};
