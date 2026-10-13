import { createHash, randomBytes } from "node:crypto";

/** Generate a 6-digit numeric OTP. */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** SHA-256 hex digest. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * SHA-1 hex digest. Required by the HaveIBeenPwned Pwned Passwords range API,
 * which only accepts SHA-1 (or NTLM) hashes.
 */
export function sha1(value: string): string {
  return createHash("sha1").update(value).digest("hex");
}

/** Cryptographically-random hex token (default 32 bytes). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}
