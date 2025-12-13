const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { access } = require('fs/promises');
const Database = require('better-sqlite3');

// Configuration
const DB_PATH = path.join(__dirname, '..', 'data', 'menu.db');
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items');
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'images', 'menu-items', 'thumbnails');
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
  try {
    await fs.access(THUMBNAILS_DIR);
  } catch {
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
  }
}

// Helper function to extract and validate image URLs
function extractAndValidateUrl(match) {
  const url = match.replace(/^["']|["']$/g, '').trim();
  if (!url) return null;
  
  // Early return for invalid URLs
  if (url.includes('google.com')) return null;
  if (url.includes('gstatic.com')) return null;
  if (url.includes('googleusercontent.com')) return null;
  if (url.includes('data:image')) return null;
  
  return url;
}

// Search for images using Google Images
async function searchGoogleImages(query) {
  try {
    // Google Images search URL with French language
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=fr&safe=active`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const imageUrls = new Set(); // Use Set to avoid duplicates

    // Method 1: Try to extract from script tags with embedded JSON
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const content = $(script).html();
      if (content) {
        // Look for image URLs in various formats
        // Google Images embeds data in different ways
        const urlPatterns = [
          /"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi,
          /'(https?:\/\/[^']+\.(jpg|jpeg|png|webp)[^']*)'/gi,
          /(https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp))/gi
        ];

        for (const pattern of urlPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const url = extractAndValidateUrl(match);
              if (url) {
                imageUrls.add(url);
              }
            });
          }
        }

        // Also try to find AF_initDataCallback which contains image data
        if (content.includes('AF_initDataCallback')) {
          // Extract URLs from the callback data
          const dataMatches = content.match(/\["https?:\/\/[^"]+"/g);
          if (dataMatches) {
            dataMatches.forEach(match => {
              const url = match.replace(/^\["/, '').replace(/"$/, '');
              if (url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))) {
                if (!url.includes('google.com') && !url.includes('gstatic.com')) {
                  imageUrls.add(url);
                }
              }
            });
          }
        }
      }
    }

    // Method 2: Try to extract from img tags
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      const dataSrc = $(elem).attr('data-src');
      const dataOriginal = $(elem).attr('data-original');
      const url = src || dataSrc || dataOriginal;
      
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        // Filter out Google's own images and icons
        if (!url.includes('google.com') && !url.includes('gstatic.com') && 
            !url.includes('googleusercontent.com') && !url.includes('data:image') &&
            (url.match(/\.(jpg|jpeg|png|webp)/i) || url.includes('image'))) {
          imageUrls.add(url);
        }
      }
    });

    // Convert Set to Array and filter/validate URLs
    const validUrls = Array.from(imageUrls)
      .filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      })
      .slice(0, 10); // Limit to first 10

    return validUrls;
  } catch (error) {
    console.error(`Error searching for images: ${error.message}`);
    return [];
  }
}

// Download image from URL
async function downloadImage(url) {
  try {
    // Clean up URL - remove query parameters that might cause issues
    let cleanUrl = url;
    try {
      const urlObj = new URL(url);
      // Keep only essential query params, remove tracking params
      const essentialParams = ['width', 'height'];
      const newParams = new URLSearchParams();
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (essentialParams.includes(key)) {
          newParams.set(key, value);
        }
      }
      urlObj.search = newParams.toString();
      cleanUrl = urlObj.toString();
    } catch {
      // If URL parsing fails, use original URL
    }

    const response = await axios.get(cleanUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
      maxContentLength: MAX_IMAGE_SIZE,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/avif,image/jpeg,image/png,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/'
      }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Empty response');
    }

    if (response.data.length > MAX_IMAGE_SIZE) {
      throw new Error(`Image too large: ${(response.data.length / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validate it's actually an image by checking the buffer
    const buffer = Buffer.from(response.data);
    const isValidImage = await sharp(buffer).metadata().then(() => true).catch(() => false);
    
    if (!isValidImage) {
      throw new Error('Downloaded file is not a valid image');
    }

    return buffer;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.message}`);
    }
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Process and save image (same logic as upload API)
async function processAndSaveImage(buffer, originalName) {
  try {
    // Validate it's actually an image
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image format');
    }

    // Sanitize original filename
    const sanitizedOriginalName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const baseFilename = `${timestamp}-${randomString}`;

    // Optimized image (max 1200px width, WebP format)
    const optimizedFilename = `${baseFilename}.webp`;
    const optimizedPath = path.join(UPLOAD_DIR, optimizedFilename);

    const optimizedBuffer = await image
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 85 })
      .toBuffer();

    await fs.writeFile(optimizedPath, optimizedBuffer);

    // Thumbnail (400px width, WebP format)
    const thumbnailFilename = `${baseFilename}-thumb.webp`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);

    const thumbnailBuffer = await image
      .resize(400, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toBuffer();

    await fs.writeFile(thumbnailPath, thumbnailBuffer);

    // Get optimized image dimensions
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    // Save image metadata to database
    const db = new Database(DB_PATH);
    const stmt = db.prepare(`
      INSERT INTO images (filename, original_filename, path, width, height, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      optimizedFilename,
      sanitizedOriginalName,
      `/images/menu-items/${optimizedFilename}`,
      optimizedMetadata.width || metadata.width || 0,
      optimizedMetadata.height || metadata.height || 0,
      optimizedBuffer.length
    );
    db.close();

    return `/images/menu-items/${optimizedFilename}`;
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

// Update menu item with image URL
function updateMenuItemImage(itemId, imageUrl) {
  const db = new Database(DB_PATH);
  const stmt = db.prepare(`
    UPDATE menu_items
    SET image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(imageUrl, itemId);
  db.close();
}

// Get all menu items
function getAllMenuItems() {
  const db = new Database(DB_PATH);
  const stmt = db.prepare('SELECT id, name, category_id, image FROM menu_items ORDER BY id');
  const items = stmt.all();
  db.close();
  return items;
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process a single item
async function processMenuItem(item) {
  console.log(`\nTraitement : ${item.name} (ID : ${item.id})`);
  
  // Skip if already has an image (unless we want to replace)
  // For now, we'll replace existing images as per user preference
  // if (item.image) {
  //   console.log(`  ⏭️  Skipping - already has image`);
  //   return { success: true, skipped: true };
  // }

  try {
    // Search for images
    console.log(`  🔍 Recherche d'images...`);
    const imageUrls = await searchGoogleImages(item.name);
    
    if (imageUrls.length === 0) {
      console.log(`  ❌ Aucune image trouvée`);
      return { success: false, error: 'No images found' };
    }

    console.log(`  📥 ${imageUrls.length} image(s) trouvée(s), tentative de téléchargement...`);

    // Try each image URL until one works
    let success = false;
    let lastError = null;

    for (const imageUrl of imageUrls) {
      try {
        console.log(`  📥 Téléchargement : ${imageUrl.substring(0, 60)}...`);
        const buffer = await downloadImage(imageUrl);
        
        console.log(`  🖼️  Traitement de l'image...`);
        const imagePath = await processAndSaveImage(buffer, `${item.name}.jpg`);
        
        console.log(`  💾 Mise à jour de la base de données...`);
        updateMenuItemImage(item.id, imagePath);
        
        console.log(`  ✅ Succès ! Image enregistrée : ${imagePath}`);
        success = true;
        break;
      } catch (error) {
        console.log(`  ⚠️  Échec : ${error.message}`);
        lastError = error;
        continue;
      }
    }

    if (!success) {
      console.log(`  ❌ Toutes les tentatives de téléchargement ont échoué`);
      return { success: false, error: lastError?.message || 'All downloads failed' };
    }

    return { success: true };
  } catch (error) {
    console.error(`  ❌ Erreur lors du traitement de l'article : ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🚀 Démarrage du script de téléchargement d\'images...\n');
  
  // Check for test mode (limit number of items)
  const testMode = process.argv.includes('--test');
  const testLimit = testMode ? 3 : null; // Process only 3 items in test mode
  
  if (testMode) {
    console.log('🧪 MODE TEST : Traitement des 3 premiers articles uniquement\n');
  }
  
  // Ensure directories exist
  await ensureDirectories();
  
  // Get all menu items
  let items = getAllMenuItems();
  
  // Limit items in test mode
  if (testLimit) {
    items = items.slice(0, testLimit);
  }
  
  console.log(`📋 ${items.length} articles du menu à traiter\n`);

  const results = {
    total: items.length,
    success: 0,
    failed: 0,
    skipped: 0
  };

  // Process each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i + 1}/${items.length}]`);
    
    const result = await processMenuItem(item);
    
    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else {
        results.success++;
      }
    } else {
      results.failed++;
    }

    // Rate limiting - wait between requests (except for last item)
    if (i < items.length - 1) {
      console.log(`  ⏳ Attente de ${DELAY_BETWEEN_REQUESTS / 1000}s avant le prochain article...`);
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(50));
  console.log(`Articles totaux : ${results.total}`);
  console.log(`✅ Réussis : ${results.success}`);
  console.log(`⏭️  Ignorés : ${results.skipped}`);
  console.log(`❌ Échoués : ${results.failed}`);
  console.log('='.repeat(50));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

