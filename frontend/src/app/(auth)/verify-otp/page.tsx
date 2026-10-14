import { getServerSession } from "@/lib/server-session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OTPVerificationForm } from "./otp-verification-form";

export default async function VerifyOTPPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Verify Your Email</h1>
        <p className="text-muted-foreground">
          Enter the OTP sent to your email address
        </p>
      </div>
      <Suspense fallback={null}>
        <OTPVerificationForm />
      </Suspense>
    </div>
  );
}
