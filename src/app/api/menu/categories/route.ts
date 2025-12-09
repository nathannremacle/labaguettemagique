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
      const cleaned = cleanForSerialization(extracted);
      const defaultData = JSON.stringify(cleaned, null, 2);
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
    throw new Error("Cannot write undefined or null data");
  }
  try {
    const cleaned = cleanForSerialization(data);
    const serialized = JSON.stringify(cleaned, null, 2);
    fs.writeFileSync(MENU_DATA_PATH, serialized, "utf-8");
  } catch (error) {
    console.error("Error writing menu data:", error);
    throw error;
  }
}

// GET all categories
export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await readMenuData();
    if (!Array.isArray(data)) {
      console.error("Menu data is not an array");
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error reading categories:", error);
    return NextResponse.json(
      { error: "Failed to read categories", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newCategory = await request.json();
    
    // Validate input
    if (!newCategory || !newCategory.label || typeof newCategory.label !== 'string') {
      return NextResponse.json(
        { error: "Category label is required" },
        { status: 400 }
      );
    }

    const label = newCategory.label.trim();
    if (label.length === 0) {
      return NextResponse.json(
        { error: "Category label cannot be empty" },
        { status: 400 }
      );
    }

    let data = await readMenuData();
    
    if (!Array.isArray(data)) {
      console.error("Menu data is not an array, initializing...");
      const defaultData = await readMenuData();
      if (!Array.isArray(defaultData)) {
        return NextResponse.json(
          { error: "Failed to initialize menu data" },
          { status: 500 }
        );
      }
      data = defaultData;
    }
    
    // Generate ID from label
    const id = label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    // Check if category with same ID already exists
    const existingCategory = data.find((cat: any) => cat.id === id);
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }
    
    const category = {
      id,
      label,
      items: [],
    };
    
    data.push(category);
    
    try {
      writeMenuData(data);
    } catch (writeError: any) {
      console.error("Error writing menu data:", writeError);
      return NextResponse.json(
        { error: "Failed to save category", details: writeError.message || String(writeError) },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

