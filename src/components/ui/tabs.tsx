import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1">
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "flex-1 min-w-[110px] select-none rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
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


