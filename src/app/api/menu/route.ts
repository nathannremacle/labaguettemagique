import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import fs from "fs";
import path from "path";

const MENU_DATA_PATH = path.join(process.cwd(), "data", "menu.json");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Import menuData dynamically to avoid serialization issues
async function getDefaultMenuData() {
  const { menuData } = await import("@/components/MenuSection");
  return menuData;
}

// Helper to clean data for JSON serialization
function cleanForSerialization(data: any): any {
  if (data === null) {
    return null;
  }
  if (data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanForSerialization(item));
  }
  if (typeof data === 'object' && data !== null) {
    const cleaned: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        // Skip functions and undefined values
        if (typeof value !== 'function' && value !== undefined) {
          try {
            cleaned[key] = cleanForSerialization(value);
          } catch (e) {
            // Skip problematic values
            console.warn(`Skipping non-serializable value for key ${key}:`, e);
          }
        }
      }
    }
    return cleaned;
  }
  // Return primitive values as-is
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  // For any other type, return null
  return null;
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

// Read menu data from file or use default
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
      console.log("Menu file has test/empty data, reinitializing with default menu data");
    } catch (error) {
      console.error("Error reading menu data:", error);
    }
  }
  
  // Initialize with default data (only if file doesn't exist or has invalid data)
  try {
    const defaultMenuData = await getDefaultMenuData();
    if (!Array.isArray(defaultMenuData) || defaultMenuData.length === 0) {
      console.error("Default menu data is invalid");
      return [];
    }
    const extracted = extractMenuStructure(defaultMenuData);
    if (Array.isArray(extracted) && extracted.length > 0) {
      const defaultData = JSON.stringify(extracted, null, 2);
      fs.writeFileSync(MENU_DATA_PATH, defaultData, "utf-8");
      console.log(`Initialized menu.json with ${extracted.length} categories`);
      return extracted;
    }
    console.error("Failed to extract menu structure - extracted array is empty");
    return [];
  } catch (error) {
    console.error("Error initializing menu data:", error);
    return [];
  }
}

// Write menu data to file
function writeMenuData(data: any) {
  ensureDataDir();
  if (!data) {
    console.error("writeMenuData: data is undefined or null");
    return;
  }
  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(MENU_DATA_PATH, serialized, "utf-8");
  } catch (error) {
    console.error("Error writing menu data:", error);
    throw error;
  }
}

// GET - Read menu data (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const data = await readMenuData();
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.error("Menu data is not an array");
      return NextResponse.json([]);
    }
    if (data.length === 0) {
      console.warn("Menu data is empty array");
    }
    return NextResponse.json(data);
  } catch (readError: any) {
    console.error("Error reading menu data:", readError);
    // Return empty array on error
    return NextResponse.json([]);
  }
}

// PUT - Update entire menu
export async function PUT(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    writeMenuData(data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu data" },
      { status: 500 }
    );
  }
}
