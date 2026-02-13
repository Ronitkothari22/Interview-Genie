import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
