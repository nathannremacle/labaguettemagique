import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { changePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Input validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Format d'entrée invalide" },
        { status: 400 }
      );
    }

    // Sanitize input length
    if (currentPassword.length > 500 || newPassword.length > 500) {
      return NextResponse.json(
        { error: "Entrée trop longue" },
        { status: 400 }
      );
    }

    // Attempt to change password
    const result = changePassword(currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Échec du changement de mot de passe" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}





