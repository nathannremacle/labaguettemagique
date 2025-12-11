"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState, useRef } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  const { theme } = useTheme();
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const dragStartY = useRef(0);
  const dragYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  
  // Keep onClose ref up to date
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setJustOpened(true);
      // Reset justOpened after animation completes
      const timer = setTimeout(() => setJustOpened(false), 400);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      // Restore scroll immediately when dialog closes
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Reset drag state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
      dragYRef.current = 0;
      isDraggingRef.current = false;
      dragStartY.current = 0;
    }
  }, [isOpen]);

  // Update refs when state changes
  useEffect(() => {
    dragYRef.current = dragY;
  }, [dragY]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Set up non-passive touch event listeners
  useEffect(() => {
    if (!isOpen) {
      // Reset all drag state when dialog is not open
      setDragY(0);
      setIsDragging(false);
      dragYRef.current = 0;
      isDraggingRef.current = false;
      dragStartY.current = 0;
      return;
    }

    // Wait for the element to be mounted
    let rafId: number | null = null;
    let cleanupFn: (() => void) | null = null;
    let isCancelled = false;

    const setupListeners = () => {
      if (isCancelled) return;
      
      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        // Retry if element not ready yet
        rafId = requestAnimationFrame(setupListeners);
        return;
      }

      // Reset drag state when dialog opens
      setDragY(0);
      setIsDragging(false);
      dragYRef.current = 0;
      isDraggingRef.current = false;
      dragStartY.current = 0;

      const handleTouchStart = (e: TouchEvent) => {
        // Only allow dragging from the top area (header or drag handle)
        const target = e.target as HTMLElement;
        const isTopArea = target.closest('[data-drag-handle]') || 
                          target.closest('h2') || 
                          target.closest('button[aria-label="Fermer"]');
        
        if (isTopArea || e.touches[0].clientY < 100) {
          dragStartY.current = e.touches[0].clientY;
          isDraggingRef.current = true;
          setIsDragging(true);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current) return;
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - dragStartY.current;
        
        // Only allow dragging down
        if (deltaY > 0) {
          dragYRef.current = deltaY;
          setDragY(deltaY);
          
          // Prevent scrolling when dragging
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleTouchEnd = () => {
        if (!isDraggingRef.current) return;
        
        const threshold = 150; // pixels to drag before closing
        const currentDragY = dragYRef.current;
        
        if (currentDragY > threshold) {
          onCloseRef.current();
        } else {
          // Spring back animation
          setDragY(0);
          dragYRef.current = 0;
        }
        isDraggingRef.current = false;
        setIsDragging(false);
      };

      // Add event listeners with { passive: false } for touchmove to allow preventDefault
      dialogElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      dialogElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      dialogElement.addEventListener('touchend', handleTouchEnd, { passive: true });

      cleanupFn = () => {
        dialogElement.removeEventListener('touchstart', handleTouchStart);
        dialogElement.removeEventListener('touchmove', handleTouchMove);
        dialogElement.removeEventListener('touchend', handleTouchEnd);
      };
    };

    setupListeners();

    return () => {
      isCancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
        "backdrop-blur-md transition-opacity duration-300",
        theme === "dark" ? "bg-black/60" : "bg-black/50"
      )}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh]",
          "rounded-t-3xl sm:rounded-2xl border-0",
          "shadow-2xl",
          isDragging ? "overflow-hidden" : "overflow-y-auto",
          "mx-0 sm:mx-4 mb-0 sm:mb-4",
          "transform",
          !isDragging && justOpened && "animate-slide-in-from-bottom sm:animate-zoom-in",
          !isDragging && !justOpened && "transition-transform duration-200 ease-out",
          "p-4 sm:p-6",
          theme === "dark"
            ? "bg-slate-900/95 backdrop-blur-xl border-white/10"
            : "bg-white/95 backdrop-blur-xl border-slate-200/50",
          className
        )}
        style={{
          transform: isDragging 
            ? `translateY(${dragY}px) scale(${Math.max(0.9, 1 - dragY / 1000)})` 
            : dragY > 0 
            ? `translateY(${dragY}px)` 
            : undefined,
          opacity: isDragging 
            ? Math.max(0.5, 1 - dragY / 400) 
            : dragY > 0
            ? Math.max(0.5, 1 - dragY / 400)
            : undefined,
          transition: isDragging ? 'none' : dragY > 0 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div 
          className="sm:hidden flex justify-center mb-3 pt-2 touch-none"
          data-drag-handle
        >
          <div className={cn(
            "w-12 h-1.5 rounded-full transition-all duration-200",
            isDragging 
              ? "bg-slate-300 dark:bg-slate-500 w-16" 
              : "bg-slate-400/50 dark:bg-slate-600/50"
          )} />
        </div>

        {/* Header */}
        <div 
          className="flex items-center justify-between mb-4 sm:mb-6 pb-2 touch-none"
          data-drag-handle
        >
          <h2 className={cn(
            "text-xl sm:text-2xl font-bold pr-4",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "rounded-full p-2 transition-all",
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "touch-manipulation",
              theme === "dark"
                ? "text-white/70 hover:bg-white/10 hover:text-white active:bg-white/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
            )}
            aria-label="Fermer"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className={cn(
          theme === "dark" ? "text-white/90" : "text-slate-700",
          "pb-safe"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

