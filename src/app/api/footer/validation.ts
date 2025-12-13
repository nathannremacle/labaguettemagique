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

interface ValidatedFooterItem {
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
  visible: boolean;
}

export function validateFooterItem(data: FooterItemData): { valid: boolean; error?: string; validated?: ValidatedFooterItem } {
  // Validate title
  if (!data.title || typeof data.title !== "string") {
    return { valid: false, error: "Le titre est requis" };
  }
  
  const title = String(data.title).trim();
  if (title.length === 0 || title.length > 200) {
    return { valid: false, error: "Le titre doit contenir entre 1 et 200 caractères" };
  }
  
  // Validate description
  const description = data.description ? String(data.description).trim() : undefined;
  if (description && description.length > 500) {
    return { valid: false, error: "La description doit contenir moins de 500 caractères" };
  }
  
  // Validate icon
  const icon = data.icon ? String(data.icon).trim() : undefined;
  if (icon && icon.length > 100) {
    return { valid: false, error: "L'icône doit contenir moins de 100 caractères" };
  }
  
  // Validate link
  const link = data.link ? String(data.link).trim() : undefined;
  if (link && link.length > 500) {
    return { valid: false, error: "Le lien doit contenir moins de 500 caractères" };
  }
  
  // Validate link format if provided
  if (link && !link.startsWith("/") && !link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("mailto:") && !link.startsWith("tel:")) {
    return { valid: false, error: "Format de lien invalide" };
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
      error: "Le nom d'article de menu et l'identifiant de catégorie sont requis lors de la liaison à un article de menu",
    };
  }
  
  const { validateMenuItem, getCategoryById } = await import("@/lib/menu-db");
  
  // Validate category exists
  const category = getCategoryById(menu_category_id);
  if (!category) {
    return { valid: false, error: "Catégorie de menu introuvable" };
  }
  
  // Validate menu item exists in category
  if (!validateMenuItem(menu_category_id, menu_item_name)) {
    return { valid: false, error: "Article de menu introuvable dans la catégorie spécifiée" };
  }
  
  return { valid: true };
}


