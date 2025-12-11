import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getCategoryById, createItem } from "@/lib/menu-db";

// POST - Create new item in category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    const newItem = await request.json();
    
    // Validate category exists
    const category = getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Validate required fields
    if (!newItem.name || !newItem.description || !newItem.price) {
      return NextResponse.json(
        { error: "Name, description, and price are required" },
        { status: 400 }
      );
    }
    
    const item = createItem({
      category_id: categoryId,
      name: String(newItem.name),
      description: String(newItem.description),
      price: String(newItem.price),
      image: newItem.image || undefined,
      highlight: Boolean(newItem.highlight || false),
    });
    
    return NextResponse.json({ 
      success: true, 
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || undefined,
        highlight: Boolean(item.highlight),
      }
    });
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

