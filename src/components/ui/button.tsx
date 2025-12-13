import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants: Record<
  "default" | "outline" | "ghost",
  string
> = {
  default:
    "inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-full border bg-transparent px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:focus-visible:outline-white",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500 dark:text-white dark:hover:bg-white/10 dark:focus-visible:outline-white",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

