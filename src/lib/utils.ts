/**
 * Combine class names, filtering out falsy values
 * @param classes - Array of class names (can include undefined, null, or false)
 * @returns Combined class string
 */
export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Create URL-friendly slug from text
 * Removes accents, converts to lowercase, and replaces spaces with dashes
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}

/**
 * Decode slug back to original text (approximate)
 * Note: This is a best-effort approach since slugs lose some information
 * @param slug - The slug to decode
 * @returns Decoded text with capitalized words
 */
export function decodeSlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

