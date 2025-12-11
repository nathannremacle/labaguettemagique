import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";
import { getDatabase } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "menu-items");
const THUMBNAILS_DIR = path.join(process.cwd(), "public", "images", "menu-items", "thumbnails");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(THUMBNAILS_DIR)) {
    await mkdir(THUMBNAILS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Process image with sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Sanitize original filename to prevent path traversal
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100); // Limit length
    
    // Generate unique filename base (prevents collisions and path traversal)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const baseFilename = `${timestamp}-${randomString}`;
    
    // Optimized image (max 1200px width, WebP format)
    const optimizedFilename = `${baseFilename}.webp`;
    const optimizedPath = path.join(UPLOAD_DIR, optimizedFilename);
    
    // Validate path to prevent directory traversal attacks
    const resolvedPath = path.resolve(optimizedPath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }
    
    const optimizedBuffer = await image
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 85 })
      .toBuffer();
    
    await writeFile(optimizedPath, optimizedBuffer);
    
    // Thumbnail (400px width, WebP format)
    const thumbnailFilename = `${baseFilename}-thumb.webp`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);
    
    const thumbnailBuffer = await image
      .resize(400, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    await writeFile(thumbnailPath, thumbnailBuffer);
    
    // Get optimized image dimensions
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();
    
    // Save image metadata to database
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO images (filename, original_filename, path, width, height, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      optimizedFilename,
      sanitizedOriginalName,
      `/images/menu-items/${optimizedFilename}`,
      optimizedMetadata.width || metadata.width || 0,
      optimizedMetadata.height || metadata.height || 0,
      optimizedBuffer.length
    );
    
    // Return the public URL (use optimized version)
    const publicUrl = `/images/menu-items/${optimizedFilename}`;
    const thumbnailUrl = `/images/menu-items/thumbnails/${thumbnailFilename}`;
    
    return NextResponse.json({ 
      url: publicUrl, 
      thumbnail: thumbnailUrl,
      filename: optimizedFilename,
      width: optimizedMetadata.width,
      height: optimizedMetadata.height,
      size: optimizedBuffer.length,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to upload file", details: errorMessage },
      { status: 500 }
    );
  }
}


