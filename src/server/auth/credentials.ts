import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { env } from "@/env";
import { authCache } from "@/lib/auth-cache";
import type { User } from "next-auth";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    hashedPassword?: string | null;
    credits: number;
    subscriptionStatus: string;
    isVerified: boolean;
  }
}

async function verifyCredentials(
  email: string,
  password: string,
  req: Request,
): Promise<{ user: User | null; error?: string }> {
  try {
    // Rate limiting: 3 attempts per 5 minutes per IP
    const ipAddress =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const rateLimitKey = `login:${email}:${ipAddress}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey);

    if (!isAllowed) {
      const remainingTime = await authCache.getRemainingAttempts(rateLimitKey);
      return {
        user: null,
        error: `Too many attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`,
      };
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        hashedPassword: true,
        isVerified: true,
        credits: true,
        subscriptionStatus: true,
      },
    });

    if (!user?.hashedPassword) {
      return { user: null, error: "Invalid credentials" };
    }

    if (!user.isVerified) {
      return {
        user: null,
        error: "Please verify your email before logging in",
      };
    }

    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      // Increment rate limit counter silently
      void authCache.checkRateLimit(rateLimitKey);
      return { user: null, error: "Invalid credentials" };
    }

    // Clear rate limit on successful login
    await authCache.clearRateLimit(rateLimitKey);

    return {
      user: {
        id: user.id,
        name: user.name ?? null,
        email: user.email,
        image: user.image ?? null,
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus ?? "free",
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    // Only log unexpected errors, not auth failures
    if (!(error instanceof Error)) {
      console.error("Unexpected login error:", error);
    }
    return { user: null, error: "An unexpected error occurred" };
  }
}

// Export the NextAuth credentials provider
export const credentialsProvider = CredentialsProvider({
  id: "credentials",
  name: "credentials",
  credentials: {
    email: {
      label: "Email",
      type: "email",
      placeholder: "hello@example.com",
    },
    password: {
      label: "Password",
      type: "password",
      placeholder: "••••••••",
    },
  },
  async authorize(credentials, request) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    const req = new Request(request.url ?? env.NEXT_PUBLIC_APP_URL, {
      headers: request.headers,
      method: request.method,
    });

    const { user, error } = await verifyCredentials(
      credentials.email as string,
      credentials.password as string,
      req,
    );

    // Return null for expected auth failures without throwing
    if (error || !user) {
      return null;
    }

    return user;
  },
});
