import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "@/server/auth/adapter";
import { db } from "@/server/db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { credentialsProvider } from "@/server/auth/credentials";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";
import type { AdapterSession } from "next-auth/adapters";
import type { Session } from "next-auth";
import { env } from "@/env";
import { redis } from "@/server/redis";
import { getUser, invalidateUserCache, updateUser } from "@/lib/user-cache";

// Extend the User type to include our custom fields
interface CustomUser extends User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: Date | null;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

// Extend the JWT type to include our custom fields
interface CustomJWT extends JWT {
  id: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

export const authConfig = {
  adapter: CustomPrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-otp",
    newUser: "/register",
  },
  providers: [
    credentialsProvider,
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          credits: 100,
          subscriptionStatus: "free",
          isVerified: true,
        };
      },
    }),
    GitHubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          emailVerified: null,
          credits: 100,
          subscriptionStatus: "free",
          isVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add cache invalidation on token updates
      if (token?.jti && (trigger === "signIn" || trigger === "update")) {
        await redis.del(`session:${token.jti}`);
      }

      // If this is a sign in or we have an email in the token
      if ((trigger === "signIn" && user) || token?.email) {
        try {
          // Use our cached user utility
          const email = user?.email ?? token.email;
          if (!email) {
            console.warn("No email found in token or user");
            return null;
          }

          const dbUser = await getUser({ email });

          // If user doesn't exist in the database anymore, invalidate the token
          if (!dbUser) {
            console.warn(`User not found in database: ${email}`);
            return null;
          }

          // Update token with latest user data
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name ?? "";
          token.image = dbUser.image ?? undefined;
          token.credits = dbUser.credits;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.isVerified = dbUser.isVerified;
        } catch (error) {
          console.error("Error fetching user data:", error);
          return null;
        }
      }

      if (trigger === "update" && session) {
        await redis.del(`session:${token.jti}`);
        const updatedToken = {
          ...token,
          ...session.user,
        };
        return updatedToken as CustomJWT;
      }

      return token as CustomJWT;
    },
    async session({ session, token }) {
      // If no token, return an empty session
      if (!token) {
        return {
          ...session,
          user: undefined,
          expires: new Date().toISOString(),
        };
      }

      const customToken = token as CustomJWT;

      if (customToken && session.user) {
        // Ensure all token data is properly synced to session
        session.user = {
          ...session.user,
          id: customToken.id,
          email: customToken.email,
          name: customToken.name,
          image: customToken.image,
          credits: customToken.credits,
          subscriptionStatus: customToken.subscriptionStatus,
          isVerified: customToken.isVerified,
        } as CustomUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Clean and normalize the URL
      const cleanUrl = decodeURIComponent(url).trim();

      // If the url is relative, prefix it with the base URL
      if (cleanUrl.startsWith("/")) {
        return `${baseUrl}${cleanUrl}`;
      }
      // If the url is already absolute but on the same origin, allow it
      else if (new URL(cleanUrl).origin === baseUrl) {
        return cleanUrl;
      }
      // Default to redirecting to the dashboard for new users
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signIn({ user, isNewUser, account }) {
      if (!user?.email) return;

      try {
        if (isNewUser) {
          await updateUser(
            { email: user.email },
            {
              credits: 100,
              subscriptionStatus: "free",
              isVerified: true,
              emailVerified: new Date(),
              ...(typeof user.name === "string" ? { name: user.name } : {}),
              ...(typeof user.image === "string" ? { image: user.image } : {}),
            },
          );
          // Cache is already invalidated by updateUser
        } else if (account?.provider === "google") {
          await updateUser(
            { email: user.email },
            {
              emailVerified: new Date(),
              ...(typeof user.name === "string" ? { name: user.name } : {}),
              ...(typeof user.image === "string" ? { image: user.image } : {}),
            },
          );
          // Cache is already invalidated by updateUser
        }
      } catch (error) {
        console.error("[AUTH_SIGNIN_ERROR]", error);
      }
    },
    async signOut(
      message:
        | { session: void | AdapterSession | null | undefined }
        | { token: JWT | null },
    ) {
      if ("token" in message && message.token?.jti) {
        await redis.del(`session:${message.token.jti}`);
      }
    },
  },
  secret: env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
