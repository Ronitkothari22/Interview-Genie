import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { generateOTPEmail } from "@/lib/email-templates/otp-verification";
import { authCache } from "@/lib/auth-cache";

const schema = z.object({
  email: z.string().email(),
});

// Helper function to send OTP email
async function sendOTPEmail(
  email: string,
  name: string,
  otp: string,
): Promise<boolean> {
  try {
    const result = await sendEmail({
      to: email,
      subject: "New Verification Code - Interview Genie",
      html: generateOTPEmail(name, otp),
    });

    if (!result.success) {
      console.error("Failed to send OTP email:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting: 3 attempts per 5 minutes per IP
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const rateLimitKey = `resend-otp:${ip}`;
    const isAllowed = await authCache.checkRateLimit(rateLimitKey, 3, 300);

    if (!isAllowed) {
      const remainingTime = await authCache.getRemainingAttempts(rateLimitKey);
      return NextResponse.json(
        {
          error: "Too many attempts",
          remainingSeconds: Math.ceil(remainingTime / 60),
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { email } = schema.parse(body);

    // Check if user exists and needs verification
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        isVerified: true,
        otpVerifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 },
      );
    }

    // Check cooldown period
    const lastOTP = user.otpVerifications[0];
    if (lastOTP) {
      const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
      if (timeSinceLastOTP < 60000) {
        // 60 seconds cooldown
        return NextResponse.json(
          {
            error: "Please wait before requesting another code",
            remainingSeconds: Math.ceil((60000 - timeSinceLastOTP) / 1000),
          },
          { status: 429 },
        );
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP in database within a transaction
    await db.$transaction(async (tx) => {
      // Delete any existing OTPs for this user
      await tx.oTPVerification.deleteMany({
        where: { userId: user.id },
      });

      // Create new OTP
      await tx.oTPVerification.create({
        data: {
          userId: user.id,
          otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });
    });

    // In production, ensure email is sent
    if (process.env.NODE_ENV === "production") {
      const emailSent = await sendOTPEmail(email, user.name ?? "User", otp);
      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send verification code" },
          { status: 500 },
        );
      }
    } else {
      // In development, send in background
      void sendOTPEmail(email, user.name ?? "User", otp);
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 },
    );
  }
}
