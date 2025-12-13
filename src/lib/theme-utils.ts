/**
 * Utility functions for theme-based styling
 */

type Theme = "dark" | "light";

/**
 * Get theme-based border color classes
 */
export function getThemeBorder(theme: Theme): string {
  return theme === "dark" ? "border-white/10" : "border-slate-200";
}

/**
 * Get theme-based background color classes
 */
export function getThemeBg(theme: Theme): string {
  return theme === "dark" ? "bg-slate-950" : "bg-white";
}

/**
 * Get theme-based text color classes
 */
export function getThemeText(theme: Theme): string {
  return theme === "dark" ? "text-white" : "text-slate-900";
}

/**
 * Get theme-based secondary text color classes
 */
export function getThemeTextSecondary(theme: Theme): string {
  return theme === "dark" ? "text-white/70" : "text-slate-600";
}

/**
 * Get theme-based card background classes
 */
export function getThemeCardBg(theme: Theme): string {
  return theme === "dark" ? "bg-white/5" : "bg-white";
}

/**
 * Get theme-based hover background classes
 */
export function getThemeHoverBg(theme: Theme): string {
  return theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-50";
}

/**
 * Get theme-based header background classes
 */
export function getThemeHeaderBg(theme: Theme): string {
  return theme === "dark"
    ? "border-white/10 bg-slate-950/70"
    : "border-slate-200 bg-white/70";
}

/**
 * Get theme-based amber color classes (for highlights)
 */
export function getThemeAmber(theme: Theme, variant: "text" | "bg" = "text"): string {
  if (variant === "text") {
    return theme === "dark" ? "text-amber-300" : "text-amber-600";
  }
  return theme === "dark" ? "bg-amber-300" : "bg-amber-600";
}

/**
 * Combine multiple theme-based classes
 */
export function combineThemeClasses(
  theme: Theme,
  classes: {
    border?: boolean;
    bg?: boolean;
    text?: boolean;
    textSecondary?: boolean;
    cardBg?: boolean;
    hoverBg?: boolean;
    headerBg?: boolean;
    amber?: "text" | "bg" | false;
  }
): string {
  const classList: string[] = [];

  if (classes.border) classList.push(getThemeBorder(theme));
  if (classes.bg) classList.push(getThemeBg(theme));
  if (classes.text) classList.push(getThemeText(theme));
  if (classes.textSecondary) classList.push(getThemeTextSecondary(theme));
  if (classes.cardBg) classList.push(getThemeCardBg(theme));
  if (classes.hoverBg) classList.push(getThemeHoverBg(theme));
  if (classes.headerBg) classList.push(getThemeHeaderBg(theme));
  if (classes.amber) classList.push(getThemeAmber(theme, classes.amber));

  return classList.join(" ");
}





