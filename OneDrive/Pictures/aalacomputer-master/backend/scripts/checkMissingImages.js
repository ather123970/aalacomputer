// Check which laptop products are missing images
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';

// Product schema (simplified)
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function checkMissingImages() {
  try {
    console.log('Connecting to MongoDB...\n');
    await mongoose.connect(MONGO_URI);
    
    // Find laptop category products
    const laptops = await Product.find({
      $or: [
        { category: /laptop/i },
        { name: /laptop/i },
        { Name: /laptop/i }
      ]
    })
    .select('id name Name title img imageUrl category')
    .lean();

    console.log(`Found ${laptops.length} laptop products\n`);
    console.log('='.repeat(80));
    
    const zahImagesPath = path.join(__dirname, '..', '..', 'zah_images');
    const missingImages = [];
    const hasImages = [];
    
    for (const laptop of laptops) {
      const productName = laptop.Name || laptop.name || laptop.title;
      const imageUrl = laptop.img || laptop.imageUrl;
      
      let hasImage = false;
      let imageType = 'NONE';
      
      // Check if it's an external URL
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        hasImage = true;
        imageType = 'EXTERNAL';
      }
      // Check if it's a local path
      else if (imageUrl) {
        const fileName = imageUrl.startsWith('/images/') 
          ? imageUrl.replace('/images/', '') 
          : imageUrl.replace(/^\//, '');
        
        const localPath = path.join(zahImagesPath, fileName);
        if (fs.existsSync(localPath)) {
          hasImage = true;
          imageType = 'LOCAL';
        } else {
          imageType = 'LOCAL_MISSING';
        }
      }
      
      if (!hasImage) {
        missingImages.push({
          name: productName,
          id: laptop.id || laptop._id,
          imageUrl: imageUrl || 'NONE',
          type: imageType
        });
      } else {
        hasImages.push({
          name: productName,
          type: imageType
        });
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total Laptops: ${laptops.length}`);
    console.log(`✅ With Images: ${hasImages.length}`);
    console.log(`❌ Missing Images: ${missingImages.length}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ PRODUCTS WITH IMAGES:');
    console.log('='.repeat(80));
    
    const imagesByType = {};
    hasImages.forEach(p => {
      if (!imagesByType[p.type]) imagesByType[p.type] = [];
      imagesByType[p.type].push(p.name);
    });
    
    Object.entries(imagesByType).forEach(([type, products]) => {
      console.log(`\n${type}: ${products.length} products`);
      products.slice(0, 5).forEach(name => console.log(`  - ${name}`));
      if (products.length > 5) console.log(`  ... and ${products.length - 5} more`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('❌ PRODUCTS MISSING IMAGES:');
    console.log('='.repeat(80));
    
    if (missingImages.length === 0) {
      console.log('\n🎉 All laptop products have images!');
    } else {
      console.log(`\n${missingImages.length} products need images:\n`);
      
      missingImages.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Image URL: ${p.imageUrl}`);
        console.log(`   Type: ${p.type}`);
        console.log('');
      });
      
      if (missingImages.length > 20) {
        console.log(`... and ${missingImages.length - 20} more`);
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('💡 SOLUTIONS:');
      console.log('='.repeat(80));
      console.log('\n1. **Add External URLs**: Update these products in admin with external image URLs');
      console.log('2. **Add Local Images**: Place images in zah_images/ folder');
      console.log('3. **Use Generic Placeholder**: They\'ll use category-specific fallback');
      console.log('4. **Fuzzy Matching**: Enable name-based matching to existing images');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

checkMissingImages();
