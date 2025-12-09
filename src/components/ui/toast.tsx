"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 animate-slide-in-right ${
        theme === "dark" ? "bg-green-600" : "bg-green-500"
      } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[250px]`}
    >
      <Check className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="hover:bg-white/20 rounded p-1 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

