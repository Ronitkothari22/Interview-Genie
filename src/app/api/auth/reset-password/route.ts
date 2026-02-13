import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { sessionCache } from "@/lib/redis";
import { createHash } from "crypto";
import { validateResetToken } from "@/lib/password-reset";

// Helper function for SHA-256 hashing
const sha256 = async (str: string) => {
  return createHash("sha256").update(str).digest("hex");
};

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validate token and password
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    // Check if password is in breach database
    const passwordHash = await sha256(password);
    const prefix = passwordHash.slice(0, 5);
    const suffix = passwordHash.slice(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );

    if (!response.ok) {
      console.error("Failed to check password breach database");
      // Continue with password reset even if breach check fails
    } else {
      const hashes = await response.text();
      const hashLines = hashes.split("\n").filter(Boolean);

      const breached = hashLines.some((line) => {
        const parts = line.split(":");
        return parts[0]?.toLowerCase() === suffix.toLowerCase();
      });

      if (breached) {
        return NextResponse.json(
          {
            error:
              "This password has been exposed in data breaches. Please choose a different password.",
          },
          { status: 400 },
        );
      }
    }

    // Validate reset token
    const isValid = await validateResetToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Find user with valid reset token
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        token: await sha256(token),
        expires: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken?.user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Update password and delete reset token
    const user = await db.user.update({
      where: {
        id: resetToken.user.id,
      },
      data: {
        hashedPassword: await hash(password, 12),
        passwordResetTokens: {
          deleteMany: {
            token: await sha256(token),
          },
        },
      },
    });

    // Invalidate all sessions for this user
    const sessions = await db.session.findMany({
      where: { userId: user.id },
      select: { sessionToken: true },
    });

    await Promise.all([
      // Delete sessions from database
      db.session.deleteMany({
        where: { userId: user.id },
      }),
      // Delete sessions from cache
      ...sessions.map((session) => sessionCache.delete(session.sessionToken)),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
