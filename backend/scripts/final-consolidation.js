require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function finalConsolidation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('../models/Product');
    
    // Consolidate Accessories into Cables & Accessories
    const count = await Product.countDocuments({ category: 'Accessories' });
    if (count > 0) {
      await Product.updateMany(
        { category: 'Accessories' },
        { $set: { category: 'Cables & Accessories' } }
      );
      console.log(`✅ Consolidated ${count} products: Accessories → Cables & Accessories`);
    }
    
    // Get final categories
    const finalCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n📊 FINAL CONSOLIDATED CATEGORIES (${finalCategories.length} total):\n`);
    let totalProducts = 0;
    finalCategories.forEach((cat, idx) => {
      console.log(`${idx + 1}. "${cat._id}": ${cat.count} products`);
      totalProducts += cat.count;
    });
    
    console.log(`\n✅ Total Products: ${totalProducts}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

finalConsolidation();
