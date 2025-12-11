import { getDatabase } from "./db";

export type FooterItem = {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

// Get all visible footer items
export function getVisibleFooterItems(): FooterItem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM footer_items 
    WHERE visible = 1 
    ORDER BY "order" ASC
  `);
  return stmt.all() as FooterItem[];
}

// Get all footer items (for admin)
export function getAllFooterItems(): FooterItem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM footer_items 
    ORDER BY "order" ASC
  `);
  return stmt.all() as FooterItem[];
}

// Get footer item by ID
export function getFooterItemById(id: number): FooterItem | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM footer_items WHERE id = ?");
  const result = stmt.get(id) as FooterItem | undefined;
  return result || null;
}

// Create footer item
export function createFooterItem(data: {
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
  visible?: boolean;
}): FooterItem {
  const db = getDatabase();
  
  // Get max order
  const maxOrderStmt = db.prepare("SELECT MAX(\"order\") as max_order FROM footer_items");
  const maxOrderResult = maxOrderStmt.get() as { max_order: number | null };
  const nextOrder = (maxOrderResult.max_order ?? -1) + 1;
  
  const stmt = db.prepare(`
    INSERT INTO footer_items (title, description, icon, link, menu_item_name, menu_category_id, "order", visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.description || null,
    data.icon || null,
    data.link || null,
    data.menu_item_name || null,
    data.menu_category_id || null,
    nextOrder,
    data.visible !== false ? 1 : 0
  );
  
  return getFooterItemById(result.lastInsertRowid as number)!;
}

// Update footer item
export function updateFooterItem(id: number, data: {
  title?: string;
  description?: string;
  icon?: string;
  link?: string;
  menu_item_name?: string;
  menu_category_id?: string;
  visible?: boolean;
}): FooterItem | null {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description || null);
  }
  if (data.icon !== undefined) {
    updates.push("icon = ?");
    values.push(data.icon || null);
  }
  if (data.link !== undefined) {
    updates.push("link = ?");
    values.push(data.link || null);
  }
  if (data.menu_item_name !== undefined) {
    updates.push("menu_item_name = ?");
    values.push(data.menu_item_name || null);
  }
  if (data.menu_category_id !== undefined) {
    updates.push("menu_category_id = ?");
    values.push(data.menu_category_id || null);
  }
  if (data.visible !== undefined) {
    updates.push("visible = ?");
    values.push(data.visible ? 1 : 0);
  }
  
  if (updates.length === 0) {
    return getFooterItemById(id);
  }
  
  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE footer_items
    SET ${updates.join(", ")}
    WHERE id = ?
  `);
  stmt.run(...values);
  
  return getFooterItemById(id);
}

// Delete footer item
export function deleteFooterItem(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM footer_items WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// Reorder footer items
export function reorderFooterItems(ids: number[]): boolean {
  const db = getDatabase();
  const transaction = db.transaction((ids: number[]) => {
    const stmt = db.prepare("UPDATE footer_items SET \"order\" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    ids.forEach((id, index) => {
      stmt.run(index, id);
    });
  });
  
  transaction(ids);
  return true;
}

