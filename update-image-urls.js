const fs = require('fs');
const path = require('path');

/**
 * Script to update JSON image URLs
 * 
 * Usage:
 * node update-image-urls.js <mode> [baseUrl]
 * 
 * Modes:
 * - local: Convert to local paths (./zah_images/...)
 * - server: Convert to server URLs (http://localhost:5000/images/...)
 * - remote: Keep or convert to remote URLs (https://zahcomputers.pk/...)
 * 
 * Examples:
 * node update-image-urls.js local
 * node update-image-urls.js server http://localhost:5000
 * node update-image-urls.js server https://yourdomain.com
 */

const INPUT_FILE = 'aalacomputer.productsd.json';
const OUTPUT_FILE = 'aalacomputer.final.json';

// Parse command line arguments
const mode = process.argv[2] || 'server';
const baseUrl = process.argv[3] || 'http://localhost:5000';

console.log(`🔄 Starting image URL update...`);
console.log(`📝 Mode: ${mode}`);
console.log(`📂 Input: ${INPUT_FILE}`);
console.log(`💾 Output: ${OUTPUT_FILE}`);

// Read the JSON file
let products;
try {
  const jsonData = fs.readFileSync(INPUT_FILE, 'utf8');
  products = JSON.parse(jsonData);
  console.log(`✅ Loaded ${products.length} products`);
} catch (error) {
  console.error(`❌ Error reading JSON file:`, error.message);
  process.exit(1);
}

// Function to extract image filename from URL or path
function extractImageFilename(urlOrPath) {
  if (!urlOrPath) return null;
  
  // Extract filename from URL or path
  const parts = urlOrPath.split('/');
  const filename = parts[parts.length - 1];
  
  // Decode URL encoding if present
  return decodeURIComponent(filename);
}

// Function to generate new URL based on mode
function generateImageUrl(filename, mode, baseUrl) {
  if (!filename) return '';
  
  const encodedFilename = encodeURIComponent(filename);
  
  switch (mode) {
    case 'local':
      return `./zah_images/${filename}`;
    
    case 'server':
      return `${baseUrl}/images/${encodedFilename}`;
    
    case 'remote':
      // Keep existing remote URL or generate a placeholder
      return `https://zahcomputers.pk/wp-content/uploads/2025/11/${encodedFilename}`;
    
    default:
      return `${baseUrl}/images/${encodedFilename}`;
  }
}

// Update products
let updatedCount = 0;
const updatedProducts = products.map(product => {
  const updated = { ...product };
  
  // Update img field
  if (product.img) {
    const filename = extractImageFilename(product.img);
    if (filename) {
      updated.img = generateImageUrl(filename, mode, baseUrl);
      updatedCount++;
    }
  }
  
  // Update imageUrl field
  if (product.imageUrl) {
    const filename = extractImageFilename(product.imageUrl);
    if (filename) {
      updated.imageUrl = generateImageUrl(filename, mode, baseUrl);
    }
  }
  
  return updated;
});

// Write updated JSON
try {
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(updatedProducts, null, 2),
    'utf8'
  );
  console.log(`✅ Updated ${updatedCount} product image URLs`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total products: ${updatedProducts.length}`);
  console.log(`   Updated images: ${updatedCount}`);
  console.log(`   Mode: ${mode}`);
  if (mode === 'server') {
    console.log(`   Base URL: ${baseUrl}`);
  }
} catch (error) {
  console.error(`❌ Error writing JSON file:`, error.message);
  process.exit(1);
}

console.log(`\n✨ Done!`);
