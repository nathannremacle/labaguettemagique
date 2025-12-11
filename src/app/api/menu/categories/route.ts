import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getAllCategoriesWithItems, createCategory, getAllCategories } from "@/lib/menu-db";

// GET all categories
export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = getAllCategoriesWithItems();
    
    // Format for API response
    const formatted = categories.map(category => ({
      id: category.id,
      label: category.label,
      items: category.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || undefined,
        highlight: Boolean(item.highlight),
      })),
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error reading categories:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to read categories", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newCategory = await request.json();
    
    // Validate input
    if (!newCategory || !newCategory.label || typeof newCategory.label !== 'string') {
      return NextResponse.json(
        { error: "Category label is required" },
        { status: 400 }
      );
    }

    const label = newCategory.label.trim();
    if (label.length === 0) {
      return NextResponse.json(
        { error: "Category label cannot be empty" },
        { status: 400 }
      );
    }
    
    // Validate label length (prevent DoS)
    if (label.length > 100) {
      return NextResponse.json(
        { error: "Category label is too long (max 100 characters)" },
        { status: 400 }
      );
    }
    
    // Generate ID from label (sanitized)
    const id = label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 100); // Limit length
    
    // Check if category with same ID already exists
    const existingCategories = getAllCategories();
    const existingCategory = existingCategories.find(cat => cat.id === id);
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }
    
    const category = createCategory({ id, label });
    
    return NextResponse.json({ 
      success: true, 
      category: {
        id: category.id,
        label: category.label,
        items: [],
      }
    });
  } catch (error) {
    console.error("Error creating category:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create category", details: errorMessage },
      { status: 500 }
    );
  }
}

