const fs = require('fs');
const path = require('path');

/**
 * Generate MongoDB-ready JSON with relative image paths
 * Images will work on ANY domain as long as the image server is accessible
 * 
 * Usage:
 * node generate-db-json.js
 * 
 * This creates a JSON where img/imageUrl only contain the filename.
 * Your backend will prepend the IMAGE_BASE_URL when serving products.
 */

const INPUT_FILE = 'aalacomputer.productsd.json';
const OUTPUT_FILE = 'aalacomputer.mongodb.json';

console.log(`🔄 Generating MongoDB-ready JSON...`);
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

// Update products with just filenames
let updatedCount = 0;
const updatedProducts = products.map(product => {
  const updated = { ...product };
  
  // Update img field - store only filename
  if (product.img) {
    const filename = extractImageFilename(product.img);
    if (filename) {
      updated.img = filename;
      updatedCount++;
    }
  }
  
  // Update imageUrl field - store only filename
  if (product.imageUrl) {
    const filename = extractImageFilename(product.imageUrl);
    if (filename) {
      updated.imageUrl = filename;
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
  console.log(`✅ Updated ${updatedCount} product image paths`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total products: ${updatedProducts.length}`);
  console.log(`   Updated images: ${updatedCount}`);
  console.log(`   Image format: filename only (e.g., "product.jpg")`);
  console.log(`\n📝 Backend Integration:`);
  console.log(`   Set IMAGE_BASE_URL in your .env file`);
  console.log(`   Example: IMAGE_BASE_URL=http://localhost:5000/images`);
  console.log(`   Your backend will prepend this to all image filenames`);
} catch (error) {
  console.error(`❌ Error writing JSON file:`, error.message);
  process.exit(1);
}

// Create example backend code
const exampleCode = `
// Example Backend Integration (backend/routes/products.js)

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:5000/images';

// When fetching products from MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    
    // Add full image URLs
    const productsWithImages = products.map(product => ({
      ...product.toObject(),
      img: product.img ? \`\${IMAGE_BASE_URL}/\${encodeURIComponent(product.img)}\` : null,
      imageUrl: product.imageUrl ? \`\${IMAGE_BASE_URL}/\${encodeURIComponent(product.imageUrl)}\` : null
    }));
    
    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Environment Variables (.env file)
// Development:
IMAGE_BASE_URL=http://localhost:5000/images

// Production:
IMAGE_BASE_URL=https://your-image-server.herokuapp.com/images
// or
IMAGE_BASE_URL=https://cdn.yourdomain.com/images
`;

fs.writeFileSync('BACKEND_INTEGRATION_EXAMPLE.js', exampleCode.trim(), 'utf8');
console.log(`\n📄 Created: BACKEND_INTEGRATION_EXAMPLE.js`);
console.log(`\n✨ Done! Your JSON is ready for MongoDB.`);
console.log(`\n🚀 Next Steps:`);
console.log(`   1. Import to MongoDB: mongoimport --db yourdb --collection products --file ${OUTPUT_FILE} --jsonArray`);
console.log(`   2. Set IMAGE_BASE_URL in your backend .env file`);
console.log(`   3. Update your backend to prepend IMAGE_BASE_URL to image filenames`);
console.log(`   4. Deploy your image server and update IMAGE_BASE_URL for production`);
