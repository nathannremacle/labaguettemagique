"use client";

import { useEffect } from "react";

/**
 * Suppresses Next.js 16 async params/searchParams warnings from React DevTools
 * These warnings occur when React DevTools tries to serialize Promise objects
 * that Next.js uses internally. They are harmless and can be safely suppressed.
 */
export function SuppressDevWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function (...args: any[]) {
      const message = args[0]?.toString() || "";
      if (
        message.includes("params are being enumerated") ||
        (message.includes("searchParams") && message.includes("Promise")) ||
        message.includes("sync-dynamic-apis")
      ) {
        return; // Suppress these specific warnings
      }
      originalError.apply(console, args);
    };

    console.warn = function (...args: any[]) {
      const message = args[0]?.toString() || "";
      if (
        message.includes("params are being enumerated") ||
        (message.includes("searchParams") && message.includes("Promise")) ||
        message.includes("sync-dynamic-apis")
      ) {
        return; // Suppress these specific warnings
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}

