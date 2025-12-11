/**
 * Utility functions for API route error handling
 */

import { NextResponse } from "next/server";

/**
 * Standard error response format
 */
export interface ApiError {
  error: string;
  details?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string,
  status: number = 500
): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${defaultMessage}:`, error);
  
  return NextResponse.json(
    {
      error: defaultMessage,
      details: errorMessage,
    },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Validate request body has required fields
 */
export function validateRequiredFields(
  body: unknown,
  fields: string[]
): { valid: boolean; missing?: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, missing: fields[0] };
  }

  for (const field of fields) {
    if (!(field in body) || (body as Record<string, unknown>)[field] === undefined) {
      return { valid: false, missing: field };
    }
  }

  return { valid: true };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min: number = 1,
  max: number = 1000
): boolean {
  return value.length >= min && value.length <= max;
}

