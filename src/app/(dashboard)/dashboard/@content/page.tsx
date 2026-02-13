import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/content";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense
      fallback={
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      }
    >
      <DashboardContent user={session.user} />
    </Suspense>
  );
}
