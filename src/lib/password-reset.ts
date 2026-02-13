import { db } from "@/lib/db";
import type { User } from ".prisma/client";

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to generate random bytes using Web Crypto API
async function generateRandomBytes(length: number): Promise<string> {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return bufferToHex(buffer);
}

// Helper function to create SHA-256 hash
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return bufferToHex(hashBuffer);
}

export async function generateResetToken(user: User): Promise<string> {
  const token = await generateRandomBytes(32);
  const hashedToken = await sha256(token);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      email: user.email,
      token: hashedToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return token;
}

export async function validateResetToken(token: string): Promise<boolean> {
  const hashedToken = await sha256(token);

  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expires: {
        gt: new Date(),
      },
    },
  });

  return !!resetToken;
}

export async function getUserByResetToken(token: string): Promise<User | null> {
  const hashedToken = await sha256(token);

  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return resetToken?.user ?? null;
}

export async function deleteResetToken(token: string): Promise<void> {
  const hashedToken = await sha256(token);

  await db.passwordResetToken.deleteMany({
    where: {
      token: hashedToken,
    },
  });
}
