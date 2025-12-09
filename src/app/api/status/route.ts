import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getStatus, setStatus } from "@/lib/status";

// GET - Get current status
export async function GET() {
  try {
    const status = getStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}

// PUT - Update status (requires auth)
export async function PUT(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await request.json();
    setStatus(status);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

