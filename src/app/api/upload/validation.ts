import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 5MB.",
    };
  }

  return { valid: true };
}

export function validateFilePath(filePath: string, uploadDir: string): { valid: boolean; error?: string } {
  const resolvedPath = require("path").resolve(filePath);
  const resolvedUploadDir = require("path").resolve(uploadDir);
  
  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    return { valid: false, error: "Invalid file path" };
  }
  
  return { valid: true };
}


