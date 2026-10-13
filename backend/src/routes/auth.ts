import bcrypt from "bcryptjs";
import { Router, type Request } from "express";

import {
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  clearSessionCookieOptions,
  oauthStateCookieOptions,
  sessionCookieOptions,
} from "@/config/cookies.js";
import { env } from "@/config/env.js";
import { prisma } from "@/config/prisma.js";
import { authCache } from "@/lib/auth-cache.js";
import { issueSessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/jwt.js";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit.js";
import { sessionCache } from "@/lib/redis.js";
import { generateOTP, generateToken, sha1, sha256 } from "@/lib/utils.js";
import { invalidateUserCache } from "@/lib/user-cache.js";
import { authenticateRequest } from "@/middleware/auth.js";
import { sendEmail } from "@/services/email.js";
import { generateResetToken, validateResetToken } from "@/services/password-reset.js";
import { generateOTPEmail } from "@/templates/email/otp-verification.js";
import { generatePasswordResetEmail } from "@/templates/email/password-reset.js";
import { generateWelcomeEmail } from "@/templates/email/welcome.js";
import type { SessionUser } from "@/shared/types/session.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resendOTPSchema,
  resetPasswordSchema,
  signupSchema,
  verifyOTPSchema,
} from "@/shared/validations/auth.js";

export const authRouter = Router();

/** Projection shared by every read that produces a `SessionUser`. */
const sessionUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  credits: true,
  subscriptionStatus: true,
  isVerified: true,
} as const;

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

interface GoogleProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/** Public base URL of this backend, used to build OAuth redirect URIs. */
function getBackendUrl(req: Request): string {
  if (env.BACKEND_URL) return env.BACKEND_URL.replace(/\/$/, "");

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? req.protocol;
  return `${proto}://${req.get("host")}`;
}

/** Send the OTP + welcome emails (best effort; never throws). */
async function sendSignupEmails(email: string, name: string, otp: string): Promise<boolean> {
  try {
    const verificationResult = await sendEmail({
      to: email,
      subject: "Verify your email - Interview Genie",
      html: generateOTPEmail(name, otp),
    });

    if (!verificationResult.success) {
      console.error("Failed to send verification email:", verificationResult.error);
      return false;
    }

    void sendEmail({
      to: email,
      subject: "Welcome to Interview Genie! 🎉",
      html: generateWelcomeEmail(name),
    }).catch((error) => console.error("Failed to send welcome email:", error));

    return true;
  } catch (error) {
    console.error("Error in sendSignupEmails:", error);
    return false;
  }
}

/**
 * POST /api/auth/signup — create a user, issue an OTP, send OTP + welcome email.
 */
authRouter.post("/signup", async (req, res, next) => {
  try {
    if (!(await applyRateLimit(req, res, "signup", 5, 60 * 1000))) return;

    const { name, email, password } = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        emailVerified: null,
        image: null,
        credits: 100,
        subscriptionStatus: "free",
        isVerified: false,
      },
      select: { id: true, name: true, email: true },
    });

    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    if (env.NODE_ENV === "production") {
      const emailSent = await sendSignupEmails(email, name, otp);
      if (!emailSent) console.error("Failed to send OTP email in production");
    } else {
      void sendSignupEmails(email, name, otp);
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login — credentials login; issues the session cookie JWT.
 */
authRouter.post("/login", async (req, res, next) => {
  try {
    if (!(await applyRateLimit(req, res, "login", 10, 5 * 60 * 1000))) return;

    const { email, password } = loginSchema.parse(req.body);

    const ip = getClientIp(req);
    const rateLimitKey = `login:${email}:${ip}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 3, 300);

    if (!isAllowed) {
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { ...sessionUserSelect, hashedPassword: true },
    });

    if (!user?.hashedPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: "Please verify your email before logging in" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      void authCache.checkRateLimit(rateLimitKey, 3, 300);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    await authCache.clearRateLimit(rateLimitKey);

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      credits: user.credits,
      subscriptionStatus: user.subscriptionStatus,
      isVerified: user.isVerified,
    };

    const token = await issueSessionToken(sessionUser);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    res.json({ success: true, user: sessionUser });
  } catch (error) {
    next(error);
  }
});

/** POST /api/auth/logout — clear the session cookie. */
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
  res.json({ success: true });
});

/** GET /api/auth/session — return the current user (or null). */
authRouter.get("/session", async (req, res, next) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      res.json({ user: null });
      return;
    }

    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
    res.json({ user, expires });
  } catch (error) {
    next(error);
  }
});

/** GET /api/auth/google — begin the Google OAuth consent flow. */
authRouter.get("/google", (req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(500).json({ error: "Google OAuth is not configured" });
    return;
  }

  const state = generateToken(16);
  res.cookie(OAUTH_STATE_COOKIE_NAME, state, oauthStateCookieOptions);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${getBackendUrl(req)}/api/auth/google/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  res.redirect(authUrl.toString());
});

/** GET /api/auth/google/callback — exchange code, upsert user/account, issue JWT. */
authRouter.get("/google/callback", async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies?.[OAUTH_STATE_COOKIE_NAME] as string | undefined;
    res.clearCookie(OAUTH_STATE_COOKIE_NAME, oauthStateCookieOptions);

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      !storedState ||
      state !== storedState
    ) {
      res.redirect(`${env.FRONTEND_URL}/login?error=oauth_state`);
      return;
    }

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      res.redirect(`${env.FRONTEND_URL}/login?error=oauth_config`);
      return;
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${getBackendUrl(req)}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", await tokenResponse.text());
      res.redirect(`${env.FRONTEND_URL}/login?error=oauth_token`);
      return;
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token ?? ""}` },
    });

    if (!profileResponse.ok) {
      console.error("Google userinfo fetch failed:", await profileResponse.text());
      res.redirect(`${env.FRONTEND_URL}/login?error=oauth_profile`);
      return;
    }

    const profile = (await profileResponse.json()) as GoogleProfile;

    if (!profile.email) {
      res.redirect(`${env.FRONTEND_URL}/login?error=oauth_profile`);
      return;
    }

    const name = profile.name ?? null;
    const image = profile.picture ?? null;

    const existing = await prisma.user.findUnique({ where: { email: profile.email } });

    const userId = existing
      ? (
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              emailVerified: new Date(),
              ...(name ? { name } : {}),
              ...(image ? { image } : {}),
            },
          })
        ).id
      : (
          await prisma.user.create({
            data: {
              email: profile.email,
              name,
              image,
              emailVerified: new Date(),
              isVerified: true,
              credits: 100,
              subscriptionStatus: "free",
            },
          })
        ).id;

    const expiresAt = tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null;

    const accountData = {
      userId,
      type: "oauth",
      provider: "google",
      providerAccountId: profile.sub,
      access_token: tokens.access_token ?? null,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      token_type: tokens.token_type ?? null,
      scope: tokens.scope ?? null,
      id_token: tokens.id_token ?? null,
    };

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: { provider: "google", providerAccountId: profile.sub },
      },
      update: accountData,
      create: accountData,
    });

    await invalidateUserCache({ id: userId, email: profile.email });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: sessionUserSelect,
    });

    const token = await issueSessionToken(user);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    next(error);
  }
});

/** POST /api/auth/verify-otp — verify a signup OTP and mark the user verified. */
authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const { userId, otp } = verifyOTPSchema.parse(req.body);

    const rateLimitKey = `verify-otp:${userId}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 5, 300);
    if (!isAllowed) {
      res.status(429).json({ error: "Too many attempts. Please try again later." });
      return;
    }

    const otpRecord = await prisma.oTPVerification.findFirst({
      where: { userId, otp, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { isVerified: true } }),
      prisma.oTPVerification.deleteMany({ where: { userId } }),
    ]);

    await authCache.clearRateLimit(rateLimitKey);
    await authCache.invalidateUserSessions(userId);
    await invalidateUserCache({ id: userId });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
});

/** POST /api/auth/verify/resend — issue + email a fresh OTP. */
authRouter.post("/verify/resend", async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const rateLimitKey = `resend-otp:${ip}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 3, 300);
    if (!isAllowed) {
      res.status(429).json({ error: "Too many attempts" });
      return;
    }

    const { email } = resendOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        isVerified: true,
        otpVerifications: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    const lastOTP = user.otpVerifications[0];
    if (lastOTP) {
      const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
      if (timeSinceLastOTP < 60000) {
        res.status(429).json({
          error: "Please wait before requesting another code",
          remainingSeconds: Math.ceil((60000 - timeSinceLastOTP) / 1000),
        });
        return;
      }
    }

    const otp = generateOTP();

    await prisma.$transaction(async (tx) => {
      await tx.oTPVerification.deleteMany({ where: { userId: user.id } });
      await tx.oTPVerification.create({
        data: {
          userId: user.id,
          otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    });

    const name = user.name ?? "User";

    if (env.NODE_ENV === "production") {
      const result = await sendEmail({
        to: email,
        subject: "New Verification Code - Interview Genie",
        html: generateOTPEmail(name, otp),
      });
      if (!result.success) {
        res.status(500).json({ error: "Failed to send verification code" });
        return;
      }
    } else {
      void sendEmail({
        to: email,
        subject: "New Verification Code - Interview Genie",
        html: generateOTPEmail(name, otp),
      });
    }

    res.json({ success: true, message: "New verification code sent" });
  } catch (error) {
    next(error);
  }
});

/** POST /api/auth/forgot-password — issue a reset token and email the link. */
authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the account exists.
    if (!user) {
      res.json({ success: true });
      return;
    }

    const resetToken = await generateResetToken(user);
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Interview Genie",
      html: generatePasswordResetEmail(user.name ?? "User", resetLink),
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/** POST /api/auth/reset-password — validate token (HIBP check) and set password. */
authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Reject passwords that appear in known breaches (HIBP k-anonymity range).
    // The Pwned Passwords API only accepts SHA-1 hashes.
    const passwordHash = sha1(password);
    const prefix = passwordHash.slice(0, 5);
    const suffix = passwordHash.slice(5);

    try {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (response.ok) {
        const hashes = await response.text();
        const breached = hashes
          .split("\n")
          .filter(Boolean)
          .some((line) => line.split(":")[0]?.toLowerCase() === suffix.toLowerCase());

        if (breached) {
          res.status(400).json({
            error:
              "This password has been exposed in data breaches. Please choose a different password.",
          });
          return;
        }
      } else {
        console.error("Failed to check password breach database");
      }
    } catch (error) {
      console.error("Password breach check failed:", error);
      // Continue with the reset even if the external check fails.
    }

    const isValid = await validateResetToken(token);
    if (!isValid) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const hashedToken = sha256(token);
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token: hashedToken, expires: { gt: new Date() } },
      include: { user: true },
    });

    if (!resetToken?.user) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: resetToken.user.id },
      data: {
        hashedPassword: await bcrypt.hash(password, 12),
        passwordResetTokens: { deleteMany: { token: hashedToken } },
      },
    });

    // Best-effort session invalidation (JWT sessions can't be hard-revoked, but
    // this clears any adapter sessions + cached data, matching prior behavior).
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      select: { sessionToken: true },
    });

    await Promise.all([
      prisma.session.deleteMany({ where: { userId: user.id } }),
      ...sessions.map((session) => sessionCache.delete(session.sessionToken)),
      invalidateUserCache({ id: user.id, email: user.email }),
    ]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
