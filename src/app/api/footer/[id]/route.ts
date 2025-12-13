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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Identifiant d'élément invalide" },
        { status: 400 }
      );
    }
    
    const item = getFooterItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error reading footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Échec de la lecture de l'élément du footer", details: errorMessage },
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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    const updates = await request.json();
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Identifiant d'élément invalide" },
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
          { error: "Format de titre invalide" },
          { status: 400 }
        );
      }
      const title = updates.title.trim();
      if (title.length === 0 || title.length > 200) {
        return NextResponse.json(
          { error: "Le titre doit contenir entre 1 et 200 caractères" },
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
          { error: "Format de description invalide" },
          { status: 400 }
        );
        }
        const description = updates.description.trim();
        if (description.length > 500) {
        return NextResponse.json(
          { error: "La description doit contenir moins de 500 caractères" },
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
          { error: "Format d'icône invalide" },
          { status: 400 }
        );
        }
        const icon = updates.icon.trim();
        if (icon.length > 100) {
        return NextResponse.json(
          { error: "L'icône doit contenir moins de 100 caractères" },
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
          { error: "Format de lien invalide" },
          { status: 400 }
        );
        }
        const link = updates.link.trim();
        if (link.length > 500) {
        return NextResponse.json(
          { error: "Le lien doit contenir moins de 500 caractères" },
          { status: 400 }
        );
        }
        // Validate link format
        if (link && !link.startsWith("/") && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("mailto:") && !link.startsWith("tel:")) {
        return NextResponse.json(
          { error: "Format de lien invalide" },
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
          { error: "Format de nom d'article de menu invalide" },
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
          { error: "Format d'identifiant de catégorie de menu invalide" },
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
          { error: "Le nom d'article de menu et l'identifiant de catégorie sont requis lors de la liaison à un article de menu" },
          { status: 400 }
        );
      }
      
      const { validateMenuItem, getCategoryById } = await import("@/lib/menu-db");
      
      // Validate category exists
      const category = getCategoryById(updateData.menu_category_id);
      if (!category) {
        return NextResponse.json(
          { error: "Catégorie de menu introuvable" },
          { status: 400 }
        );
      }
      
      // Validate menu item exists in category
      if (!validateMenuItem(updateData.menu_category_id, updateData.menu_item_name)) {
        return NextResponse.json(
          { error: "Article de menu introuvable dans la catégorie spécifiée" },
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
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error updating footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Échec de la mise à jour de l'élément du footer", details: errorMessage },
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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Identifiant d'élément invalide" },
        { status: 400 }
      );
    }
    
    const success = deleteFooterItem(itemId);
    
    if (!success) {
      return NextResponse.json(
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer item:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Échec de la suppression de l'élément du footer", details: errorMessage },
        { status: 500 }
      );
  }
}

