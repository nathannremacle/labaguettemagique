import { randomBytes } from "crypto";
import { getDatabase } from "./db";

export interface Session {
  sessionId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session store
const sessions = new Map<string, Session>();

// Session expiration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

export interface AuthResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

/**
 * Get admin user credentials from database
 * @returns Object with username and password, or null if not found
 */
function getAdminUser(): { username: string; password: string } | null {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT username, password FROM admin_users LIMIT 1').get() as { username: string; password: string } | undefined;
    return user || null;
  } catch (error) {
    console.error("Error loading admin user from database:", error);
    return null;
  }
}

/**
 * Authenticate user with username and password
 * @param username - The username to authenticate
 * @param password - The password to authenticate
 * @returns AuthResult with success status and sessionId if successful
 */
export function authenticate(username: string, password: string): AuthResult {
  const adminUser = getAdminUser();
  
  if (!adminUser) {
    return {
      success: false,
      error: "Admin user not configured",
    };
  }

  // Simple string comparison (no hashing to avoid hash issues)
  if (username.trim() !== adminUser.username || password.trim() !== adminUser.password) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  // Create session
  const sessionId = createSession(adminUser.username);

  return {
    success: true,
    sessionId,
  };
}

/**
 * Create a new session for an authenticated user
 * @param username - The username to create a session for
 * @returns A unique session ID string
 */
export function createSession(username: string): string {
  const sessionId = randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const session: Session = {
    sessionId,
    username,
    createdAt: now,
    expiresAt,
  };

  sessions.set(sessionId, session);
  return sessionId;
}

/**
 * Extract session ID from cookie header
 * @param cookieHeader - The cookie header string from the request
 * @returns The session ID if found, null otherwise
 */
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

/**
 * Verify if a session is valid and not expired
 * @param sessionId - The session ID to verify
 * @returns Object with authenticated status and username if valid
 */
export function verifySession(sessionId: string | null): {
  authenticated: boolean;
  username?: string;
} {
  if (!sessionId) {
    return { authenticated: false };
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return { authenticated: false };
  }

  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return { authenticated: false };
  }

  return {
    authenticated: true,
    username: session.username,
  };
}

/**
 * Delete a session (logout)
 * @param sessionId - The session ID to delete
 * @returns True if session was deleted, false if not found
 */
export function deleteSession(sessionId: string | null): boolean {
  if (!sessionId) {
    return false;
  }
  return sessions.delete(sessionId);
}

/**
 * Change the admin password
 * Requires current password verification
 * @param currentPassword - The current password for verification
 * @param newPassword - The new password to set (must be at least 3 characters)
 * @returns Object with success status and optional error message
 */
export function changePassword(currentPassword: string, newPassword: string): {
  success: boolean;
  error?: string;
} {
  try {
    const db = getDatabase();
    const adminUser = getAdminUser();
    
    if (!adminUser) {
      return {
        success: false,
        error: "Admin user not configured",
      };
    }

    // Verify current password
    if (currentPassword.trim() !== adminUser.password) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Validate new password
    if (!newPassword || newPassword.trim().length === 0) {
      return {
        success: false,
        error: "New password cannot be empty",
      };
    }

    if (newPassword.length < 3) {
      return {
        success: false,
        error: "New password must be at least 3 characters long",
      };
    }

    // Update password in database
    const trimmedPassword = newPassword.trim();
    db.prepare(`
      UPDATE admin_users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE username = ?
    `).run(trimmedPassword, adminUser.username);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to update password in database",
    };
  }
}

/**
 * Get the current admin username (for display purposes)
 */
export function getAdminUsername(): string {
  const adminUser = getAdminUser();
  return adminUser?.username || "admin";
}
