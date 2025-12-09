import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import fs from "fs";
import path from "path";

const MENU_DATA_PATH = path.join(process.cwd(), "data", "menu.json");

function readMenuData() {
  if (fs.existsSync(MENU_DATA_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MENU_DATA_PATH, "utf-8"));
    } catch (error) {
      return [];
    }
  }
  return [];
}

function writeMenuData(data: any) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(MENU_DATA_PATH, JSON.stringify(data, null, 2));
}

// GET category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { categoryId } = await params;
    const data = readMenuData();
    const category = data.find((cat: any) => cat.id === categoryId);
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read category" },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    const updates = await request.json();
    const data = readMenuData();
    const index = data.findIndex((cat: any) => cat.id === categoryId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    data[index] = { ...data[index], ...updates };
    writeMenuData(data);
    
    return NextResponse.json({ success: true, category: data[index] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    const data = readMenuData();
    const filtered = data.filter((cat: any) => cat.id !== categoryId);
    writeMenuData(filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

