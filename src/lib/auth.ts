import { verifyPassword } from "./password";
import { createSession, getSession, deleteSession } from "./session";

// Admin credentials from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_PASSWORD_HASH) {
  throw new Error(
    "ADMIN_PASSWORD_HASH environment variable is required. " +
    "Generate it using: node -e \"require('bcryptjs').hash('your-password', 10).then(console.log)\""
  );
}

export interface AuthResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export async function authenticate(
  username: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResult> {
  // Validate username matches
  if (username !== ADMIN_USERNAME) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  // Verify password
  if (!ADMIN_PASSWORD_HASH) {
    return {
      success: false,
      error: "Server configuration error",
    };
  }
  
  const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  
  if (!isValid) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  // Create session
  const sessionId = createSession(username, rememberMe);

  return {
    success: true,
    sessionId,
  };
}

export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("admin_session="));

  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.split("=")[1] || null;
}

export function verifySession(sessionId: string | null): {
  authenticated: boolean;
  username?: string;
} {
  if (!sessionId) {
    return { authenticated: false };
  }

  const session = getSession(sessionId);

  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    username: session.username,
  };
}

export function logout(sessionId: string | null): void {
  if (sessionId) {
    deleteSession(sessionId);
  }
}

