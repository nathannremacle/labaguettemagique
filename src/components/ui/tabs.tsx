"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

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
  return (
    <div className={cn("w-full", className)}>
      <div className={`flex gap-1 rounded-full border p-1 overflow-x-auto scrollbar-hide ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-slate-100"
      }`} style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "flex-shrink-0 min-w-[100px] sm:flex-1 sm:min-w-0 select-none rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 whitespace-nowrap",
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
  );
}


