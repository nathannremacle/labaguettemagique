import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const PLACEHOLDERS_DIR = path.join(process.cwd(), "public", "images", "placeholders");
const MENU_ITEMS_DIR = path.join(process.cwd(), "public", "images", "menu-items");

export async function GET(request: NextRequest) {
  try {
    const images: string[] = [];

    // Read placeholder images
    try {
      const placeholderFiles = await readdir(PLACEHOLDERS_DIR);
      const placeholderImages = placeholderFiles
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map((file) => `/images/placeholders/${file}`);
      images.push(...placeholderImages);
    } catch (error) {
      console.error("Error reading placeholders directory:", error);
    }

    // Read uploaded menu item images
    try {
      const menuItemFiles = await readdir(MENU_ITEMS_DIR);
      const menuItemImages = menuItemFiles
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map((file) => `/images/menu-items/${file}`);
      images.push(...menuItemImages);
    } catch (error) {
      console.error("Error reading placeholders directory:", error);
    }

    // Sort images alphabetically
    images.sort();

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

