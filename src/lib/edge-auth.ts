import { auth } from "./auth";
import { edgeError } from "./edge-response";

export async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return { userId, session };
}

export async function withAuth(handler: (userId: string) => Promise<Response>) {
  try {
    const { userId } = await requireAuth();
    return await handler(userId);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return edgeError("Unauthorized", 401);
    }
    console.error("Auth error:", error);
    return edgeError("Internal server error", 500);
  }
}

export async function withOptionalAuth(
  handler: (userId: string | null) => Promise<Response>,
) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    return await handler(userId);
  } catch (error) {
    console.error("Auth error:", error);
    return edgeError("Internal server error", 500);
  }
}
