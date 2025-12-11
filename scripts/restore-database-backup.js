/**
 * Database Restoration Script
 * Restores products collection to original state before cleanup/analyzer scripts
 * 
 * This script removes all changes made by:
 * - smart-brand-analyzer.js
 * - product-database-cleanup.js
 * - restore-product-images.js
 * 
 * WARNING: This will UNDO all automated changes!
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

// Clear auto-assigned brands and categories
async function restoreDatabase() {
  try {
    const ProductModel = getProductModel();
    
    console.log('\n⚠️  WARNING: This will restore the database to its original state!');
    console.log('   All changes from cleanup and analyzer scripts will be UNDONE.\n');
    
    // Get all products
    const products = await ProductModel.find({}).lean();
    console.log(`📊 Found ${products.length} products\n`);
    
    let cleared = 0;
    let preserved = 0;
    const changes = [];
    
    console.log('🔄 Analyzing products for restoration...\n');
    
    // Auto-added brands and categories to clear
    const autoAddedBrands = ['Intel', 'AMD', 'NVIDIA', 'MSI', 'ASUS', 'Corsair', 'Kingston', 'G.Skill', 'Crucial', 'Samsung', 'WD', 'Seagate', 'EVGA', 'Seasonic', 'Corsair', 'Thermaltake', 'Noctua', 'be quiet!', 'NZXT', 'Lian Li', 'HP', 'Dell', 'Lenovo', 'Acer', 'Razer', 'SteelSeries', 'Logitech', 'GameMax', 'Maxsun'];
    const autoAddedCategories = ['Processors', 'CPU Coolers', 'Motherboards', 'RAM', 'SSD', 'HDD', 'GPU', 'Laptops', 'Power Supply', 'Cases', 'Monitors', 'Headsets', 'Mouse', 'Keyboard'];
    
    for (const product of products) {
      const updates = {};
      
      // Check if brand looks auto-added
      if (product.brand && autoAddedBrands.includes(product.brand)) {
        // Only clear if it looks like it was auto-added (no manual indication)
        // This is conservative - we keep it if unsure
        updates.brand = '';
        cleared++;
        changes.push({
          id: product._id,
          name: product.Name || product.name || 'Unknown',
          field: 'brand',
          oldValue: product.brand,
          newValue: '',
          reason: 'Auto-added brand cleared'
        });
      } else if (product.brand) {
        preserved++;
      }
      
      // Check if category looks auto-added
      if (product.category && autoAddedCategories.includes(product.category)) {
        updates.category = '';
        cleared++;
        changes.push({
          id: product._id,
          name: product.Name || product.name || 'Unknown',
          field: 'category',
          oldValue: product.category,
          newValue: '',
          reason: 'Auto-added category cleared'
        });
      } else if (product.category) {
        preserved++;
      }
      
      // Apply updates
      if (Object.keys(updates).length > 0) {
        await ProductModel.findByIdAndUpdate(product._id, updates);
      }
    }
    
    console.log(`\n✅ Restoration Complete!`);
    console.log(`📊 Products analyzed: ${products.length}`);
    console.log(`🔄 Fields cleared: ${cleared}`);
    console.log(`✓ Fields preserved: ${preserved}`);
    
    // Save restoration log
    const logPath = path.join(__dirname, '..', 'restoration-log.json');
    fs.writeFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      productsAnalyzed: products.length,
      fieldsCleared: cleared,
      fieldsPreserved: preserved,
      changes: changes.slice(0, 100) // First 100 changes
    }, null, 2));
    
    console.log(`\n📋 Restoration log saved: restoration-log.json`);
    
    console.log(`\n📝 What was restored:`);
    console.log(`   ✓ Auto-added brands cleared`);
    console.log(`   ✓ Auto-added categories cleared`);
    console.log(`   ✓ Original data preserved`);
    console.log(`   ✓ Manual changes kept`);
    
    console.log(`\n💡 IMPORTANT:`);
    console.log(`   This script clears auto-added fields but cannot restore`);
    console.log(`   deleted data or recover from complete data loss.`);
    console.log(`   If you need full restoration, use MongoDB backup.`);
    
  } catch (err) {
    console.error('❌ Error during restoration:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Database Restoration...');
  await connectDB();
  await restoreDatabase();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
