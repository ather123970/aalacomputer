const fs = require('fs');
const path = require('path');

/**
 * Prepare JSON for database with relative image paths
 * Images will use /images/filename.jpg format
 * Your backend will serve these from the zah_images folder
 */

const INPUT_FILE = 'aalacomputer.productsd.json';
const OUTPUT_FILE = 'aalacomputer.final.json';

console.log(`🔄 Preparing JSON for database...`);
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

// Update products with /images/ prefix
let updatedCount = 0;
const updatedProducts = products.map(product => {
  const updated = { ...product };
  
  // Update img field
  if (product.img) {
    const filename = extractImageFilename(product.img);
    if (filename) {
      updated.img = `/images/${filename}`;
      updatedCount++;
    }
  }
  
  // Update imageUrl field
  if (product.imageUrl) {
    const filename = extractImageFilename(product.imageUrl);
    if (filename) {
      updated.imageUrl = `/images/${filename}`;
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
  console.log(`   Image format: /images/filename.jpg`);
  console.log(`\n✨ Example:`);
  console.log(`   Before: https://zahcomputers.pk/wp-content/uploads/.../product.jpg`);
  console.log(`   After:  /images/product.jpg`);
  console.log(`\n📝 Your backend should serve /images/* from the zah_images/ folder`);
} catch (error) {
  console.error(`❌ Error writing JSON file:`, error.message);
  process.exit(1);
}

console.log(`\n🚀 Ready to import to MongoDB!`);
console.log(`   mongoimport --db yourdb --collection products --file ${OUTPUT_FILE} --jsonArray`);
