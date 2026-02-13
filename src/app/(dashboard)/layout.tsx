import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsNav } from "@/components/notifications-nav";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  subscriptionStatus: string | null;
  credits: number;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch user data from database with specific fields using email
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      subscriptionStatus: true,
      credits: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const dashboardUser: DashboardUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    subscriptionStatus: user.subscriptionStatus,
    credits: user.credits,
  };

  // Ensure subscriptionStatus is never null for UI
  const subscriptionStatus = dashboardUser.subscriptionStatus ?? "free";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex flex-1 items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">Interview Genie</span>
              </div>
              <div className="ml-10 hidden flex-1 md:block">
                <MainNav />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Subscription Badge */}
              <div className="hidden items-center gap-2 md:flex">
                <Badge
                  variant={
                    subscriptionStatus === "free" ? "secondary" : "outline"
                  }
                  className="capitalize"
                >
                  {subscriptionStatus}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>{dashboardUser.credits} credits</span>
                </div>
              </div>
              <NotificationsNav />
              <ThemeToggle />
              <UserNav
                user={{
                  name: dashboardUser.name ?? undefined,
                  email: dashboardUser.email,
                  image: dashboardUser.image ?? undefined,
                }}
                credits={dashboardUser.credits}
                subscriptionStatus={subscriptionStatus}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto max-w-[1600px] p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
