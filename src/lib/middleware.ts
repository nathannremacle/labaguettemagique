import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest, verifyToken } from "./auth";

export function requireAuth(request: NextRequest): { username: string } | null {
  const token = 
    getAuthTokenFromRequest(request) || 
    request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

export function authMiddleware(handler: (req: NextRequest, user: { username: string }) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

