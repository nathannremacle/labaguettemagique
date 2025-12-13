"use client";

import { useEffect } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export type AlertType = "error" | "warning" | "info" | "success";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: AlertType;
  mode?: "alert" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  message,
  type = "info",
  mode = "alert",
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}: AlertModalProps) {
  const { theme } = useTheme();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine styling based on type
  const isSuccess = type === "success";
  const borderColor = isSuccess ? "border-green-500" : "border-red-500";
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";
  const confirmButtonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className={cn("h-6 w-6", iconColor)} />;
      case "error":
        return <AlertCircle className={cn("h-6 w-6", iconColor)} />;
      case "warning":
        return <AlertTriangle className={cn("h-6 w-6", iconColor)} />;
      case "info":
      default:
        return <Info className={cn("h-6 w-6", iconColor)} />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "backdrop-blur-md transition-opacity duration-300",
        theme === "dark" ? "bg-black/60" : "bg-black/50"
      )}
      onClick={mode === "alert" ? onClose : undefined}
    >
      <div
        className={cn(
          "relative w-full max-w-md mx-4",
          "rounded-2xl border-2 shadow-2xl",
          "p-6",
          borderColor,
          theme === "dark"
            ? "bg-slate-900/95 backdrop-blur-xl"
            : "bg-white/95 backdrop-blur-xl",
          "animate-zoom-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (only for alert mode) */}
        {mode === "alert" && (
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
        )}

        {/* Icon and Message */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <p
            className={cn(
              "flex-1 text-base leading-relaxed",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          {mode === "confirm" && (
            <button
              onClick={handleCancel}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-colors",
                "min-w-[100px]",
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
              )}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={mode === "confirm" ? handleConfirm : onClose}
            className={cn(
              "px-6 py-2.5 rounded-lg font-medium transition-colors",
              "min-w-[100px]",
              mode === "alert" ? confirmButtonClass : confirmButtonClass
            )}
          >
            {mode === "alert" ? "OK" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

