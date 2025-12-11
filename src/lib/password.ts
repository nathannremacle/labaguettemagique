import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export interface PasswordResetToken {
  token: string;
  username: string;
  expiresAt: number;
}

// In-memory token store (can be upgraded to database later)
const resetTokens = new Map<string, PasswordResetToken>();

// Token expiration: 1 hour
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

// Cleanup expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, tokenData] of resetTokens.entries()) {
    if (tokenData.expiresAt < now) {
      resetTokens.delete(token);
    }
  }
}, 10 * 60 * 1000);

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateResetToken(username: string): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + TOKEN_EXPIRATION_MS;

  resetTokens.set(token, {
    token,
    username,
    expiresAt,
  });

  return token;
}

export function validateResetToken(token: string): string | null {
  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    return null;
  }

  // Check if token has expired
  if (tokenData.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return null;
  }

  return tokenData.username;
}

export function consumeResetToken(token: string): boolean {
  return resetTokens.delete(token);
}

