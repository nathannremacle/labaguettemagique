import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter?.toString() || "1800",
          },
        }
      );
    }

    const { username, password, rememberMe } = await request.json();

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate input types and length
    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Sanitize input length (prevent DoS)
    if (username.length > 100 || password.length > 500) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    // Validate rememberMe is boolean if provided
    const remember = typeof rememberMe === "boolean" ? rememberMe : false;

    // Attempt authentication
    const result = await authenticate(username, password, remember);

    if (!result.success) {
      // Don't reset rate limit on failure - let it accumulate
      return NextResponse.json(
        { error: result.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetRateLimit(ip);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // Set session cookie
    response.cookies.set("admin_session", result.sessionId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

