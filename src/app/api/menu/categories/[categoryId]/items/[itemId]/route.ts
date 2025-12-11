import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getCategoryById, getItemById, updateItem, deleteItem, getItemsByCategory } from "@/lib/menu-db";

// GET - Get item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, itemId } = await params;
    const itemIdNum = parseInt(itemId);
    
    if (isNaN(itemIdNum)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const category = getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    const item = getItemById(itemIdNum);
    if (!item || item.category_id !== categoryId) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || undefined,
      highlight: Boolean(item.highlight),
    });
  } catch (error) {
    console.error("Error reading item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to read item", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, itemId } = await params;
    const itemIdNum = parseInt(itemId);
    const updates = await request.json();
    
    if (isNaN(itemIdNum)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const category = getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Validate item exists and belongs to category
    const existingItem = getItemById(itemIdNum);
    if (!existingItem || existingItem.category_id !== categoryId) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    // Validate and sanitize update fields
    const updateData: {
      name?: string;
      description?: string;
      price?: string;
      image?: string;
      highlight?: boolean;
    } = {};
    
    if (updates.name !== undefined) {
      if (typeof updates.name !== "string") {
        return NextResponse.json(
          { error: "Invalid name format" },
          { status: 400 }
        );
      }
      const name = updates.name.trim();
      if (name.length === 0 || name.length > 200) {
        return NextResponse.json(
          { error: "Item name must be between 1 and 200 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }
    
    if (updates.description !== undefined) {
      if (typeof updates.description !== "string") {
        return NextResponse.json(
          { error: "Invalid description format" },
          { status: 400 }
        );
      }
      const description = updates.description.trim();
      if (description.length === 0 || description.length > 1000) {
        return NextResponse.json(
          { error: "Item description must be between 1 and 1000 characters" },
          { status: 400 }
        );
      }
      updateData.description = description;
    }
    
    if (updates.price !== undefined) {
      if (typeof updates.price !== "string") {
        return NextResponse.json(
          { error: "Invalid price format" },
          { status: 400 }
        );
      }
      const price = updates.price.trim();
      if (price.length === 0 || price.length > 50) {
        return NextResponse.json(
          { error: "Price must be between 1 and 50 characters" },
          { status: 400 }
        );
      }
      updateData.price = price;
    }
    
    if (updates.image !== undefined) {
      if (updates.image === null) {
        updateData.image = undefined;
      } else {
        if (typeof updates.image !== "string") {
          return NextResponse.json(
            { error: "Invalid image path format" },
            { status: 400 }
          );
        }
        const image = updates.image.trim();
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
        updateData.image = image;
      }
    }
    
    if (updates.highlight !== undefined) {
      updateData.highlight = Boolean(updates.highlight);
    }
    
    const item = updateItem(itemIdNum, updateData);
    
    if (!item) {
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }
    
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
    console.error("Error updating item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update item", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, itemId } = await params;
    const itemIdNum = parseInt(itemId);
    
    if (isNaN(itemIdNum)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const category = getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Validate item exists and belongs to category
    const existingItem = getItemById(itemIdNum);
    if (!existingItem || existingItem.category_id !== categoryId) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    const success = deleteItem(itemIdNum);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete item", details: errorMessage },
      { status: 500 }
    );
  }
}

