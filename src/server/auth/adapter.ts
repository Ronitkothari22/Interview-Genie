import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  const prismaAdapter = PrismaAdapter(p) as Adapter;

  return {
    ...prismaAdapter,
    createUser: async (data) => {
      const user = await p.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          image: data.image ?? null,
          emailVerified: data.emailVerified,
          credits: 100, // Default credits for new users
          subscriptionStatus: "free", // Default subscription status
          isVerified: false, // Default verification status
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          credits: true,
          subscriptionStatus: true,
          isVerified: true,
        },
      });

      return user as AdapterUser;
    },
    getUser: async (id) => {
      const user = await p.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          credits: true,
          subscriptionStatus: true,
          isVerified: true,
        },
      });
      if (!user) return null;

      return user as AdapterUser;
    },
    getUserByEmail: async (email) => {
      const user = await p.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          credits: true,
          subscriptionStatus: true,
          isVerified: true,
        },
      });
      if (!user) return null;

      return user as AdapterUser;
    },
    getUserByAccount: async ({ provider, providerAccountId }) => {
      const account = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              emailVerified: true,
              image: true,
              credits: true,
              subscriptionStatus: true,
              isVerified: true,
            },
          },
        },
      });
      if (!account) return null;

      return account.user as AdapterUser;
    },
  };
}
