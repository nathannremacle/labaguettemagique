import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getFooterItemById, updateFooterItem, deleteFooterItem } from "@/lib/footer-db";

// GET - Get footer item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    const item = getFooterItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error reading footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to read footer item", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update footer item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    const updates = await request.json();
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    // Validate and sanitize update fields
    const updateData: {
      title?: string;
      description?: string;
      icon?: string;
      link?: string;
      menu_item_name?: string;
      menu_category_id?: string;
      visible?: boolean;
    } = {};
    
    if (updates.title !== undefined) {
      if (typeof updates.title !== "string") {
        return NextResponse.json(
          { error: "Invalid title format" },
          { status: 400 }
        );
      }
      const title = updates.title.trim();
      if (title.length === 0 || title.length > 200) {
        return NextResponse.json(
          { error: "Title must be between 1 and 200 characters" },
          { status: 400 }
        );
      }
      updateData.title = title;
    }
    
    if (updates.description !== undefined) {
      if (updates.description === null) {
        updateData.description = undefined;
      } else {
        if (typeof updates.description !== "string") {
          return NextResponse.json(
            { error: "Invalid description format" },
            { status: 400 }
          );
        }
        const description = updates.description.trim();
        if (description.length > 500) {
          return NextResponse.json(
            { error: "Description must be less than 500 characters" },
            { status: 400 }
          );
        }
        updateData.description = description;
      }
    }
    
    if (updates.icon !== undefined) {
      if (updates.icon === null) {
        updateData.icon = undefined;
      } else {
        if (typeof updates.icon !== "string") {
          return NextResponse.json(
            { error: "Invalid icon format" },
            { status: 400 }
          );
        }
        const icon = updates.icon.trim();
        if (icon.length > 100) {
          return NextResponse.json(
            { error: "Icon must be less than 100 characters" },
            { status: 400 }
          );
        }
        updateData.icon = icon;
      }
    }
    
    if (updates.link !== undefined) {
      if (updates.link === null) {
        updateData.link = undefined;
      } else {
        if (typeof updates.link !== "string") {
          return NextResponse.json(
            { error: "Invalid link format" },
            { status: 400 }
          );
        }
        const link = updates.link.trim();
        if (link.length > 500) {
          return NextResponse.json(
            { error: "Link must be less than 500 characters" },
            { status: 400 }
          );
        }
        // Validate link format
        if (link && !link.startsWith("/") && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("mailto:") && !link.startsWith("tel:")) {
          return NextResponse.json(
            { error: "Invalid link format" },
            { status: 400 }
          );
        }
        updateData.link = link;
      }
    }
    
    if (updates.menu_item_name !== undefined) {
      if (updates.menu_item_name === null) {
        updateData.menu_item_name = undefined;
      } else {
        if (typeof updates.menu_item_name !== "string") {
          return NextResponse.json(
            { error: "Invalid menu_item_name format" },
            { status: 400 }
          );
        }
        updateData.menu_item_name = updates.menu_item_name.trim();
      }
    }
    
    if (updates.menu_category_id !== undefined) {
      if (updates.menu_category_id === null) {
        updateData.menu_category_id = undefined;
      } else {
        if (typeof updates.menu_category_id !== "string") {
          return NextResponse.json(
            { error: "Invalid menu_category_id format" },
            { status: 400 }
          );
        }
        updateData.menu_category_id = updates.menu_category_id.trim();
      }
    }
    
    // Validate menu item link if provided
    if (updateData.menu_item_name || updateData.menu_category_id) {
      if (!updateData.menu_item_name || !updateData.menu_category_id) {
        return NextResponse.json(
          { error: "Both menu_item_name and menu_category_id are required when linking to a menu item" },
          { status: 400 }
        );
      }
      
      const { validateMenuItem, getCategoryById } = await import("@/lib/menu-db");
      
      // Validate category exists
      const category = getCategoryById(updateData.menu_category_id);
      if (!category) {
        return NextResponse.json(
          { error: "Menu category not found" },
          { status: 400 }
        );
      }
      
      // Validate menu item exists in category
      if (!validateMenuItem(updateData.menu_category_id, updateData.menu_item_name)) {
        return NextResponse.json(
          { error: "Menu item not found in the specified category" },
          { status: 400 }
        );
      }
    }
    
    if (updates.visible !== undefined) {
      updateData.visible = Boolean(updates.visible);
    }
    
    const item = updateFooterItem(itemId, updateData);
    
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update footer item", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete footer item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    const success = deleteFooterItem(itemId);
    
    if (!success) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete footer item", details: errorMessage },
      { status: 500 }
    );
  }
}

