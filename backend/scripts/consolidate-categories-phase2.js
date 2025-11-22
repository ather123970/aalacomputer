/**
 * Consolidate Duplicate Categories - Phase 2
 * Consolidates singular/plural and similar variations
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const CONSOLIDATION_MAP = {
  // Singular to Plural
  'Monitor': 'Monitors',
  'CPU Cooler': 'CPU Coolers',
  'PC Case': 'PC Cases',
  'Motherboard': 'Motherboards',
  'Laptop': 'Laptops',
  
  // Variations
  'RAM (System Memory)': 'RAM',
  'Power Supply Unit (PSU)': 'Power Supplies',
  'Peripheral / Gaming Gear': 'Peripherals',
  'Peripheral': 'Peripherals',
  'Case/Component Fan': 'CPU Coolers',
  'Fan/RGB Controller': 'CPU Coolers',
  'Audio Devices': 'Headphones',
  'Accessory/Consumable': 'Cables & Accessories',
  'Cable': 'Cables & Accessories',
  'Network Attached Storage (NAS)': 'Storage',
  'System Unit (Mini PC)': 'Prebuilt PCs',
  'Bag/Case': 'Cables & Accessories',
  'Power Bank': 'Accessories',
  'CPU (Processor)': 'Processors',
  'Card Reader': 'Cables & Accessories'
};

async function consolidatePhase2() {
  try {
    console.log('🔄 Starting Phase 2 category consolidation...\n');
    
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
    
    const Product = require('../models/Product');
    
    let totalUpdated = 0;
    const consolidationLog = [];
    
    for (const [oldCategory, newCategory] of Object.entries(CONSOLIDATION_MAP)) {
      const count = await Product.countDocuments({ category: oldCategory });
      
      if (count === 0) continue;
      
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
      
      totalUpdated += count;
    }
    
    console.log(`\n✅ Phase 2 complete! Updated ${totalUpdated} products\n`);
    
    // Show final categories
    const finalCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`📊 Final categories (${finalCategories.length} total):\n`);
    finalCategories.forEach(cat => {
      console.log(`  • "${cat._id}": ${cat.count} products`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

consolidatePhase2();
