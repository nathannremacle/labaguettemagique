import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { changePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Input validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Sanitize input length
    if (currentPassword.length > 500 || newPassword.length > 500) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    // Attempt to change password
    const result = changePassword(currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change password" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




