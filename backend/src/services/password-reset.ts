import type { User } from "@prisma/client";

import { prisma } from "@/config/prisma.js";
import { generateToken, sha256 } from "@/lib/utils.js";

/** Create a password-reset token (24h expiry) and return the raw token. */
export async function generateResetToken(user: Pick<User, "id" | "email">): Promise<string> {
  const token = generateToken(32);
  const hashedToken = sha256(token);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      email: user.email,
      token: hashedToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return token;
}

/** Whether the raw token maps to a non-expired reset record. */
export async function validateResetToken(token: string): Promise<boolean> {
  const hashedToken = sha256(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { token: hashedToken, expires: { gt: new Date() } },
  });

  return !!resetToken;
}

/** Resolve the user owning a valid, non-expired reset token. */
export async function getUserByResetToken(token: string): Promise<User | null> {
  const hashedToken = sha256(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { token: hashedToken, expires: { gt: new Date() } },
    include: { user: true },
  });

  return resetToken?.user ?? null;
}

/** Delete a reset token by its raw value. */
export async function deleteResetToken(token: string): Promise<void> {
  const hashedToken = sha256(token);

  await prisma.passwordResetToken.deleteMany({ where: { token: hashedToken } });
}
