import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/content";
import { getServerSession } from "@/lib/server-session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense
      fallback={
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      }
    >
      <DashboardContent
        user={{
          ...session.user,
          name: session.user.name ?? "",
          image: session.user.image ?? undefined,
        }}
      />
    </Suspense>
  );
}
