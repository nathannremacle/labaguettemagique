"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        theme === "dark" ? "bg-black/50" : "bg-black/30"
      }`}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border p-6 shadow-2xl",
          theme === "dark"
            ? "border-white/20 bg-slate-900"
            : "border-slate-300 bg-white",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>{title}</h2>
          <button
            onClick={onClose}
            className={`rounded-full p-1 transition ${
              theme === "dark"
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={theme === "dark" ? "text-white/80" : "text-slate-700"}>{children}</div>
      </div>
    </div>
  );
}

