"use client";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const loginMessage = `Welcome back, let's continue your interview prep journey.`;

const signupMessage = `Ready to ace your next interview? Let's get started.`;

export function WelcomeMessage({
  type = "login",
}: {
  type?: "login" | "signup";
}) {
  return (
    <TextGenerateEffect
      words={type === "login" ? loginMessage : signupMessage}
      className="mb-6"
      duration={1}
      filter={false}
    />
  );
}
