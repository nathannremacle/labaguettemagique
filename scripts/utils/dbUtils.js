const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'menu.db');

/**
 * Get menu categories and items from database
 */
function getMenuData() {
  const db = new Database(DB_PATH);
  
  try {
    // Get all categories
    const categoriesStmt = db.prepare(`
      SELECT id, label FROM categories ORDER BY "order" ASC
    `);
    const categories = categoriesStmt.all();
    
    // Get items for each category
    const itemsStmt = db.prepare(`
      SELECT category_id, name FROM menu_items WHERE category_id = ?
    `);
    
    const menuData = {};
    for (const cat of categories) {
      const items = itemsStmt.all(cat.id);
      menuData[cat.id] = {
        label: cat.label,
        items: items.map(i => i.name)
      };
    }
    
    return menuData;
  } finally {
    db.close();
  }
}

module.exports = { getMenuData };

