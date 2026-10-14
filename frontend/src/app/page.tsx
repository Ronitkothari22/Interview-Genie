import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-session";

export default async function RootPage() {
  const session = await getServerSession();

  // If user is not logged in, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  // If user is logged in but not verified, redirect to OTP verification
  if (!session.user.isVerified) {
    redirect("/verify-otp");
  }

  // If user is logged in and verified, redirect to dashboard
  redirect("/dashboard");
}
