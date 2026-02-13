import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      credits: number;
      subscriptionStatus: string;
      isVerified: boolean;
    };
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    image?: string;
    credits: number;
    subscriptionStatus: string;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    image?: string;
    credits: number;
    subscriptionStatus: string;
    isVerified: boolean;
  }
}
