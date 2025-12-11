import { NextRequest, NextResponse } from "next/server";
import { generateResetToken } from "@/lib/password";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Check rate limiting (use same limits as login)
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

    const { username } = await request.json();

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if username matches admin (prevent username enumeration)
    // Always return success message, but only generate token if username matches
    if (username === ADMIN_USERNAME) {
      const token = generateResetToken(username);
      
      // In production, send email with reset link
      // For now, log to console (remove in production!)
      console.log("Password reset token:", token);
      console.log("Reset URL:", `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/reset-password?token=${token}`);
      
      // Reset rate limit on successful request
      resetRateLimit(ip);
    }

    // Always return success to prevent username enumeration
    return NextResponse.json({
      success: true,
      message: "If the username exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

