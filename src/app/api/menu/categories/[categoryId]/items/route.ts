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
    
    // Validate input types
    if (typeof newItem.name !== "string" || typeof newItem.description !== "string" || typeof newItem.price !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }
    
    // Sanitize and validate input lengths (prevent DoS)
    const name = String(newItem.name).trim();
    const description = String(newItem.description).trim();
    const price = String(newItem.price).trim();
    
    if (name.length === 0 || name.length > 200) {
      return NextResponse.json(
        { error: "Item name must be between 1 and 200 characters" },
        { status: 400 }
      );
    }
    
    if (description.length === 0 || description.length > 1000) {
      return NextResponse.json(
        { error: "Item description must be between 1 and 1000 characters" },
        { status: 400 }
      );
    }
    
    if (price.length === 0 || price.length > 50) {
      return NextResponse.json(
        { error: "Price must be between 1 and 50 characters" },
        { status: 400 }
      );
    }
    
    // Validate image path if provided (prevent path traversal)
    let imagePath = undefined;
    if (newItem.image) {
      const image = String(newItem.image);
      if (image.length > 500) {
        return NextResponse.json(
          { error: "Image path is too long" },
          { status: 400 }
        );
      }
      // Ensure image path is safe (starts with /images/)
      if (!image.startsWith("/images/") || image.includes("..")) {
        return NextResponse.json(
          { error: "Invalid image path" },
          { status: 400 }
        );
      }
      imagePath = image;
    }
    
    const item = createItem({
      category_id: categoryId,
      name,
      description,
      price,
      image: imagePath,
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
  } catch (error) {
    console.error("Error creating item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create item", details: errorMessage },
      { status: 500 }
    );
  }
}

