"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useRef, useEffect, useState } from "react";

export interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onValueChange, className }: TabsProps) {
  const { theme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftFade(scrollLeft > 0);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <div className="relative w-full max-w-full">
        {/* Left fade gradient */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 z-20 pointer-events-none transition-opacity duration-200",
            showLeftFade ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: `linear-gradient(to right, ${
              theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"
            }, transparent)`,
          }}
        />
        
        {/* Right fade gradient */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-8 z-20 pointer-events-none transition-opacity duration-200",
            showRightFade ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: `linear-gradient(to left, ${
              theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"
            }, transparent)`,
          }}
        />

        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-1 rounded-full border p-1 overflow-x-auto scrollbar-hide md:overflow-x-visible md:flex-wrap md:justify-center",
            "px-2 md:px-1", // Add horizontal padding on mobile
            theme === "dark"
              ? "border-white/10 bg-white/5"
              : "border-slate-200 bg-slate-100"
          )}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.value === value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  onValueChange(tab.value);
                }}
                className={cn(
                  "flex-shrink-0 min-w-[120px] sm:min-w-[140px] select-none rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 whitespace-nowrap overflow-hidden text-ellipsis relative z-10 pointer-events-auto",
                  theme === "dark"
                    ? "focus-visible:ring-amber-300"
                    : "focus-visible:ring-amber-500",
                  isActive
                    ? theme === "dark"
                      ? "bg-white text-slate-950 shadow-sm font-bold"
                      : "bg-white text-slate-900 shadow-sm font-bold"
                    : theme === "dark"
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


