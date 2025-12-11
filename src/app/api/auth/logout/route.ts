import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, logout } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionId = getSessionFromCookie(cookieHeader);

    // Delete session if it exists
    if (sessionId) {
      logout(sessionId);
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_session");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

