import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";

export default async function RootPage() {
  const session = await auth();

  // If user is not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // Get full user details from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isVerified: true },
  });

  // If user not found in database, something is wrong - redirect to login
  if (!user) {
    redirect("/login");
  }

  // If user is logged in but not verified, redirect to OTP verification
  if (!user.isVerified) {
    redirect("/verify-otp");
  }

  // If user is logged in and verified, redirect to dashboard
  redirect("/dashboard");
}
