/**
 * Restore Product Images Script
 * Recovers product images that may have been affected
 * Checks and restores image fields from backup or alternative sources
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Get Product Model
function getProductModel() {
  const productSchema = new mongoose.Schema({}, { strict: false });
  return mongoose.model('Product', productSchema, 'products');
}

// Restore images from alternative fields
async function restoreProductImages() {
  try {
    const ProductModel = getProductModel();
    
    // Get all products
    const products = await ProductModel.find({}).lean();
    console.log(`\n📊 Found ${products.length} products to check\n`);
    
    let restored = 0;
    let checked = 0;
    let noImageFound = 0;
    const results = [];
    
    for (const product of products) {
      checked++;
      
      // Check if product has any image field
      const hasImageUrl = product.imageUrl && String(product.imageUrl).trim() !== '';
      const hasImg = product.img && String(product.img).trim() !== '';
      const hasImage = product.image && String(product.image).trim() !== '';
      
      // If no primary image, try to restore from alternatives
      if (!hasImageUrl && (hasImg || hasImage)) {
        const imageToUse = hasImg ? product.img : product.image;
        
        // Update product with imageUrl
        await ProductModel.findByIdAndUpdate(
          product._id,
          { imageUrl: imageToUse },
          { new: true }
        );
        
        restored++;
        results.push({
          name: product.Name || product.name || 'Unknown',
          status: '✅ Restored',
          from: hasImg ? 'img' : 'image',
          imageUrl: imageToUse
        });
      } else if (hasImageUrl) {
        // Image exists, just log it
        results.push({
          name: product.Name || product.name || 'Unknown',
          status: '✅ OK',
          imageUrl: product.imageUrl
        });
      } else {
        // No image found
        noImageFound++;
        results.push({
          name: product.Name || product.name || 'Unknown',
          status: '⚠️ No Image',
          imageUrl: 'N/A'
        });
      }
    }
    
    console.log(`\n✅ Restoration Complete!`);
    console.log(`📈 Checked: ${checked} products`);
    console.log(`✨ Restored: ${restored} products`);
    console.log(`⚠️  No image found: ${noImageFound} products`);
    console.log(`\n📋 Sample Results (first 15):\n`);
    
    results.slice(0, 15).forEach(r => {
      console.log(`  ${r.status} ${r.name}`);
      if (r.imageUrl !== 'N/A') {
        console.log(`     Image: ${r.imageUrl.substring(0, 80)}...`);
      }
    });
    
    console.log(`\n✨ Image restoration complete!`);
    
  } catch (err) {
    console.error('❌ Error during restoration:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Product Image Restoration...\n');
  await connectDB();
  await restoreProductImages();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
