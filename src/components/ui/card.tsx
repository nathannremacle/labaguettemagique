"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-lg backdrop-blur transition cursor-pointer",
        theme === "dark"
          ? "border-white/10 bg-white/5 shadow-black/20 hover:border-amber-300/70 hover:bg-white/10 hover:shadow-amber-500/30"
          : "border-slate-200 bg-white shadow-slate-200/50 hover:border-amber-400 hover:bg-slate-50 hover:shadow-amber-200/50",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { theme } = useTheme();
  return (
    <h3
      className={cn(
        "text-lg font-semibold",
        theme === "dark" ? "text-white" : "text-slate-900",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { theme } = useTheme();
  return (
    <p
      className={cn(
        "text-sm leading-relaxed",
        theme === "dark" ? "text-white/80" : "text-slate-600",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-end justify-between", className)} {...props} />;
}

