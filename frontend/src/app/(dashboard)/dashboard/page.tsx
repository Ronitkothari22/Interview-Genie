import { getServerSession } from "@/lib/server-session";
import { redirect } from "next/navigation";

// Enable streaming
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return null; // Content is rendered by parallel routes
}
