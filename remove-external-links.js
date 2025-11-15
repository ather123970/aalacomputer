const fs = require('fs');

/**
 * Remove external branding links from products
 * Removes the 'link' field that points to zahcomputers.pk
 */

const INPUT_FILE = 'aalacomputer.final.json';
const OUTPUT_FILE = 'aalacomputer.final.json';

console.log(`🔄 Removing external branding links...`);
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

// Remove link field from all products
let removedCount = 0;
const updatedProducts = products.map(product => {
  const updated = { ...product };
  
  // Remove the external link field
  if (updated.link) {
    delete updated.link;
    removedCount++;
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
  console.log(`✅ Removed ${removedCount} external links`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total products: ${updatedProducts.length}`);
  console.log(`   Links removed: ${removedCount}`);
  console.log(`\n✨ Your products are now clean - no external branding!`);
  console.log(`   Users will navigate to your product detail pages instead.`);
} catch (error) {
  console.error(`❌ Error writing JSON file:`, error.message);
  process.exit(1);
}

console.log(`\n🚀 Ready to import to MongoDB!`);
console.log(`   mongoimport --db aalacomputer --collection products --file ${OUTPUT_FILE} --jsonArray`);
