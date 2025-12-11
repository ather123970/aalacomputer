/**
 * Fix Product Images & Categories
 * Detects wrong image URLs and corrects product categories
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Image URL patterns to detect product types
const IMAGE_PATTERNS = {
  'Processors': {
    patterns: ['cpu', 'processor', 'intel', 'amd', 'ryzen', 'core i', 'xeon'],
    exclude: ['laptop', 'notebook', 'mobile', 'phone']
  },
  'Graphics Cards': {
    patterns: ['gpu', 'graphics', 'rtx', 'gtx', 'radeon', 'geforce', 'video card', 'graphics card'],
    exclude: ['laptop', 'notebook']
  },
  'Monitors': {
    patterns: ['monitor', 'display', 'screen', 'lcd', 'led', 'oled', 'curved', 'ultrawide', 'inch', 'hz', 'resolution'],
    exclude: ['laptop', 'notebook']
  },
  'RAM': {
    patterns: ['ram', 'memory', 'ddr4', 'ddr5', 'ddr3', 'sodimm', 'udimm', 'corsair', 'kingston', 'gskill'],
    exclude: []
  },
  'Laptops': {
    patterns: ['laptop', 'notebook', 'ultrabook', 'macbook', 'chromebook', 'elitebook', 'probook'],
    exclude: []
  },
  'Keyboards': {
    patterns: ['keyboard', 'mechanical', 'membrane', 'wireless', 'rgb', 'gaming keyboard'],
    exclude: ['laptop', 'notebook']
  },
  'Mouse': {
    patterns: ['mouse', 'mice', 'gaming mouse', 'wireless mouse', 'trackball'],
    exclude: ['laptop', 'notebook']
  },
  'Headsets': {
    patterns: ['headset', 'headphone', 'earphone', 'earbuds', 'wireless headset', 'gaming headset'],
    exclude: []
  },
  'PC Cases': {
    patterns: ['case', 'cabinet', 'pc case', 'chassis', 'tower', 'atx', 'micro-atx', 'mini-itx'],
    exclude: ['laptop', 'notebook']
  },
  'Power Supplies': {
    patterns: ['psu', 'power supply', 'power supply unit', 'watts', 'watt', 'modular'],
    exclude: ['laptop', 'notebook']
  },
  'CPU Coolers': {
    patterns: ['cpu cooler', 'cooler', 'cooling', 'tower cooler', 'liquid cooler', 'aio', 'all-in-one'],
    exclude: ['laptop', 'notebook', 'case fan']
  },
  'Motherboards': {
    patterns: ['motherboard', 'mobo', 'mainboard', 'b450', 'b550', 'z690', 'x670', 'lga', 'socket', 'asus', 'msi', 'gigabyte'],
    exclude: ['laptop', 'notebook']
  },
  'Storage': {
    patterns: ['ssd', 'hdd', 'nvme', 'storage', 'hard drive', 'solid state', 'disk', 'm.2', 'sata'],
    exclude: []
  }
};

// Detect category from image URL and product name
function detectCategoryFromImage(imageUrl, productName) {
  if (!imageUrl && !productName) return 'empty';
  
  const combined = `${imageUrl} ${productName}`.toLowerCase();
  
  // Check each category's patterns
  for (const [category, rules] of Object.entries(IMAGE_PATTERNS)) {
    // Check if any pattern matches
    const patternMatch = rules.patterns.some(pattern => combined.includes(pattern));
    
    if (patternMatch) {
      // Check if any exclude pattern matches
      const excludeMatch = rules.exclude.some(exclude => combined.includes(exclude));
      
      if (!excludeMatch) {
        return category;
      }
    }
  }
  
  return 'empty';
}

// Main function
async function fixProductImages() {
  try {
    console.log('🔧 Product Image & Category Fixer');
    console.log('='.repeat(70));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Fetch all products
    console.log('🔄 Fetching all products...');
    const products = await productsCollection.find({}).toArray();
    console.log(`✅ Fetched ${products.length} products\n`);
    
    // Analyze and find mismatches
    let mismatches = 0;
    const categoryStats = {};
    const fixes = [];
    
    console.log('📊 Analyzing product images and categories...\n');
    
    for (const product of products) {
      const productId = product._id;
      const productName = product.name || product.title || product.Name || '';
      const imageUrl = product.img || product.imageUrl || '';
      const currentCategory = product.category || 'empty';
      
      // Detect category from image and name
      const detectedCategory = detectCategoryFromImage(imageUrl, productName);
      
      // Track stats
      if (!categoryStats[detectedCategory]) {
        categoryStats[detectedCategory] = 0;
      }
      categoryStats[detectedCategory]++;
      
      // Check if category needs fixing
      if (currentCategory !== detectedCategory && detectedCategory !== 'empty') {
        mismatches++;
        fixes.push({
          id: productId,
          name: productName,
          imageUrl: imageUrl ? imageUrl.substring(0, 60) + '...' : 'No image',
          oldCategory: currentCategory,
          newCategory: detectedCategory
        });
      }
    }
    
    console.log('📊 Category Analysis:');
    console.log('='.repeat(70));
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`${cat.padEnd(25)} : ${count.toString().padStart(4)} products`);
      });
    
    console.log('\n📝 Image-Based Category Mismatches:');
    console.log('='.repeat(70));
    console.log(`Total Products: ${products.length}`);
    console.log(`Mismatches Found: ${mismatches}`);
    console.log(`Correct: ${products.length - mismatches}`);
    
    if (mismatches === 0) {
      console.log('\n✅ All products have correct categories!');
      await mongoose.connection.close();
      return;
    }
    
    // Show sample mismatches
    console.log('\n📋 Sample Mismatches (first 30):');
    console.log('='.repeat(70));
    fixes.slice(0, 30).forEach(fix => {
      console.log(`\n${fix.name.substring(0, 50)}`);
      console.log(`  Image: ${fix.imageUrl}`);
      console.log(`  ${fix.oldCategory.padEnd(20)} → ${fix.newCategory}`);
    });
    
    if (fixes.length > 30) {
      console.log(`\n... and ${fixes.length - 30} more mismatches`);
    }
    
    // Update products in database
    console.log('\n\n🚀 Updating database...');
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < fixes.length; i++) {
      const fix = fixes[i];
      
      try {
        const result = await productsCollection.updateOne(
          { _id: fix.id },
          { $set: { category: fix.newCategory } }
        );
        
        if (result.modifiedCount > 0) {
          updated++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        console.error(`❌ Error updating ${fix.id}:`, err.message);
      }
      
      // Progress indicator
      if ((i + 1) % 100 === 0) {
        console.log(`⏳ Updated ${i + 1}/${fixes.length} products...`);
      }
    }
    
    console.log('\n✅ Update Complete!');
    console.log('='.repeat(70));
    console.log(`Successfully Updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Fixed: ${updated + failed}`);
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    const verifyProducts = await productsCollection.find({}).toArray();
    const verifyStats = {};
    
    for (const product of verifyProducts) {
      const category = product.category || 'empty';
      if (!verifyStats[category]) {
        verifyStats[category] = 0;
      }
      verifyStats[category]++;
    }
    
    console.log('\n📊 Final Category Distribution:');
    console.log('='.repeat(70));
    Object.entries(verifyStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`${cat.padEnd(25)} : ${count.toString().padStart(4)} products`);
      });
    
    console.log('\n✅ All done! Product categories have been corrected based on images.');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixProductImages();
