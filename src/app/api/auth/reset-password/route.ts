import { NextRequest, NextResponse } from "next/server";
import {
  validateResetToken,
  consumeResetToken,
  hashPassword,
} from "@/lib/password";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
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

    const { token, newPassword } = await request.json();

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (typeof token !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate and consume token
    const username = validateResetToken(token);

    if (!username) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update environment variable (in production, update database)
    // For now, we'll need to manually update ADMIN_PASSWORD_HASH
    // This is a limitation of using env vars - in production, use a database
    console.log("New password hash:", passwordHash);
    console.log("Update ADMIN_PASSWORD_HASH in your .env.local file with the above hash");

    // Consume token
    consumeResetToken(token);

    // Reset rate limit
    resetRateLimit(ip);

    return NextResponse.json({
      success: true,
      message: "Password has been reset. Please update ADMIN_PASSWORD_HASH in your environment variables.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

