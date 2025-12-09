const https = require('https');
const fs = require('fs');
const path = require('path');

// Create placeholders directory
const placeholdersDir = path.join(process.cwd(), 'public', 'images', 'placeholders');
if (!fs.existsSync(placeholdersDir)) {
  fs.mkdirSync(placeholdersDir, { recursive: true });
}

// Category-based image seeds for consistent images per category
const categoryImageSeeds = {
  'sandwiches-classique': ['sandwich', 'baguette', 'ham-sandwich', 'cheese-sandwich'],
  'sandwiches-speciaux': ['gourmet-sandwich', 'italian-sandwich', 'chicken-sandwich', 'salmon-sandwich'],
  'sandwiches-chauds': ['hot-sandwich', 'burger', 'meatball-sandwich'],
  'pitas': ['pita', 'kebab', 'gyros', 'falafel-wrap'],
  'salade': ['salad', 'greek-salad', 'caesar-salad', 'mixed-salad'],
  'assiettes-preparees': ['mixed-plate', 'chicken-plate', 'kebab-plate'],
  'plats-prepares-commande': ['couscous', 'lasagna', 'grilled-meat', 'kebab-platter'],
  'frites-snacks': ['fries', 'snacks', 'burger', 'frikandel']
};

// Menu items count per category (approximate - we'll download a few per category)
const itemsPerCategory = {
  'sandwiches-classique': 10,
  'sandwiches-speciaux': 9,
  'sandwiches-chauds': 3,
  'pitas': 9,
  'salade': 10,
  'assiettes-preparees': 3,
  'plats-prepares-commande': 10,
  'frites-snacks': 24
};

// Using Unsplash Source API (free, no key required)
function downloadImage(categoryId, index, searchTerm) {
  return new Promise((resolve, reject) => {
    // Use Unsplash Source API with different seeds for variety
    const seed = `${categoryId}-${index}-${Date.now()}`;
    const width = 800;
    const height = 600;
    const url = `https://source.unsplash.com/${width}x${height}/?${searchTerm}&sig=${seed}`;
    
    const filename = `${categoryId}-${index}.jpg`;
    const filepath = path.join(placeholdersDir, filename);
    
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve(filepath);
        });
      } else {
        // Fallback to Picsum if Unsplash fails
        const picsumUrl = `https://picsum.photos/seed/${categoryId}-${index}/${width}/${height}`;
        https.get(picsumUrl, (picsumResponse) => {
          const fileStream = fs.createWriteStream(filepath);
          picsumResponse.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`✓ Downloaded ${filename} (fallback)`);
            resolve(filepath);
          });
        }).on('error', reject);
      }
    }).on('error', (err) => {
      // Fallback to Picsum
      const picsumUrl = `https://picsum.photos/seed/${categoryId}-${index}/${width}/${height}`;
      https.get(picsumUrl, (picsumResponse) => {
        const fileStream = fs.createWriteStream(filepath);
        picsumResponse.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${filename} (fallback)`);
          resolve(filepath);
        });
      }).on('error', reject);
    });
  });
}

async function downloadAllPlaceholders() {
  console.log('Starting download of placeholder images...\n');
  
  const allDownloads = [];
  
  for (const [categoryId, count] of Object.entries(itemsPerCategory)) {
    const searchTerms = categoryImageSeeds[categoryId] || ['food'];
    
    for (let i = 0; i < count; i++) {
      const searchTerm = searchTerms[i % searchTerms.length];
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      allDownloads.push(downloadImage(categoryId, i, searchTerm));
    }
  }
  
  try {
    await Promise.all(allDownloads);
    console.log('\n✓ All placeholder images downloaded successfully!');
    console.log(`Location: ${placeholdersDir}`);
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAllPlaceholders();

