import { NextRequest, NextResponse } from "next/server";
import { getVisibleFooterItems, getAllFooterItems } from "@/lib/footer-db";
import { requireAuth } from "@/lib/middleware";

// GET - Get footer items (public endpoint for visible items, admin endpoint for all)
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    // If authenticated, return all items; otherwise return only visible items
    const items = user ? getAllFooterItems() : getVisibleFooterItems();
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error reading footer items:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Create new footer item (admin only)
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.title || typeof data.title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    // Validate input lengths
    const title = String(data.title).trim();
    if (title.length === 0 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 1 and 200 characters" },
        { status: 400 }
      );
    }
    
    const description = data.description ? String(data.description).trim() : undefined;
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      );
    }
    
    const icon = data.icon ? String(data.icon).trim() : undefined;
    if (icon && icon.length > 100) {
      return NextResponse.json(
        { error: "Icon must be less than 100 characters" },
        { status: 400 }
      );
    }
    
    const link = data.link ? String(data.link).trim() : undefined;
    if (link && link.length > 500) {
      return NextResponse.json(
        { error: "Link must be less than 500 characters" },
        { status: 400 }
      );
    }
    
    // Validate link format if provided
    if (link && !link.startsWith("/") && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("mailto:") && !link.startsWith("tel:")) {
      return NextResponse.json(
        { error: "Invalid link format" },
        { status: 400 }
      );
    }
    
    const menu_item_name = data.menu_item_name ? String(data.menu_item_name).trim() : undefined;
    const menu_category_id = data.menu_category_id ? String(data.menu_category_id).trim() : undefined;
    
    // Validate menu item link if provided
    if (menu_item_name || menu_category_id) {
      if (!menu_item_name || !menu_category_id) {
        return NextResponse.json(
          { error: "Both menu_item_name and menu_category_id are required when linking to a menu item" },
          { status: 400 }
        );
      }
      
      const { validateMenuItem, getCategoryById } = await import("@/lib/menu-db");
      
      // Validate category exists
      const category = getCategoryById(menu_category_id);
      if (!category) {
        return NextResponse.json(
          { error: "Menu category not found" },
          { status: 400 }
        );
      }
      
      // Validate menu item exists in category
      if (!validateMenuItem(menu_category_id, menu_item_name)) {
        return NextResponse.json(
          { error: "Menu item not found in the specified category" },
          { status: 400 }
        );
      }
    }
    
    const { createFooterItem } = await import("@/lib/footer-db");
    const item = createFooterItem({
      title,
      description,
      icon,
      link,
      menu_item_name,
      menu_category_id,
      visible: data.visible !== false,
    });
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error creating footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create footer item", details: errorMessage },
      { status: 500 }
    );
  }
}

