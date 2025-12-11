import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { reorderCategories, reorderItems } from "@/lib/menu-db";

// POST - Reorder categories
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, categoryId, ids } = body;
    
    if (type === "categories") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "Invalid category IDs array" },
          { status: 400 }
        );
      }
      
      reorderCategories(ids);
      return NextResponse.json({ success: true });
    }
    
    if (type === "items") {
      if (!categoryId || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "Category ID and item IDs array are required" },
          { status: 400 }
        );
      }
      
      const itemIds = ids.map((id: unknown) => parseInt(String(id))).filter((id: number) => !isNaN(id));
      if (itemIds.length !== ids.length) {
        return NextResponse.json(
          { error: "Invalid item IDs" },
          { status: 400 }
        );
      }
      
      reorderItems(categoryId, itemIds);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: "Invalid reorder type. Use 'categories' or 'items'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error reordering:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to reorder", details: errorMessage },
      { status: 500 }
    );
  }
}

