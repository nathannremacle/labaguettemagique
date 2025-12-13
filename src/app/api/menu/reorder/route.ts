import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { reorderCategories, reorderItems } from "@/lib/menu-db";

// POST - Reorder categories
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, categoryId, ids } = body;
    
    if (type === "categories") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "Tableau d'identifiants de catégories invalide" },
          { status: 400 }
        );
      }
      
      reorderCategories(ids);
      return NextResponse.json({ success: true });
    }
    
    if (type === "items") {
      if (!categoryId || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "L'identifiant de catégorie et le tableau d'identifiants d'articles sont requis" },
          { status: 400 }
        );
      }
      
      const itemIds = ids.map((id: unknown) => parseInt(String(id))).filter((id: number) => !isNaN(id));
      if (itemIds.length !== ids.length) {
        return NextResponse.json(
          { error: "Identifiants d'articles invalides" },
          { status: 400 }
        );
      }
      
      reorderItems(categoryId, itemIds);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: "Type de réorganisation invalide. Utilisez 'categories' ou 'items'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error reordering:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: "Échec de la réorganisation", details: errorMessage },
        { status: 500 }
      );
  }
}

