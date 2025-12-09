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

// POST - Create new item in category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId } = await params;
    const newItem = await request.json();
    const data = readMenuData();
    const categoryIndex = data.findIndex((cat: any) => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    if (!data[categoryIndex].items) {
      data[categoryIndex].items = [];
    }
    
    data[categoryIndex].items.push(newItem);
    writeMenuData(data);
    
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

