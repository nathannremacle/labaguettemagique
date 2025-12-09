import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import fs from "fs";
import path from "path";

const MENU_DATA_PATH = path.join(process.cwd(), "data", "menu.json");

// Import menuData dynamically to avoid serialization issues
async function getDefaultMenuData() {
  const { menuData } = await import("@/components/MenuSection");
  return menuData;
}

// Safely extract menu data structure
function extractMenuStructure(menuData: any[]): any[] {
  if (!Array.isArray(menuData)) {
    return [];
  }
  return menuData.map(cat => ({
    id: String(cat.id || ''),
    label: String(cat.label || ''),
    items: Array.isArray(cat.items) ? cat.items.map((item: any) => ({
      name: String(item.name || ''),
      description: String(item.description || ''),
      price: String(item.price || ''),
      image: item.image ? String(item.image) : undefined,
      highlight: Boolean(item.highlight || false),
    })) : []
  }));
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

async function readMenuData() {
  ensureDataDir();
  
  if (fs.existsSync(MENU_DATA_PATH)) {
    try {
      const fileData = fs.readFileSync(MENU_DATA_PATH, "utf-8");
      if (!fileData || fileData.trim() === '' || fileData.trim() === '[]') {
        // File is empty or just empty array, need to initialize
        throw new Error("File is empty or invalid");
      }
      const parsed = JSON.parse(fileData);
      // If file exists and has valid data, return it
      if (Array.isArray(parsed) && parsed.length > 0 && 
          !(parsed.length === 1 && parsed[0].id === "test")) {
        return parsed;
      }
      // Data exists but is invalid (empty array or test data)
      throw new Error("File has invalid data");
    } catch (error) {
      // Initialize with default data
      try {
        const defaultMenuData = await getDefaultMenuData();
        if (!Array.isArray(defaultMenuData) || defaultMenuData.length === 0) {
          return [];
        }
        const extracted = extractMenuStructure(defaultMenuData);
        if (Array.isArray(extracted) && extracted.length > 0) {
          const defaultData = JSON.stringify(extracted, null, 2);
          fs.writeFileSync(MENU_DATA_PATH, defaultData, "utf-8");
          return extracted;
        }
        return [];
      } catch (e) {
        console.error("Error initializing menu data:", e);
        return [];
      }
    }
  }
  
  // Initialize with default data (file doesn't exist)
  try {
    const defaultMenuData = await getDefaultMenuData();
    if (!Array.isArray(defaultMenuData) || defaultMenuData.length === 0) {
      return [];
    }
    const extracted = extractMenuStructure(defaultMenuData);
    if (Array.isArray(extracted) && extracted.length > 0) {
      const defaultData = JSON.stringify(extracted, null, 2);
      fs.writeFileSync(MENU_DATA_PATH, defaultData, "utf-8");
      return extracted;
    }
    return [];
  } catch (error) {
    console.error("Error initializing menu data:", error);
    return [];
  }
}

function writeMenuData(data: any) {
  if (!data) {
    console.error("writeMenuData: data is undefined or null");
    return;
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(MENU_DATA_PATH, serialized, "utf-8");
  } catch (error) {
    console.error("Error writing menu data:", error);
    throw error;
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemIndex: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, itemIndex: itemIndexStr } = await params;
    const updates = await request.json();
    const data = await readMenuData();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Menu data not initialized" },
        { status: 500 }
      );
    }
    
    const categoryIndex = data.findIndex((cat: any) => cat.id === categoryId);
    const itemIndex = parseInt(itemIndexStr);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Ensure items array exists
    if (!data[categoryIndex].items) {
      data[categoryIndex].items = [];
    }
    
    if (itemIndex < 0 || itemIndex >= data[categoryIndex].items.length) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    // Create updated item, ensuring all fields are properly set
    const currentItem = data[categoryIndex].items[itemIndex] || {};
    const updatedItem = {
      ...currentItem,
      ...updates,
      // Ensure required fields are present
      name: updates.name !== undefined ? String(updates.name) : String(currentItem.name || ''),
      price: updates.price !== undefined ? String(updates.price) : String(currentItem.price || ''),
      description: updates.description !== undefined ? String(updates.description) : String(currentItem.description || ""),
      // Image can be undefined, empty string, or a URL
      image: updates.image !== undefined ? (updates.image ? String(updates.image) : undefined) : currentItem.image,
      // Preserve highlight if it exists
      highlight: updates.highlight !== undefined ? Boolean(updates.highlight) : Boolean(currentItem.highlight || false),
    };
    
    data[categoryIndex].items[itemIndex] = updatedItem;
    
    try {
      writeMenuData(data);
    } catch (writeError: any) {
      console.error("Error writing menu data:", writeError);
      return NextResponse.json(
        { error: "Failed to save menu data", details: writeError.message || String(writeError) },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      item: updatedItem 
    });
  } catch (error: any) {
    console.error("Error updating item:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to update item", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemIndex: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, itemIndex: itemIndexStr } = await params;
    const data = await readMenuData();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Menu data not initialized" },
        { status: 500 }
      );
    }
    
    const categoryIndex = data.findIndex((cat: any) => cat.id === categoryId);
    const itemIndex = parseInt(itemIndexStr);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    if (!data[categoryIndex].items) {
      data[categoryIndex].items = [];
    }
    
    if (itemIndex < 0 || itemIndex >= data[categoryIndex].items.length) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    data[categoryIndex].items.splice(itemIndex, 1);
    writeMenuData(data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item", details: error.message },
      { status: 500 }
    );
  }
}

