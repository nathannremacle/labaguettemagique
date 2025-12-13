"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

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

  // Prevent body scroll when toast is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isVisible]);

  // Handle ESC key
  useEffect(() => {
    if (!isVisible) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "backdrop-blur-md transition-opacity duration-300",
        theme === "dark" ? "bg-black/60" : "bg-black/50"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md mx-4",
          "rounded-2xl border-2 border-green-500 shadow-2xl",
          "p-6",
          theme === "dark"
            ? "bg-slate-900/95 backdrop-blur-xl"
            : "bg-white/95 backdrop-blur-xl",
          "animate-zoom-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 rounded-full p-2 transition-all",
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            theme === "dark"
              ? "text-white/70 hover:bg-white/10 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon and Message */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <p
            className={cn(
              "flex-1 text-base leading-relaxed",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            {message}
          </p>
        </div>

        {/* OK Button */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-medium transition-colors min-w-[100px] bg-green-600 hover:bg-green-700 text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

