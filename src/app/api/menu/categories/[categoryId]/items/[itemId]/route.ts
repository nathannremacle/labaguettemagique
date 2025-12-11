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
  } catch (error: any) {
    console.error("Error reading item:", error);
    return NextResponse.json(
      { error: "Failed to read item", details: error.message || String(error) },
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
    
    const item = updateItem(itemIdNum, {
      name: updates.name,
      description: updates.description,
      price: updates.price,
      image: updates.image,
      highlight: updates.highlight,
    });
    
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
  } catch (error: any) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item", details: error.message || String(error) },
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
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

