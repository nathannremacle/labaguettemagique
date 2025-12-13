const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');

// Function to get menu categories and items
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

// Footer items to add/update - these should link to actual menu items
// You can customize these based on your menu
const footerItems = [
  {
    title: 'Frites Maison',
    description: 'Découvrez nos frites croustillantes',
    icon: '🍟',
    menu_category_id: 'frites-snacks',
    menu_item_name: 'Frites',
    visible: true
  },
  {
    title: 'Pita Hawaï',
    description: 'Nos délicieuses pitas préparées',
    icon: '🌯',
    menu_category_id: 'pitas-durums',
    menu_item_name: 'Pita Hawaï',
    visible: true
  },
  {
    title: 'Couscous Maison',
    description: 'Le plat signature de la maison',
    icon: '🍽️',
    menu_category_id: 'plats-assiettes',
    menu_item_name: 'Couscous Maison',
    visible: true
  }
];

// Main function
function addMenuFooterItems() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Fetching menu data...');
    const menuData = getMenuData();
    
    console.log('\nAvailable categories and items:');
    for (const [catId, data] of Object.entries(menuData)) {
      console.log(`  ${catId}: ${data.label}`);
      if (data.items.length > 0) {
        console.log(`    Items: ${data.items.slice(0, 3).join(', ')}${data.items.length > 3 ? '...' : ''}`);
      }
    }
    
    console.log('\nAdding/updating footer items with menu links...');
    
    // Get max order
    const maxOrderStmt = db.prepare("SELECT MAX(\"order\") as max_order FROM footer_items");
    const maxOrderResult = maxOrderStmt.get();
    let nextOrder;
    if (maxOrderResult?.max_order != null) {
      nextOrder = maxOrderResult.max_order + 1;
    } else {
      nextOrder = 0;
    }
    
    // Check if items already exist
    const checkStmt = db.prepare("SELECT id, title FROM footer_items WHERE title = ?");
    const insertStmt = db.prepare(`
      INSERT INTO footer_items (title, description, icon, menu_category_id, menu_item_name, "order", visible)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const updateStmt = db.prepare(`
      UPDATE footer_items 
      SET description = ?, icon = ?, menu_category_id = ?, menu_item_name = ?, visible = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    for (const item of footerItems) {
      const existing = checkStmt.get(item.title);
      
      // Validate menu link
      if (item.menu_category_id && item.menu_item_name) {
        const categoryData = menuData[item.menu_category_id];
        if (!categoryData) {
          console.log(`  ⚠ Category "${item.menu_category_id}" not found, skipping "${item.title}"`);
          continue;
        }
        if (!categoryData.items.includes(item.menu_item_name)) {
          console.log(`  ⚠ Item "${item.menu_item_name}" not found in category "${item.menu_category_id}", skipping "${item.title}"`);
          // Try to find a similar item
          const similarItem = categoryData.items.find(i => 
            i.toLowerCase().includes(item.menu_item_name.toLowerCase()) ||
            item.menu_item_name.toLowerCase().includes(i.toLowerCase())
          );
          if (similarItem) {
            console.log(`  → Using similar item: "${similarItem}"`);
            item.menu_item_name = similarItem;
          } else {
            console.log(`  → Available items: ${categoryData.items.slice(0, 3).join(', ')}`);
            continue;
          }
        }
      }
      
      if (existing) {
        // Update existing item
        updateStmt.run(
          item.description || null,
          item.icon || null,
          item.menu_category_id || null,
          item.menu_item_name || null,
          item.visible ? 1 : 0,
          existing.id
        );
        console.log(`  ✓ Updated: ${item.title} ${item.icon || ''} → /menu/${item.menu_category_id}/${item.menu_item_name}`);
      } else {
        // Insert new item
        insertStmt.run(
          item.title,
          item.description || null,
          item.icon || null,
          item.menu_category_id || null,
          item.menu_item_name || null,
          nextOrder++,
          item.visible ? 1 : 0
        );
        console.log(`  ✓ Added: ${item.title} ${item.icon || ''} → /menu/${item.menu_category_id}/${item.menu_item_name}`);
      }
    }
    
    console.log('\n✓ Footer items with menu links added/updated successfully!');
    
  } catch (error) {
    console.error('Error adding footer items:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
addMenuFooterItems();

