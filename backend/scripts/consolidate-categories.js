/**
 * Consolidate Duplicate Categories
 * Merges similar/duplicate categories into official ones
 * Example: "Graphics Card" → "Graphics Cards", "GPU" → "Graphics Cards"
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');

// Category consolidation mapping
const CONSOLIDATION_MAP = {
  // Graphics Cards consolidation
  'Graphics Card': 'Graphics Cards',
  'GPU': 'Graphics Cards',
  'Video Card': 'Graphics Cards',
  'Graphics': 'Graphics Cards',
  
  // Mice consolidation
  'Mouse': 'Mice',
  
  // Headphones consolidation
  'Headset': 'Headphones',
  'Headsets': 'Headphones',
  'Audio': 'Headphones',
  
  // Cooling consolidation
  'Cooling': 'CPU Coolers',
  'CPU Cooling': 'CPU Coolers',
  'Coolers': 'CPU Coolers',
  
  // Cases consolidation
  'Cases': 'PC Cases',
  'Cabinet': 'PC Cases',
  'Tower': 'PC Cases',
  
  // Storage consolidation
  'SSD': 'Storage',
  'HDD': 'Storage',
  'Hard Drive': 'Storage',
  
  // Power Supply consolidation
  'PSU': 'Power Supplies',
  'Power Supply': 'Power Supplies',
  
  // Prebuilds consolidation
  'Prebuilds': 'Prebuilt PCs',
  'Prebuild': 'Prebuilt PCs',
  'Desktop': 'Prebuilt PCs',
  'PC': 'Prebuilt PCs',
  
  // Networking consolidation
  'Network': 'Networking',
  'Router': 'Networking',
  'WiFi': 'Networking',
  
  // Gaming Chairs consolidation
  'Chair': 'Gaming Chairs',
  'Gaming Chair': 'Gaming Chairs',
  
  // Controllers consolidation
  'Controller': 'Controllers',
  'Gamepad': 'Controllers',
  'Game Controller': 'Controllers',
  
  // Deals consolidation
  'Deal': 'Deals',
  'Offer': 'Deals',
  'Discount': 'Deals',
  
  // Remove empty/invalid
  'empty': null,
  '': null,
  'Other': null,
  'Uncategorized': null,
  'Misc': null
};

async function consolidateCategories() {
  try {
    console.log('🔄 Starting category consolidation...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get Product model
    const Product = require('../models/Product');
    
    // Get all unique categories
    const allCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`📊 Found ${allCategories.length} unique categories:\n`);
    allCategories.forEach(cat => {
      console.log(`  • "${cat._id}": ${cat.count} products`);
    });
    console.log('\n');
    
    // Process consolidation
    let totalUpdated = 0;
    const consolidationLog = [];
    
    for (const [oldCategory, newCategory] of Object.entries(CONSOLIDATION_MAP)) {
      const count = await Product.countDocuments({ category: oldCategory });
      
      if (count === 0) continue;
      
      if (newCategory === null) {
        // Delete products with invalid categories
        console.log(`🗑️  Removing ${count} products with category "${oldCategory}"`);
        await Product.deleteMany({ category: oldCategory });
        consolidationLog.push({
          action: 'DELETE',
          from: oldCategory,
          to: null,
          count
        });
      } else {
        // Consolidate to new category
        console.log(`🔀 Consolidating ${count} products: "${oldCategory}" → "${newCategory}"`);
        await Product.updateMany(
          { category: oldCategory },
          { $set: { category: newCategory } }
        );
        consolidationLog.push({
          action: 'CONSOLIDATE',
          from: oldCategory,
          to: newCategory,
          count
        });
      }
      
      totalUpdated += count;
    }
    
    console.log(`\n✅ Consolidation complete! Updated ${totalUpdated} products\n`);
    
    // Show final categories
    const finalCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`📊 Final categories (${finalCategories.length} total):\n`);
    finalCategories.forEach(cat => {
      console.log(`  • "${cat._id}": ${cat.count} products`);
    });
    
    console.log('\n📋 Consolidation Log:');
    console.log(JSON.stringify(consolidationLog, null, 2));
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

consolidateCategories();
