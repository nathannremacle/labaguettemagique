import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getDatabase } from "./db";

// In-memory session storage
// Key: sessionId, Value: { username: string, expiresAt: number }
const sessions = new Map<string, { username: string; expiresAt: number }>();

// Session duration: 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Cookie name
const SESSION_COOKIE_NAME = "admin_session";

// Credentials from environment variables or defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim() || undefined;
const DEFAULT_PASSWORD = "password";


/**
 * Authenticate a user with username and password
 * Returns success status and session ID if authentication succeeds
 */
export function authenticate(
  username: string,
  password: string
): { success: boolean; error?: string; sessionId?: string } {
  // Validate username
  if (username !== ADMIN_USERNAME) {
    return { success: false, error: "Invalid credentials" };
  }

  // Validate password - check database first, then environment variable
  const passwordHash = getPasswordHash();
  let passwordValid = false;
  
  if (passwordHash && passwordHash.length > 0) {
    // Use bcrypt comparison when hash is provided
    try {
      passwordValid = bcrypt.compareSync(password, passwordHash);
    } catch (error) {
      console.error("Password comparison error:", error);
      return { success: false, error: "Authentication error" };
    }
  } else {
    // Use plain text comparison for default password
    passwordValid = password === DEFAULT_PASSWORD;
  }

  if (!passwordValid) {
    return { success: false, error: "Invalid credentials" };
  }

  // Create session
  try {
    const sessionId = createSession(username);
    if (!sessionId) {
      console.error("[Auth] Failed to create session");
      return { success: false, error: "Failed to create session" };
    }
    return { success: true, sessionId };
  } catch (error) {
    console.error("[Auth] Error creating session:", error);
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * Create a new session for a user
 * Returns the session ID
 */
function createSession(username: string): string {
  // Generate random 32-byte hex string (64 characters)
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;

  sessions.set(sessionId, { username, expiresAt });

  return sessionId;
}

/**
 * Extract session ID from cookie header string
 * Returns the session ID or null if not found
 */
export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  // Parse cookies from header string
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === SESSION_COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Verify if a session is valid
 * Returns authentication status and username if valid
 */
export function verifySession(
  sessionId: string
): { authenticated: boolean; username?: string } {
  const session = sessions.get(sessionId);

  if (!session) {
    return { authenticated: false };
  }

  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    // Remove expired session
    sessions.delete(sessionId);
    return { authenticated: false };
  }

  return { authenticated: true, username: session.username };
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Get the current password hash from database or environment
 */
function getPasswordHash(): string | undefined {
  try {
    const db = getDatabase();
    try {
      const row = db.prepare("SELECT password_hash FROM admin_credentials WHERE id = 1").get() as { password_hash: string } | undefined;
      if (row && row.password_hash && row.password_hash.trim().length > 0) {
        return row.password_hash;
      }
    } catch (dbError) {
      // Table might not exist yet or query failed - that's okay, fall back to env var
    }
  } catch (error) {
    // Database connection error - fall back to environment variable
  }
  
  // Fall back to environment variable
  return ADMIN_PASSWORD_HASH;
}

/**
 * Change the admin password
 * Verifies current password and updates to new password
 */
export function changePassword(
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long" };
  }

  if (newPassword.length > 500) {
    return { success: false, error: "New password is too long" };
  }

  // Verify current password
  const passwordHash = getPasswordHash();
  let currentPasswordValid = false;

  if (passwordHash && passwordHash.length > 0) {
    try {
      currentPasswordValid = bcrypt.compareSync(currentPassword, passwordHash);
    } catch (error) {
      console.error("Password comparison error:", error);
      return { success: false, error: "Authentication error" };
    }
  } else {
    // Fall back to default password if no hash is set
    currentPasswordValid = currentPassword === DEFAULT_PASSWORD;
  }

  if (!currentPasswordValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Hash the new password
  let newPasswordHash: string;
  try {
    newPasswordHash = bcrypt.hashSync(newPassword, 10);
  } catch (error) {
    console.error("Password hashing error:", error);
    return { success: false, error: "Failed to hash new password" };
  }

  // Store the new password hash in the database
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO admin_credentials (id, password_hash, updated_at)
      VALUES (1, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        password_hash = excluded.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `).run(newPasswordHash);
    
    return { success: true };
  } catch (error) {
    console.error("Error saving new password:", error);
    return { success: false, error: "Failed to save new password" };
  }
}
