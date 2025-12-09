import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

// Hash password on first run (you should set ADMIN_PASSWORD_HASH in production)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticate(username: string, password: string): Promise<string | null> {
  // For initial setup, check against plain password if no hash exists
  const plainPassword = process.env.ADMIN_PASSWORD || "changeme123";
  
  if (username === ADMIN_USERNAME) {
    if (ADMIN_PASSWORD_HASH) {
      const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      if (isValid) {
        return generateToken(username);
      }
    } else {
      // First-time setup: compare with plain password
      if (password === plainPassword) {
        return generateToken(username);
      }
    }
  }
  
  return null;
}

export function getAuthTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

