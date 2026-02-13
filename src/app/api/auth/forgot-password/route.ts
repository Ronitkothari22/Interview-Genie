import { NextResponse } from "next/server";
import { generateResetToken } from "@/lib/password-reset";
import { db } from "@/lib/db";
import { z } from "zod";
import { generatePasswordResetEmail, sendEmail } from "@/lib/email";
import { env } from "@/env";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = await generateResetToken(user);

    // Generate reset link
    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Interview Genie",
      html: generatePasswordResetEmail(user.name ?? "User", resetLink),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
