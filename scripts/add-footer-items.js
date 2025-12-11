const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');

// Footer items to add
const footerItems = [
  {
    title: 'Frites',
    description: 'Découvrez nos frites maison',
    icon: '🍟',
    link: '/menu',
    visible: true
  },
  {
    title: 'Pita',
    description: 'Nos délicieuses pitas',
    icon: '🌯',
    link: '/menu',
    visible: true
  },
  {
    title: 'Dagobert',
    description: 'Le sandwich roi Dagobert',
    icon: '🥪',
    link: '/menu',
    visible: true
  }
];

// Main function
function addFooterItems() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Adding footer items...');
    
    // Get max order
    const maxOrderStmt = db.prepare("SELECT MAX(\"order\") as max_order FROM footer_items");
    const maxOrderResult = maxOrderStmt.get();
    let nextOrder = (maxOrderResult?.max_order ?? -1) + 1;
    
    // Check if items already exist
    const checkStmt = db.prepare("SELECT title FROM footer_items WHERE title = ?");
    const insertStmt = db.prepare(`
      INSERT INTO footer_items (title, description, icon, link, "order", visible)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of footerItems) {
      const existing = checkStmt.get(item.title);
      if (existing) {
        console.log(`  ⚠ Item "${item.title}" already exists, skipping...`);
        continue;
      }
      
      insertStmt.run(
        item.title,
        item.description || null,
        item.icon || null,
        item.link || null,
        nextOrder++,
        item.visible ? 1 : 0
      );
      
      console.log(`  ✓ Added: ${item.title} ${item.icon || ''}`);
    }
    
    console.log('\n✓ Footer items added successfully!');
    
  } catch (error) {
    console.error('Error adding footer items:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
addFooterItems();

