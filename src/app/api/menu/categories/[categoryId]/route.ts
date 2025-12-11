import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getCategoryById, updateCategory, deleteCategory, getItemsByCategory } from "@/lib/menu-db";

// GET category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { categoryId } = await params;
    const category = getCategoryById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    const items = getItemsByCategory(categoryId);
    
    return NextResponse.json({
      id: category.id,
      label: category.label,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || undefined,
        highlight: Boolean(item.highlight),
      })),
    });
  } catch (error) {
    console.error("Error reading category:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to read category", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }
    
    const updates = await request.json();
    
    if (!updates.label || typeof updates.label !== 'string' || updates.label.trim() === '') {
      return NextResponse.json(
        { error: "Category label is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    const label = updates.label.trim();
    if (label.length > 100) {
      return NextResponse.json(
        { error: "Category label is too long (max 100 characters)" },
        { status: 400 }
      );
    }
    
    const category = updateCategory(categoryId, { label });
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      category: {
        id: category.id,
        label: category.label,
      }
    });
  } catch (error) {
    console.error("Error updating category:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update category", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    const success = deleteCategory(categoryId);
    
    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete category", details: errorMessage },
      { status: 500 }
    );
  }
}

