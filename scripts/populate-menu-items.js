const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');

// Menu data structure
const menuData = {
  categories: [
    {
      id: 'plats-assiettes',
      label: 'Plats & Assiettes',
      items: [
        {
          name: 'Couscous Maison',
          description: 'Couscous maison préparé sur commande',
          price: '16,00 €',
        },
        {
          name: 'Lasagne Maison',
          description: 'Lasagne maison. Petite: 6,00€ / Grande: 9,00€',
          price: '6,00 € - 9,00 €',
        },
        {
          name: 'Supplément Aubergine',
          description: 'Supplément aubergine. Petite: 6,00€ / Grande: 10,00€',
          price: '6,00 € - 10,00 €',
        },
        {
          name: 'Assiette Mixte',
          description: 'Assiette mixte avec frites et salade',
          price: '14,00 €',
        },
        {
          name: 'Assiette Boulets Lapin',
          description: 'Boulets lapin avec frites et salade',
          price: '12,00 €',
        },
        {
          name: 'Assiette Brochettes',
          description: 'Brochettes avec frites et salade',
          price: '12,00 €',
        },
        {
          name: 'Assiette Américain',
          description: 'Américain avec frites et salade',
          price: '12,00 €',
        },
        {
          name: 'Assiette Merguez',
          description: 'Merguez avec frites et salade',
          price: '12,00 €',
        },
        {
          name: 'Assiette Gyros',
          description: 'Gyros avec frites et salade',
          price: '12,00 €',
        },
        {
          name: 'Assiette Falafel',
          description: 'Falafel avec frites et salade',
          price: '12,00 €',
        },
      ],
    },
    {
      id: 'pitas-durums',
      label: 'Pitas & Durüms',
      items: [
        {
          name: 'Pita Normale',
          description: 'Pita classique. Petite: 6,50€ / Grande: 9,00€',
          price: '6,50 € - 9,00 €',
        },
        {
          name: 'Pita Fromage',
          description: 'Pita avec fromage. Petite: 7,00€ / Grande: 9,50€',
          price: '7,00 € - 9,50 €',
        },
        {
          name: 'Pita Hawaï',
          description: 'Pita avec ananas et jambon. Petite: 7,00€ / Grande: 9,50€',
          price: '7,00 € - 9,50 €',
        },
        {
          name: 'Pita Feta',
          description: 'Pita avec feta grecque. Petite: 7,00€ / Grande: 9,50€',
          price: '7,00 € - 9,50 €',
        },
        {
          name: 'Pita Falafel',
          description: 'Pita avec falafel. Petite: 7,00€ / Grande: 9,50€',
          price: '7,00 € - 9,50 €',
        },
        {
          name: 'Pita Toute Viande',
          description: 'Pita avec toutes les viandes. Petite: 7,00€ / Grande: 9,50€',
          price: '7,00 € - 9,50 €',
        },
        {
          name: 'Durüm Classique',
          description: 'Durüm classique',
          price: '9,00 €',
        },
        {
          name: 'Durüm Falafel',
          description: 'Durüm avec falafel',
          price: '9,00 €',
        },
        {
          name: 'Supplément Fromage',
          description: 'Ajout de fromage supplémentaire',
          price: '0,50 €',
        },
      ],
    },
    {
      id: 'sandwiches-chauds',
      label: 'Sandwiches Chauds',
      items: [
        {
          name: 'Fricadelle',
          description: 'Fricadelle. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Viandelle',
          description: 'Viandelle. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Hamburger',
          description: 'Hamburger classique. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Pouly Croc',
          description: 'Pouly croc croustillant. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Cervelas',
          description: 'Cervelas belge. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Mexicanos',
          description: 'Mexicanos épicés. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Brochette',
          description: 'Brochette de viande. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Crocky',
          description: 'Crocky croustillant. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Falafel',
          description: 'Falafel maison. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Merguez',
          description: 'Merguez épicée. Petite: 7,00€ / Grande: 8,00€',
          price: '7,00 € - 8,00 €',
        },
        {
          name: 'Double Fricadelle',
          description: 'Double fricadelle. +2,00€',
          price: '8,00 € - 9,00 €',
        },
        {
          name: 'Double Hamburger',
          description: 'Double hamburger. +2,00€',
          price: '8,00 € - 9,00 €',
        },
        {
          name: 'Double Pouly Croc',
          description: 'Double pouly croc. +2,00€',
          price: '8,00 € - 9,00 €',
        },
        {
          name: 'Double Merguez',
          description: 'Double merguez. +2,00€',
          price: '9,00 € - 10,00 €',
        },
        {
          name: 'Bicky Burger',
          description: 'Bicky burger belge',
          price: '6,00 €',
        },
        {
          name: 'Pita',
          description: 'Pita classique',
          price: '8,00 €',
        },
        {
          name: 'Magic Burger',
          description: 'Burger spécial de la maison',
          price: '9,00 €',
          highlight: true,
        },
        {
          name: 'Option Routier',
          description: 'Option routier supplémentaire',
          price: '+1,50 €',
        },
      ],
    },
    {
      id: 'sandwiches-froids',
      label: 'Sandwiches Froids',
      items: [
        {
          name: 'Fromage',
          description: 'Pain baguette, fromage belge, beurre, salade. Petite: 4,00€ / Grande: 5,00€',
          price: '4,00 € - 5,00 €',
        },
        {
          name: 'Jambon',
          description: 'Pain baguette, jambon artisanal, salade. Petite: 4,00€ / Grande: 5,00€',
          price: '4,00 € - 5,00 €',
        },
        {
          name: 'Américain',
          description: 'Steak haché maison, frites, sauce au choix. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Dagobert',
          description: 'Classique belge. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Thon',
          description: 'Thon avec mayonnaise, cocktail ou piquant. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Poulet Curry',
          description: 'Poulet au curry, salade, tomate. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Boulet',
          description: 'Boulet maison, compotée d\'oignons. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Roi Dagobert',
          description: 'Dagobert avec œufs mimosa. Petite: 5,50€ / Grande: 6,50€',
          price: '5,50 € - 6,50 €',
        },
        {
          name: 'Thon Pêches',
          description: 'Thon avec pêches. Petite: 5,50€ / Grande: 6,50€',
          price: '5,50 € - 6,50 €',
        },
        {
          name: 'Sandwich du Chef',
          description: 'Spécialité du chef. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Salade Oeufs Mimosa Maison',
          description: 'Oeufs mimosa maison. Petite: 4,50€ / Grande: 5,00€',
          price: '4,50 € - 5,00 €',
        },
        {
          name: 'Le Végétarien',
          description: 'Feta, concombre, chou, olives, tomates fraîches et sauce Magique. Petite: 4,50€ / Grande: 5,00€',
          price: '4,50 € - 5,00 €',
        },
        {
          name: 'Italien',
          description: 'Jambon de Parme, tomates séchées, parmesan, crème balsamique. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Le Brie',
          description: 'Brie, sirop de Liège et noix. Petite: 5,00€ / Grande: 6,00€',
          price: '5,00 € - 6,00 €',
        },
        {
          name: 'Méditerranéo',
          description: 'Italien avec pesto maison. Petite: 5,50€ / Grande: 6,50€',
          price: '5,50 € - 6,50 €',
        },
        {
          name: 'Le Norvégien',
          description: 'Saumon fumé, crudités, sauce Magique. Petite: 5,50€ / Grande: 6,50€',
          price: '5,50 € - 6,50 €',
        },
        {
          name: 'Poulet Grillé Maison',
          description: 'Poulet aux herbes de Provence, sauce Magique. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Spécial Norvégien',
          description: 'Norvégien avec fromages fines herbes. Petite: 6,00€ / Grande: 7,00€',
          price: '6,00 € - 7,00 €',
        },
        {
          name: 'Le Danois',
          description: 'Escalope de poulet, pesto maison, mozzarella, roquette et tomate fraîche. Petite: 6,50€ / Grande: 7,50€',
          price: '6,50 € - 7,50 €',
        },
      ],
    },
    {
      id: 'salades',
      label: 'Salades',
      items: [
        {
          name: 'Salade Nature',
          description: 'Salade verte fraîche',
          price: '7,00 €',
        },
        {
          name: 'Salade Oeuf Russe',
          description: 'Salade avec œufs russes',
          price: '7,50 €',
        },
        {
          name: 'Salade Feta Grecque',
          description: 'Feta grecque, olives, tomates fraîches',
          price: '8,00 €',
        },
        {
          name: 'Salade Thon',
          description: 'Thon, salade verte, tomates, maïs',
          price: '9,50 €',
        },
        {
          name: 'Salade Américaine',
          description: 'Steak haché, salade, tomates, sauce américaine',
          price: '9,50 €',
        },
        {
          name: 'Salade Poulet Grillé',
          description: 'Poulet grillé, salade, tomates, sauce au choix',
          price: '9,50 €',
        },
        {
          name: 'Salade Falafel',
          description: 'Falafel, salade, tomates, sauce tahini',
          price: '9,50 €',
        },
        {
          name: 'Salade Crousti',
          description: 'Salade avec croûtons et fromage',
          price: '9,50 €',
        },
        {
          name: 'Salade Pita',
          description: 'Salade avec pita et sauce au choix',
          price: '9,50 €',
        },
        {
          name: 'Salade Pêche',
          description: 'Salade avec pêches et thon',
          price: '9,50 €',
        },
      ],
    },
    {
      id: 'frites-snacks',
      label: 'Frites & Snacks',
      items: [
        {
          name: 'Frites',
          description: 'Frites dorées maison. Petite: 3,00€ / Grande: 3,50€',
          price: '3,00 € - 3,50 €',
        },
        {
          name: 'Sauces',
          description: 'Mayonnaise, Tartare, Andalouse, Cocktail, Samouraï, Américain, Ketchup, Curry, Aioli, Aigre douce, Bicky, Hawaï, Sauce Lapin, Béarnaise, USA Forte',
          price: '0,80 €',
        },
        {
          name: 'Fricadelle',
          description: 'Fricadelle belge traditionnelle',
          price: '3,00 €',
        },
        {
          name: 'Viandelle',
          description: 'Viandelle belge',
          price: '3,00 €',
        },
        {
          name: 'Boulet Froid',
          description: 'Boulet froid',
          price: '3,00 €',
        },
        {
          name: 'Cervelas',
          description: 'Cervelas belge',
          price: '3,00 €',
        },
        {
          name: 'Pouly Croc',
          description: 'Pouly croc croustillant',
          price: '3,00 €',
        },
        {
          name: 'Mexicanos',
          description: 'Mexicanos épicés',
          price: '3,00 €',
        },
        {
          name: 'Croquette de Volaille',
          description: 'Croquette de volaille croustillante',
          price: '3,00 €',
        },
        {
          name: 'Cheese Crack',
          description: 'Cheese crack croustillant',
          price: '3,00 €',
        },
        {
          name: 'Boulet Lapin',
          description: 'Boulet au lapin',
          price: '3,50 €',
        },
        {
          name: 'Mini Loempia',
          description: '6 pièces de mini loempia',
          price: '3,50 €',
        },
        {
          name: 'Chix Fingers',
          description: '6 pièces de chix fingers',
          price: '3,50 €',
        },
      ],
    },
  ],
};

// Main function to populate database
function populateDatabase() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Populating menu database...\n');
    
    // Insert categories and items
    for (let i = 0; i < menuData.categories.length; i++) {
      const category = menuData.categories[i];
      
      console.log(`Creating category: ${category.label}`);
      
      // Check if category already exists
      const existingCategory = db.prepare('SELECT id FROM categories WHERE id = ?').get(category.id);
      
      if (existingCategory) {
        console.log(`  Category "${category.label}" already exists, skipping...`);
        continue;
      }
      
      // Insert category
      const categoryStmt = db.prepare(`
        INSERT INTO categories (id, label, "order")
        VALUES (?, ?, ?)
      `);
      categoryStmt.run(category.id, category.label, i);
      
      // Insert items for this category
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        
        console.log(`  - Adding item: ${item.name}`);
        
        // Insert item
        const itemStmt = db.prepare(`
          INSERT INTO menu_items (category_id, name, description, price, image, highlight, "order")
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        itemStmt.run(
          category.id,
          item.name,
          item.description || '',
          item.price,
          null, // No images yet
          item.highlight ? 1 : 0,
          j
        );
      }
    }
    
    console.log('\n✓ Database populated successfully!');
    console.log(`✓ Created ${menuData.categories.length} categories`);
    const totalItems = menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    console.log(`✓ Created ${totalItems} items`);
    
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
populateDatabase();


