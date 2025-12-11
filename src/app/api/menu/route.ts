import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getAllCategoriesWithItems } from "@/lib/menu-db";

// GET - Read menu data (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const data = getAllCategoriesWithItems();
    
    // Convert to API format (remove database-specific fields, convert highlight to boolean)
    const formatted = data.map(category => ({
      id: category.id,
      label: category.label,
      items: category.items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || undefined,
        highlight: Boolean(item.highlight),
      })),
    }));
    
    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error reading menu data:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// PUT - Update entire menu (for bulk updates)
export async function PUT(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // This endpoint can be used for bulk updates if needed
    // For now, individual CRUD operations are handled by other endpoints
    return NextResponse.json(
      { error: "Use individual category/item endpoints for updates" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu data" },
      { status: 500 }
    );
  }
}
