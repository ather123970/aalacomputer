/**
 * Fix Product Categories - Direct MongoDB Access
 * Fetches all products, analyzes their names, and corrects categories
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Category detection rules based on product names
const CATEGORY_RULES = {
  'Processors': {
    keywords: ['cpu', 'processor', 'intel', 'amd', 'core i', 'ryzen', 'xeon', 'pentium', 'celeron'],
    exclude: ['laptop', 'notebook', 'mobile', 'phone', 'cooler', 'cooling', 'fan']
  },
  'Graphics Cards': {
    keywords: ['gpu', 'graphics', 'rtx', 'gtx', 'radeon', 'geforce', 'arc', 'video card', 'graphics card'],
    exclude: ['laptop', 'notebook', 'mobile']
  },
  'Motherboards': {
    keywords: ['motherboard', 'mobo', 'mainboard', 'b450', 'b550', 'z690', 'x670', 'lga', 'socket'],
    exclude: ['laptop', 'notebook']
  },
  'RAM': {
    keywords: ['ram', 'memory', 'ddr4', 'ddr5', 'ddr3', 'ddr2', 'sodimm', 'udimm'],
    exclude: ['laptop', 'notebook', 'mobile']
  },
  'Storage': {
    keywords: ['ssd', 'hdd', 'nvme', 'storage', 'hard drive', 'solid state', 'disk', 'm.2', 'sata'],
    exclude: []
  },
  'Power Supplies': {
    keywords: ['psu', 'power supply', 'power supply unit', 'watts', 'watt', 'modular', 'semi-modular'],
    exclude: ['laptop', 'notebook']
  },
  'CPU Coolers': {
    keywords: ['cpu cooler', 'cooler', 'cooling', 'tower cooler', 'liquid cooler', 'aio', 'all-in-one'],
    exclude: ['laptop', 'notebook', 'case fan', 'case cooling']
  },
  'PC Cases': {
    keywords: ['case', 'cabinet', 'pc case', 'chassis', 'tower', 'atx', 'micro-atx', 'mini-itx'],
    exclude: ['laptop', 'notebook', 'mobile']
  },
  'Monitors': {
    keywords: ['monitor', 'display', 'screen', 'lcd', 'led', 'oled', 'curved', 'ultrawide', 'inch'],
    exclude: ['laptop', 'notebook', 'mobile', 'phone']
  },
  'Keyboards': {
    keywords: ['keyboard', 'mechanical', 'membrane', 'wireless', 'rgb', 'gaming keyboard'],
    exclude: ['laptop', 'notebook']
  },
  'Mouse': {
    keywords: ['mouse', 'mice', 'gaming mouse', 'wireless mouse', 'trackball'],
    exclude: ['laptop', 'notebook']
  },
  'Headsets': {
    keywords: ['headset', 'headphone', 'earphone', 'earbuds', 'wireless headset', 'gaming headset', 'microphone'],
    exclude: []
  },
  'Laptops': {
    keywords: ['laptop', 'notebook', 'ultrabook', 'macbook', 'chromebook'],
    exclude: []
  },
  'Prebuilds': {
    keywords: ['prebuilt', 'pre-built', 'gaming pc', 'desktop pc', 'system', 'complete system'],
    exclude: []
  },
  'Cables & Accessories': {
    keywords: ['cable', 'adapter', 'connector', 'usb', 'hdmi', 'displayport', 'vga', 'dvi', 'rj45', 'ethernet'],
    exclude: []
  },
  'Networking': {
    keywords: ['router', 'modem', 'wifi', 'wireless', 'network', 'ethernet', 'switch', 'hub'],
    exclude: []
  },
  'Audio Devices': {
    keywords: ['speaker', 'audio', 'sound', 'amplifier', 'subwoofer'],
    exclude: ['headset', 'headphone', 'earphone']
  },
  'Gaming Chairs': {
    keywords: ['chair', 'gaming chair', 'desk chair', 'office chair'],
    exclude: []
  }
};

// Detect category from product name
function detectCategory(productName) {
  if (!productName) return 'empty';
  
  const nameLower = productName.toLowerCase();
  
  // Check each category's rules
  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    // Check if any keyword matches
    const keywordMatch = rules.keywords.some(keyword => nameLower.includes(keyword));
    
    if (keywordMatch) {
      // Check if any exclude keyword matches
      const excludeMatch = rules.exclude.some(exclude => nameLower.includes(exclude));
      
      if (!excludeMatch) {
        return category;
      }
    }
  }
  
  return 'empty';
}

// Main function
async function fixProductCategories() {
  try {
    console.log('🔧 Product Category Fixer - Direct MongoDB');
    console.log('='.repeat(60));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Fetch all products
    console.log('\n🔄 Fetching all products...');
    const products = await productsCollection.find({}).toArray();
    console.log(`✅ Fetched ${products.length} products`);
    
    // Analyze and prepare fixes
    let fixed = 0;
    let unchanged = 0;
    const categoryStats = {};
    const fixes = [];
    
    console.log('\n📊 Analyzing product names...');
    
    for (const product of products) {
      const productName = product.name || product.title || product.Name || '';
      const currentCategory = product.category || 'empty';
      const detectedCategory = detectCategory(productName);
      
      // Track stats
      if (!categoryStats[detectedCategory]) {
        categoryStats[detectedCategory] = 0;
      }
      categoryStats[detectedCategory]++;
      
      // Check if category needs fixing
      if (currentCategory !== detectedCategory) {
        fixes.push({
          id: product._id,
          name: productName,
          oldCategory: currentCategory,
          newCategory: detectedCategory
        });
        fixed++;
      } else {
        unchanged++;
      }
    }
    
    console.log('\n📊 Category Analysis:');
    console.log('='.repeat(60));
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`${cat.padEnd(25)} : ${count.toString().padStart(4)} products`);
      });
    
    console.log('\n📝 Fixes Required:');
    console.log('='.repeat(60));
    console.log(`Total Products: ${products.length}`);
    console.log(`Need Fixing: ${fixed}`);
    console.log(`Already Correct: ${unchanged}`);
    
    if (fixed === 0) {
      console.log('\n✅ All products have correct categories!');
      await mongoose.connection.close();
      return;
    }
    
    // Show sample fixes
    console.log('\n📋 Sample Fixes (first 20):');
    console.log('='.repeat(60));
    fixes.slice(0, 20).forEach(fix => {
      console.log(`${fix.name.substring(0, 40).padEnd(40)} | ${fix.oldCategory.padEnd(20)} → ${fix.newCategory}`);
    });
    
    if (fixes.length > 20) {
      console.log(`... and ${fixes.length - 20} more`);
    }
    
    // Update products in database
    console.log('\n🚀 Updating database...');
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
    console.log('='.repeat(60));
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
    console.log('='.repeat(60));
    Object.entries(verifyStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`${cat.padEnd(25)} : ${count.toString().padStart(4)} products`);
      });
    
    console.log('\n✅ All done! Categories have been fixed.');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixProductCategories();
