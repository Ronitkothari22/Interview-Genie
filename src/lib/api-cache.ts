import { db } from "@/lib/db";
import { cache, revalidateTag } from "./redis";

export { cache, revalidateTag };

export function createCachedResponse(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

// Cache user data fetching
export const getUserData = (userId: string) =>
  cache(
    `user:${userId}`,
    async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          credits: true,
          subscriptionStatus: true,
          isVerified: true,
        },
      });
      return user;
    },
    {
      ttl: 300, // Cache for 5 minutes
      tags: ["user"],
    },
  );
