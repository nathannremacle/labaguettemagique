import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = 
      getAuthTokenFromRequest(request) || 
      request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, username: decoded.username });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

