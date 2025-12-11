import { randomBytes } from "crypto";

export interface Session {
  sessionId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

// In-memory session store (can be upgraded to Redis/database later)
const sessions = new Map<string, Session>();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

export function createSession(
  username: string,
  rememberMe: boolean = false
): string {
  const sessionId = randomBytes(32).toString("hex");
  const now = Date.now();
  
  // Regular sessions expire in 24 hours, remember me sessions in 30 days
  const expiresAt = rememberMe
    ? now + 30 * 24 * 60 * 60 * 1000 // 30 days
    : now + 24 * 60 * 60 * 1000; // 24 hours

  const session: Session = {
    sessionId,
    username,
    createdAt: now,
    expiresAt,
    rememberMe,
  };

  sessions.set(sessionId, session);
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function extendSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  
  if (!session || session.expiresAt < Date.now()) {
    return false;
  }

  // Extend session by original duration
  const extension = session.rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 24 hours

  session.expiresAt = Date.now() + extension;
  return true;
}

