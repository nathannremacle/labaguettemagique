import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const sessionId = getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const result = verifySession(sessionId);

    if (!result.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username: result.username,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

