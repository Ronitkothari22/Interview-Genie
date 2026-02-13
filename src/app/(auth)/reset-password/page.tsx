import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your new password below to reset it
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
