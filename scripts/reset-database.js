const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items');
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items', 'thumbnails');

// Main function to reset database
function resetDatabase() {
  const db = new Database(DB_PATH);
  
  try {
    console.log('Resetting database...');
    
    // Clear all data
    console.log('  - Clearing menu items...');
    db.prepare('DELETE FROM menu_items').run();
    
    console.log('  - Clearing categories...');
    db.prepare('DELETE FROM categories').run();
    
    console.log('  - Clearing image references...');
    db.prepare('DELETE FROM images').run();
    
    // Reset auto-increment counters
    console.log('  - Resetting auto-increment counters...');
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('menu_items', 'images')").run();
    
    // Vacuum database to reclaim space
    console.log('  - Vacuuming database...');
    db.prepare('VACUUM').run();
    
    console.log('\n✓ Database reset successfully!');
    console.log('  - All categories cleared');
    console.log('  - All menu items cleared');
    console.log('  - All image references cleared');
    
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Function to delete uploaded images
function deleteUploadedImages() {
  try {
    console.log('\nDeleting uploaded images...');
    
    // Delete thumbnails
    if (fs.existsSync(THUMBNAILS_DIR)) {
      const thumbnailFiles = fs.readdirSync(THUMBNAILS_DIR);
      let deletedCount = 0;
      thumbnailFiles.forEach(file => {
        if (file !== '.gitkeep') {
          try {
            fs.unlinkSync(path.join(THUMBNAILS_DIR, file));
            deletedCount++;
          } catch (err) {
            console.warn(`  Warning: Could not delete ${file}:`, err.message);
          }
        }
      });
      console.log(`  - Deleted ${deletedCount} thumbnail(s)`);
    }
    
    // Delete main images
    if (fs.existsSync(IMAGES_DIR)) {
      const imageFiles = fs.readdirSync(IMAGES_DIR);
      let deletedCount = 0;
      imageFiles.forEach(file => {
        if (file !== '.gitkeep' && file !== 'thumbnails') {
          try {
            fs.unlinkSync(path.join(IMAGES_DIR, file));
            deletedCount++;
          } catch (err) {
            console.warn(`  Warning: Could not delete ${file}:`, err.message);
          }
        }
      });
      console.log(`  - Deleted ${deletedCount} image(s)`);
    }
    
    console.log('✓ Image cleanup completed!');
    
  } catch (error) {
    console.error('Error deleting images:', error);
    process.exit(1);
  }
}

// Run the reset
console.log('=== Database and Image Reset ===\n');
resetDatabase();
deleteUploadedImages();
console.log('\n=== Reset Complete ===');

