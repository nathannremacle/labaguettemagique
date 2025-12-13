import { NextRequest, NextResponse } from "next/server";
import { getVisibleFooterItems, getAllFooterItems } from "@/lib/footer-db";
import { requireAuth } from "@/lib/middleware";
import { validateFooterItem, validateMenuItemLink } from "./validation";

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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate footer item data
    const validation = validateFooterItem(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Validate menu item link if provided
    const menuLinkValidation = await validateMenuItemLink(
      validation.validated.menu_item_name,
      validation.validated.menu_category_id
    );
    if (!menuLinkValidation.valid) {
      return NextResponse.json(
        { error: menuLinkValidation.error },
        { status: 400 }
      );
    }
    
    const { createFooterItem } = await import("@/lib/footer-db");
    const item = createFooterItem(validation.validated);
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error creating footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Échec de la création de l'élément du footer", details: errorMessage },
        { status: 500 }
      );
  }
}

