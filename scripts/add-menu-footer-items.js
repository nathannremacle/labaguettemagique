const Database = require('better-sqlite3');
const path = require('path');
const { getMenuData } = require('./utils/dbUtils');
const { validateMenuLink } = require('./utils/menuValidation');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');

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

/**
 * Get the next order value for footer items
 */
function getNextOrder(db, maxOrderStmt) {
  const maxOrderResult = maxOrderStmt.get();
  if (maxOrderResult?.max_order != null) {
    return maxOrderResult.max_order + 1;
  }
  return 0;
}

/**
 * Validate and correct menu item link if needed
 */
function validateAndCorrectMenuItem(menuData, item) {
  if (item.menu_category_id && item.menu_item_name) {
    const validation = validateMenuLink(menuData, item.menu_category_id, item.menu_item_name);
    
    if (!validation.valid) {
      return { valid: false, error: validation.error };
    }
    
    if (validation.correctedItem) {
      return { valid: true, correctedItem: validation.correctedItem };
    }
  }
  return { valid: true };
}

/**
 * Insert or update a footer item
 */
function insertOrUpdateFooterItem(db, item, existing, insertStmt, updateStmt, nextOrder) {
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
    console.log(`  ✓ Mis à jour : ${item.title} ${item.icon || ''} → /menu/${item.menu_category_id}/${item.menu_item_name}`);
  } else {
    // Insert new item
    insertStmt.run(
      item.title,
      item.description || null,
      item.icon || null,
      item.menu_category_id || null,
      item.menu_item_name || null,
      nextOrder,
      item.visible ? 1 : 0
    );
    console.log(`  ✓ Ajouté : ${item.title} ${item.icon || ''} → /menu/${item.menu_category_id}/${item.menu_item_name}`);
  }
}

// Main function
function addMenuFooterItems() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Récupération des données du menu...');
    const menuData = getMenuData();
    
    console.log('\nCatégories et articles disponibles :');
    for (const [catId, data] of Object.entries(menuData)) {
      console.log(`  ${catId} : ${data.label}`);
      if (data.items.length > 0) {
        console.log(`    Articles : ${data.items.slice(0, 3).join(', ')}${data.items.length > 3 ? '...' : ''}`);
      }
    }
    
    console.log('\nAjout/mise à jour des éléments du footer avec liens vers le menu...');
    
    // Get max order
    const maxOrderStmt = db.prepare("SELECT MAX(\"order\") as max_order FROM footer_items");
    let nextOrder = getNextOrder(db, maxOrderStmt);
    
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
      
      // Validate menu link using utility function
      const validation = validateAndCorrectMenuItem(menuData, item);
      
      if (!validation.valid) {
        console.log(`  ⚠ ${validation.error}, ignoré "${item.title}"`);
        if (validation.error.includes('not found in category')) {
          console.log(`  → Articles disponibles : ${menuData[item.menu_category_id]?.items.slice(0, 3).join(', ') || 'aucun'}`);
        }
        continue;
      }
      
      if (validation.correctedItem) {
        console.log(`  → Utilisation d'un article similaire : "${validation.correctedItem}"`);
        item.menu_item_name = validation.correctedItem;
      }
      
      insertOrUpdateFooterItem(db, item, existing, insertStmt, updateStmt, nextOrder);
      if (!existing) {
        nextOrder++;
      }
    }
    
    console.log('\n✓ Éléments du footer avec liens vers le menu ajoutés/mis à jour avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout des éléments du footer :', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
addMenuFooterItems();
