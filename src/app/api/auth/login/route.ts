import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur et le mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Format d'entrée invalide" },
        { status: 400 }
      );
    }

    // Sanitize input length (prevent DoS)
    if (username.length > 100 || password.length > 500) {
      return NextResponse.json(
        { error: "Entrée trop longue" },
        { status: 400 }
      );
    }

    // Attempt authentication
    const result = authenticate(username, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Identifiants invalides" },
        { status: 401 }
      );
    }

    if (!result.sessionId) {
      console.error("[Login API] Authentication succeeded but no sessionId returned");
      return NextResponse.json(
        { error: "Échec de la création de la session" },
        { status: 500 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // Set session cookie
    const isProduction = (process.env.NODE_ENV as string) === "production";
    response.cookies.set("admin_session", result.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });


    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
