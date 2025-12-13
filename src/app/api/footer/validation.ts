import { NextResponse } from "next/server";

interface FooterItemData {
  title?: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
  visible?: boolean;
}

export function validateFooterItem(data: FooterItemData): { valid: boolean; error?: string; validated?: any } {
  // Validate title
  if (!data.title || typeof data.title !== "string") {
    return { valid: false, error: "Title is required" };
  }
  
  const title = String(data.title).trim();
  if (title.length === 0 || title.length > 200) {
    return { valid: false, error: "Title must be between 1 and 200 characters" };
  }
  
  // Validate description
  const description = data.description ? String(data.description).trim() : undefined;
  if (description && description.length > 500) {
    return { valid: false, error: "Description must be less than 500 characters" };
  }
  
  // Validate icon
  const icon = data.icon ? String(data.icon).trim() : undefined;
  if (icon && icon.length > 100) {
    return { valid: false, error: "Icon must be less than 100 characters" };
  }
  
  // Validate link
  const link = data.link ? String(data.link).trim() : undefined;
  if (link && link.length > 500) {
    return { valid: false, error: "Link must be less than 500 characters" };
  }
  
  // Validate link format if provided
  if (link && !link.startsWith("/") && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("mailto:") && !link.startsWith("tel:")) {
    return { valid: false, error: "Invalid link format" };
  }
  
  return {
    valid: true,
    validated: {
      title,
      description,
      icon,
      link,
      menu_item_name: data.menu_item_name ? String(data.menu_item_name).trim() : undefined,
      menu_category_id: data.menu_category_id ? String(data.menu_category_id).trim() : undefined,
      visible: data.visible !== false,
    },
  };
}

export async function validateMenuItemLink(
  menu_item_name: string | undefined,
  menu_category_id: string | undefined
): Promise<{ valid: boolean; error?: string }> {
  if (!menu_item_name && !menu_category_id) {
    return { valid: true };
  }
  
  if (!menu_item_name || !menu_category_id) {
    return {
      valid: false,
      error: "Both menu_item_name and menu_category_id are required when linking to a menu item",
    };
  }
  
  const { validateMenuItem, getCategoryById } = await import("@/lib/menu-db");
  
  // Validate category exists
  const category = getCategoryById(menu_category_id);
  if (!category) {
    return { valid: false, error: "Menu category not found" };
  }
  
  // Validate menu item exists in category
  if (!validateMenuItem(menu_category_id, menu_item_name)) {
    return { valid: false, error: "Menu item not found in the specified category" };
  }
  
  return { valid: true };
}


