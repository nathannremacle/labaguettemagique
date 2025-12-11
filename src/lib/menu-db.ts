import { getDatabase } from "./db";

export type Category = {
  id: string;
  label: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: number;
  category_id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  highlight: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export type CategoryWithItems = Category & {
  items: MenuItem[];
};

// Categories
export function getAllCategories(): Category[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM categories ORDER BY \"order\" ASC");
  return stmt.all() as Category[];
}

export function getCategoryById(id: string): Category | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM categories WHERE id = ?");
  const result = stmt.get(id) as Category | undefined;
  return result || null;
}

export function createCategory(data: { id: string; label: string }): Category {
  const db = getDatabase();
  
  // Get max order
  const maxOrderStmt = db.prepare("SELECT MAX(\"order\") as max_order FROM categories");
  const maxOrderResult = maxOrderStmt.get() as { max_order: number | null };
  const nextOrder = (maxOrderResult.max_order ?? -1) + 1;
  
  const stmt = db.prepare(`
    INSERT INTO categories (id, label, "order")
    VALUES (?, ?, ?)
  `);
  stmt.run(data.id, data.label, nextOrder);
  
  return getCategoryById(data.id)!;
}

export function updateCategory(id: string, data: { label?: string }): Category | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number)[] = [];
  
  if (data.label !== undefined) {
    updates.push("label = ?");
    values.push(data.label);
  }
  
  if (updates.length === 0) {
    return getCategoryById(id);
  }
  
  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE categories
    SET ${updates.join(", ")}
    WHERE id = ?
  `);
  stmt.run(...values);
  
  return getCategoryById(id);
}

export function deleteCategory(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM categories WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export function reorderCategories(ids: string[]): boolean {
  const db = getDatabase();
  const transaction = db.transaction((ids: string[]) => {
    const stmt = db.prepare("UPDATE categories SET \"order\" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    ids.forEach((id, index) => {
      stmt.run(index, id);
    });
  });
  
  transaction(ids);
  return true;
}

// Menu Items
export function getItemsByCategory(categoryId: string): MenuItem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM menu_items
    WHERE category_id = ?
    ORDER BY "order" ASC
  `);
  return stmt.all(categoryId) as MenuItem[];
}

export function getItemById(id: number): MenuItem | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM menu_items WHERE id = ?");
  const result = stmt.get(id) as MenuItem | undefined;
  return result || null;
}

export function createItem(data: {
  category_id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  highlight?: boolean;
}): MenuItem {
  const db = getDatabase();
  
  // Get max order for this category
  const maxOrderStmt = db.prepare(`
    SELECT MAX("order") as max_order FROM menu_items WHERE category_id = ?
  `);
  const maxOrderResult = maxOrderStmt.get(data.category_id) as { max_order: number | null };
  const nextOrder = (maxOrderResult.max_order ?? -1) + 1;
  
  const stmt = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, image, highlight, "order")
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.category_id,
    data.name,
    data.description,
    data.price,
    data.image || null,
    data.highlight ? 1 : 0,
    nextOrder
  );
  
  return getItemById(result.lastInsertRowid as number)!;
}

export function updateItem(id: number, data: {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
  highlight?: boolean;
}): MenuItem | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  
  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.price !== undefined) {
    updates.push("price = ?");
    values.push(data.price);
  }
  if (data.image !== undefined) {
    updates.push("image = ?");
    values.push(data.image || null);
  }
  if (data.highlight !== undefined) {
    updates.push("highlight = ?");
    values.push(data.highlight ? 1 : 0);
  }
  
  if (updates.length === 0) {
    return getItemById(id);
  }
  
  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE menu_items
    SET ${updates.join(", ")}
    WHERE id = ?
  `);
  stmt.run(...values);
  
  return getItemById(id);
}

export function deleteItem(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM menu_items WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export function reorderItems(categoryId: string, itemIds: number[]): boolean {
  const db = getDatabase();
  const transaction = db.transaction((categoryId: string, itemIds: number[]) => {
    const stmt = db.prepare(`
      UPDATE menu_items
      SET "order" = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND category_id = ?
    `);
    itemIds.forEach((itemId, index) => {
      stmt.run(index, itemId, categoryId);
    });
  });
  
  transaction(categoryId, itemIds);
  return true;
}

// Combined queries
export function getAllCategoriesWithItems(): CategoryWithItems[] {
  const categories = getAllCategories();
  return categories.map(category => ({
    ...category,
    items: getItemsByCategory(category.id),
  }));
}

// Validate menu item exists
export function validateMenuItem(categoryId: string, itemName: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM menu_items
    WHERE category_id = ? AND LOWER(name) = LOWER(?)
  `);
  const result = stmt.get(categoryId, itemName) as { count: number };
  return result.count > 0;
}

