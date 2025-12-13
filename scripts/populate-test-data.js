const Database = require('better-sqlite3');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items');

// Ensure directories exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Test data with image URLs (using Unsplash free images)
const testData = {
  categories: [
    {
      id: 'sandwiches-classique',
      label: 'Sandwiches Classique',
      items: [
        {
          name: 'Jambon-Fromage',
          description: 'Jambon de qualité supérieure avec fromage emmental',
          price: '4,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80'
        },
        {
          name: 'Poulet-Crudités',
          description: 'Filet de poulet grillé avec crudités fraîches',
          price: '5,00 €',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
        },
        {
          name: 'Thon-Mayonnaise',
          description: 'Thon à l\'huile avec mayonnaise maison',
          price: '4,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
        }
      ]
    },
    {
      id: 'sandwiches-speciaux',
      label: 'Sandwiches Spéciaux',
      items: [
        {
          name: 'Roi Dagobert',
          description: 'Jambon, fromage, œuf, crudités',
          price: '6,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&q=80'
        },
        {
          name: 'Américain',
          description: 'Steak haché, frites, sauce américaine',
          price: '7,00 €',
          imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'
        },
        {
          name: 'Kebab',
          description: 'Viande de kebab, légumes, sauce blanche',
          price: '6,00 €',
          imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80'
        }
      ]
    },
    {
      id: 'frites-snacks',
      label: 'Frites & Snacks',
      items: [
        {
          name: 'Frites',
          description: 'Frites maison croustillantes',
          price: '3,00 €',
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
        },
        {
          name: 'Fricadelle',
          description: 'Fricadelle belge traditionnelle',
          price: '3,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80'
        },
        {
          name: 'Boulette',
          description: 'Boulette de viande épicée',
          price: '3,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80'
        }
      ]
    },
    {
      id: 'pitas',
      label: 'Pitas',
      items: [
        {
          name: 'Pita Kebab',
          description: 'Kebab dans une pita fraîche',
          price: '6,50 €',
          imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80'
        },
        {
          name: 'Pita Poulet',
          description: 'Poulet grillé dans une pita',
          price: '6,00 €',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
        }
      ]
    }
  ]
};

// Download image function
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(IMAGES_DIR, filename));
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

// Main function
async function populateDatabase() {
  const db = new Database(DB_PATH);
  
  try {
    // Clear existing data
    console.log('Suppression des données existantes...');
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM categories').run();
    
    // Insert categories and items
    for (let i = 0; i < testData.categories.length; i++) {
      const category = testData.categories[i];
      
      console.log(`Création de la catégorie : ${category.label}`);
      
      // Insert category
      const categoryStmt = db.prepare(`
        INSERT INTO categories (id, label, "order")
        VALUES (?, ?, ?)
      `);
      categoryStmt.run(category.id, category.label, i);
      
      // Insert items for this category
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        
        console.log(`  - Ajout de l'article : ${item.name}`);
        
        // Download image
        let imagePath = null;
        if (item.imageUrl) {
          try {
            const ext = item.imageUrl.includes('.jpg') || item.imageUrl.includes('jpeg') ? 'jpg' : 'png';
            const filename = `${category.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`;
            await downloadImage(item.imageUrl, filename);
            imagePath = `/images/menu-items/${filename}`;
            console.log(`    ✓ Image téléchargée : ${filename}`);
          } catch (error) {
            console.log(`    ✗ Échec du téléchargement de l'image : ${error.message}`);
          }
        }
        
        // Insert item
        const itemStmt = db.prepare(`
          INSERT INTO menu_items (category_id, name, description, price, image, highlight, "order")
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        itemStmt.run(
          category.id,
          item.name,
          item.description,
          item.price,
          imagePath,
          0,
          j
        );
      }
    }
    
    console.log('\n✓ Base de données remplie avec succès !');
    console.log(`✓ ${testData.categories.length} catégories créées`);
    console.log(`✓ ${testData.categories.reduce((sum, cat) => sum + cat.items.length, 0)} articles créés`);
    
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
populateDatabase().catch(console.error);







