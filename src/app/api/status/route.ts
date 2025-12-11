import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getStatus, setStatus } from "@/lib/status";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";

// GET - Get current status
export async function GET() {
  try {
    const status = getStatus();
    return createSuccessResponse(status);
  } catch (error) {
    return createErrorResponse(error, "Failed to get status", 500);
  }
}

// PUT - Update status (requires auth)
export async function PUT(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return createErrorResponse(null, "Unauthorized", 401);
  }

  try {
    const status = await request.json();
    setStatus(status);
    return createSuccessResponse({ success: true, status });
  } catch (error) {
    return createErrorResponse(error, "Failed to update status", 500);
  }
}

