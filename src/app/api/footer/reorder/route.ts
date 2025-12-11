import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { reorderFooterItems } from "@/lib/footer-db";

// POST - Reorder footer items
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "ids must be an array" },
        { status: 400 }
      );
    }
    
    const itemIds = ids.map((id: unknown) => parseInt(String(id))).filter((id: number) => !isNaN(id));
    
    if (itemIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided" },
        { status: 400 }
      );
    }
    
    reorderFooterItems(itemIds);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to reorder footer items", details: errorMessage },
      { status: 500 }
    );
  }
}

