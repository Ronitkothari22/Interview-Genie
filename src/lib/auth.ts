import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "@/server/auth/adapter";
import { db } from "@/server/db";
import GoogleProvider from "next-auth/providers/google";
import { credentialsProvider } from "@/server/auth/credentials";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";
import type { AdapterSession } from "next-auth/adapters";
import type { Session } from "next-auth";
import { env } from "@/env";
import { getUser, updateUser } from "@/lib/user-cache";

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
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // If this is a sign in or we have an email in the token
      if ((trigger === "signIn" && user) || token?.email) {
        try {
          // Use our cached user utility
          const email = user?.email ?? token.email;
          if (!email) {
            console.warn("No email found in token or user");
            return token as CustomJWT;
          }

          const dbUser = await getUser({ email });

          // If user doesn't exist in the database yet (e.g. race on first OAuth sign-in),
          // fall back to returning the token as-is rather than killing the session.
          if (!dbUser) {
            console.warn(`User not found in database: ${email}. Returning bare token.`);
            return token as CustomJWT;
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
          // Don't return null — that causes a Configuration error in NextAuth.
          // Fall back to the existing token so the session isn't hard-killed.
          return token as CustomJWT;
        }
      }

      if (trigger === "update" && session) {
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
      void message;
    },
  },
  secret: env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
