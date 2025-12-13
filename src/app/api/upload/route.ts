import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { writeFile, mkdir } from "fs/promises";
import { access } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getDatabase } from "@/lib/db";
import { validateFile, validateFilePath } from "./validation";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "menu-items");
const THUMBNAILS_DIR = path.join(process.cwd(), "public", "images", "menu-items", "thumbnails");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await access(UPLOAD_DIR);
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  try {
    await access(THUMBNAILS_DIR);
  } catch {
    await mkdir(THUMBNAILS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
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
    const pathValidation = validateFilePath(optimizedPath, UPLOAD_DIR);
    if (!pathValidation.valid) {
      return NextResponse.json(
        { error: pathValidation.error },
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
        { error: "Échec du téléchargement du fichier", details: errorMessage },
        { status: 500 }
      );
  }
}


