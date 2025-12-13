const Database = require('better-sqlite3');
const fs = require('fs').promises;
const { access } = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items');
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items', 'thumbnails');

// Main function to reset database
async function resetDatabase() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Réinitialisation de la base de données...');
    
    // Clear all data
    console.log('  - Suppression des articles du menu...');
    db.prepare('DELETE FROM menu_items').run();
    
    console.log('  - Suppression des catégories...');
    db.prepare('DELETE FROM categories').run();
    
    console.log('  - Suppression des références d\'images...');
    db.prepare('DELETE FROM images').run();
    
    // Reset auto-increment counters
    console.log('  - Réinitialisation des compteurs auto-incrémentés...');
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('menu_items', 'images')").run();
    
    // Vacuum database to reclaim space
    console.log('  - Nettoyage de la base de données...');
    db.prepare('VACUUM').run();
    
    console.log('\n✓ Base de données réinitialisée avec succès !');
    console.log('  - Toutes les catégories supprimées');
    console.log('  - Tous les articles du menu supprimés');
    console.log('  - Toutes les références d\'images supprimées');
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base de données :', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Function to delete uploaded images
async function deleteUploadedImages() {
  try {
    console.log('\nSuppression des images téléchargées...');
    
    // Delete thumbnails
    try {
      await fs.access(THUMBNAILS_DIR);
      const thumbnailFiles = await fs.readdir(THUMBNAILS_DIR);
      let deletedCount = 0;
      for (const file of thumbnailFiles) {
        if (file !== '.gitkeep') {
          try {
            await fs.unlink(path.join(THUMBNAILS_DIR, file));
            deletedCount++;
          } catch (err) {
            console.warn(`  Avertissement : Impossible de supprimer ${file} :`, err.message);
          }
        }
      }
      console.log(`  - ${deletedCount} miniature(s) supprimée(s)`);
    } catch {
      // Directory doesn't exist, skip
    }
    
    // Delete main images
    try {
      await fs.access(IMAGES_DIR);
      const imageFiles = await fs.readdir(IMAGES_DIR);
      let deletedCount = 0;
      for (const file of imageFiles) {
        if (file !== '.gitkeep' && file !== 'thumbnails') {
          try {
            await fs.unlink(path.join(IMAGES_DIR, file));
            deletedCount++;
          } catch (err) {
            console.warn(`  Avertissement : Impossible de supprimer ${file} :`, err.message);
          }
        }
      }
      console.log(`  - ${deletedCount} image(s) supprimée(s)`);
    } catch {
      // Directory doesn't exist, skip
    }
    
    console.log('✓ Nettoyage des images terminé !');
    
  } catch (error) {
    console.error('Erreur lors de la suppression des images :', error);
    process.exit(1);
  }
}

// Run the reset
console.log('=== Réinitialisation de la Base de Données et des Images ===\n');
(async () => {
  await resetDatabase();
  await deleteUploadedImages();
})();
console.log('\n=== Réinitialisation Terminée ===');

