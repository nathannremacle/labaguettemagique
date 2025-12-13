import { MenuCategory, MenuItem } from "@/components/MenuSection";

/**
 * Format price with euro symbol
 */
export function formatPrice(price: string | undefined): string {
  if (!price) return "";
  // Remove all spaces from the price (fix for "4000" -> "4 0 0 0" issue)
  let cleaned = price.replace(/\s+/g, '');
  // For price ranges, ensure proper spacing around dash
  cleaned = cleaned.replace(/([\d,.]+)-([\d,.]+)/g, '$1 - $2');
  if (cleaned.includes("€")) return cleaned;
  return `${cleaned} €`;
}

/**
 * Format price input (only numbers, comma, dot, dash, space)
 */
export function formatPriceInput(value: string): string {
  let cleaned = value.replace(/€/g, '').trim();
  // Remove all spaces first
  cleaned = cleaned.replace(/\s+/g, '');
  // Only allow numbers, comma, dot, and dash
  cleaned = cleaned.replace(/[^\d,.\-]/g, '');
  // For price ranges, add space around dash: "5,50-6,50" -> "5,50 - 6,50"
  // Match pattern like "number-number" where number can contain digits, commas, or dots
  cleaned = cleaned.replace(/([\d,.]+)-([\d,.]+)/g, '$1 - $2');
  if (cleaned) {
    return cleaned + ' €';
  }
  return cleaned;
}

/**
 * Get all items flattened with category info
 */
export function getAllItems(menuData: MenuCategory[]) {
  return menuData.flatMap(category =>
    (category.items || []).map(item => ({
      ...item,
      categoryId: category.id,
      categoryLabel: category.label,
    }))
  );
}

/**
 * Filter items in a category based on search query
 */
export function filterCategoryItems(items: MenuItem[], searchQuery: string): MenuItem[] {
  if (searchQuery === "") return items;
  const query = searchQuery.toLowerCase();
  return items.filter(item => 
    (item.name && item.name.toLowerCase().includes(query)) ||
    (item.description && item.description.toLowerCase().includes(query)) ||
    (item.price && item.price.toLowerCase().includes(query))
  );
}

/**
 * Normalize item ID to number or undefined
 */
export function normalizeItemId(id: unknown): number | undefined {
  if (id == null) return undefined;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  const num = Number(id);
  return isNaN(num) ? undefined : num;
}

