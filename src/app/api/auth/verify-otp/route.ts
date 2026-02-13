import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authCache } from "@/lib/auth-cache";

// Use Node.js runtime for better database operations
export const dynamic = "force-dynamic";
export const maxDuration = 10; // Set max duration to 10 seconds

const verifyOTPSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { userId, otp } = verifyOTPSchema.parse(body);

    // Check rate limit first
    const rateLimitKey = `verify-otp:${userId}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 5, 300);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    // Find and verify OTP
    const otpRecord = await db.oTPVerification.findFirst({
      where: {
        userId,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    try {
      // Update user verification status and clean up in a transaction
      await db.$transaction([
        db.user.update({
          where: { id: userId },
          data: { isVerified: true },
        }),
        db.oTPVerification.deleteMany({
          where: { userId },
        }),
      ]);

      // Clear rate limit on success
      await authCache.clearRateLimit(rateLimitKey);

      // Invalidate user sessions
      await authCache.invalidateUserSessions(userId);

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json(
        { error: "Failed to update verification status" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("OTP verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to verify OTP",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
