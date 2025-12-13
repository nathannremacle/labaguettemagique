import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { getAllCategoriesWithItems } from "@/lib/menu-db";

// GET - Read menu data (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const data = getAllCategoriesWithItems();
    
    // Convert to API format (remove database-specific fields, convert highlight to boolean)
    // Include item IDs as they are needed for admin functionality
    const formatted = data.map(category => ({
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
    console.error("Error reading menu data:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de la lecture du menu" }, { status: 500 });
  }
}

// PUT - Update entire menu (for bulk updates)
export async function PUT(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // This endpoint can be used for bulk updates if needed
    // For now, individual CRUD operations are handled by other endpoints
    return NextResponse.json(
      { error: "Utilisez les endpoints individuels de catégorie/article pour les mises à jour" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour des données du menu" },
      { status: 500 }
    );
  }
}
