import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, verifySession } from "./auth";

export interface AuthenticatedUser {
  username: string;
  sessionId: string;
}

/**
 * Check if the request is authenticated
 * Returns the authenticated user or null
 */
export function requireAuth(request: NextRequest): AuthenticatedUser | null {
  const cookieHeader = request.headers.get("cookie");
  const sessionId = getSessionFromCookie(cookieHeader);

  if (!sessionId) {
    return null;
  }

  const result = verifySession(sessionId);

  if (!result.authenticated || !result.username) {
    return null;
  }

  return {
    username: result.username,
    sessionId,
  };
}

/**
 * Middleware wrapper for protected API routes
 */
export function authMiddleware(
  handler: (
    req: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = requireAuth(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, user);
  };
}




