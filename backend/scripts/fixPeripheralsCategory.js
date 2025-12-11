/**
 * Fix Peripherals Category Script
 * 
 * This script:
 * 1. Finds all products in "Peripherals" category (and variations like "perohperhals")
 * 2. Analyzes product names to detect correct categories
 * 3. Moves products to their correct categories (Keyboards, Mouse, Headsets, Audio Devices, etc.)
 * 4. Provides detailed statistics
 * 
 * Usage: node backend/scripts/fixPeripheralsCategory.js
 * Usage (dry run): node backend/scripts/fixPeripheralsCategory.js --dry-run
 */

const mongoose = require('mongoose');
const { detectCategory } = require('../utils/categoryDetector');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  id: String,
  category_id: Number,
  category: String,
  categorySlug: String,
  brand: String,
  Name: String,
  name: String,
  title: String,
  price: Number,
  is_active: Boolean,
  img: String,
  imageUrl: String
}, { strict: false });

let Product;

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    
    Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Category mapping for peripherals
 */
const PERIPHERAL_CATEGORIES = {
  'Keyboards': {
    keywords: ['keyboard', 'mechanical keyboard', 'rgb keyboard', 'gaming keyboard', 'wireless keyboard'],
    priority: 100
  },
  'Mouse': {
    keywords: ['mouse', 'gaming mouse', 'wireless mouse', 'rgb mouse'],
    priority: 99
  },
  'Headsets': {
    keywords: ['headset', 'gaming headset', 'wireless headset', 'usb headset'],
    priority: 98
  },
  'Audio Devices': {
    keywords: ['speaker', 'speakers', 'audio', 'sound', 'microphone', 'mic', 'headphone'],
    priority: 97
  },
  'Laptops': {
    keywords: ['laptop', 'notebook', 'ultrabook'],
    priority: 96
  },
  'Graphics Cards': {
    keywords: ['gpu', 'graphics card', 'rtx', 'gtx', 'radeon'],
    priority: 95
  },
  'Monitors': {
    keywords: ['monitor', 'display', 'lcd'],
    priority: 94
  }
};

/**
 * Detect correct category for a peripheral product
 */
function detectPeripheralCategory(product) {
  const name = (product.name || product.Name || product.title || '').toLowerCase();
  
  // Try to detect using the category detector first
  const detected = detectCategory(product);
  if (detected && detected !== 'Peripherals' && detected !== 'perohperhals') {
    return detected;
  }
  
  // If not detected, try peripheral-specific detection
  let bestMatch = null;
  let bestPriority = -1;
  
  for (const [category, config] of Object.entries(PERIPHERAL_CATEGORIES)) {
    for (const keyword of config.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        if (config.priority > bestPriority) {
          bestMatch = category;
          bestPriority = config.priority;
        }
        break;
      }
    }
  }
  
  return bestMatch;
}

/**
 * Main fix function
 */
async function fixPeripheralsCategory(options = {}) {
  const {
    dryRun = false,
    verbose = true
  } = options;
  
  console.log('\n🔍 Starting Peripherals Category Fix...\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE UPDATE'}\n`);
  
  try {
    // Find all products with "Peripherals" or similar misspellings
    const peripheralProducts = await Product.find({
      $or: [
        { category: 'Peripherals' },
        { category: 'perohperhals' },
        { category: 'Peripheral' },
        { category: 'peripherals' },
        { category: /[Pp]eriph/ } // Regex to catch misspellings
      ]
    }).lean();
    
    console.log(`📊 Found ${peripheralProducts.length} products in Peripherals category\n`);
    
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;
    
    const categoryStats = {};
    const updates = [];
    const unchanged = [];
    
    // Process each product
    for (const product of peripheralProducts) {
      processedCount++;
      
      const productName = product.name || product.Name || product.title || 'Unknown';
      const currentCategory = product.category || 'Unknown';
      
      // Detect correct category
      const detectedCategory = detectPeripheralCategory(product);
      
      if (detectedCategory && detectedCategory !== currentCategory) {
        // Category needs to be changed
        if (verbose) {
          console.log(`✅ [${processedCount}] "${productName}"`);
          console.log(`   Current: "${currentCategory}" → Detected: "${detectedCategory}"`);
        }
        
        updates.push({
          productId: product._id,
          productName,
          oldCategory: currentCategory,
          newCategory: detectedCategory,
          price: product.price || 0
        });
        
        // Track stats
        if (!categoryStats[detectedCategory]) {
          categoryStats[detectedCategory] = { count: 0, from: {} };
        }
        categoryStats[detectedCategory].count++;
        
        if (!categoryStats[detectedCategory].from[currentCategory]) {
          categoryStats[detectedCategory].from[currentCategory] = 0;
        }
        categoryStats[detectedCategory].from[currentCategory]++;
        
        // Update product if not dry run
        if (!dryRun) {
          try {
            await Product.updateOne(
              { _id: product._id },
              {
                $set: {
                  category: detectedCategory
                }
              }
            );
            updatedCount++;
          } catch (updateError) {
            console.error(`    ❌ Error updating product ${product._id}:`, updateError.message);
            errorCount++;
          }
        }
      } else {
        // Category could not be detected or is already correct
        unchanged.push({
          productId: product._id,
          productName,
          category: currentCategory
        });
        unchangedCount++;
        
        if (verbose && detectedCategory === null) {
          console.log(`⚠️  [${processedCount}] "${productName}"`);
          console.log(`   Category: "${currentCategory}" (could not auto-detect)`);
        }
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(80) + '\n');
    console.log(`Total Products Processed: ${processedCount}`);
    console.log(`Products to Update: ${updates.length}`);
    console.log(`Products Unchanged: ${unchangedCount}`);
    
    if (!dryRun) {
      console.log(`Successfully Updated: ${updatedCount}`);
      console.log(`Errors: ${errorCount}`);
    } else {
      console.log(`\n⚠️  DRY RUN MODE - No changes were made to the database`);
    }
    
    // Category breakdown
    if (Object.keys(categoryStats).length > 0) {
      console.log('\n' + '-'.repeat(80));
      console.log('CATEGORY BREAKDOWN');
      console.log('-'.repeat(80) + '\n');
      
      for (const [category, stats] of Object.entries(categoryStats)) {
        console.log(`📂 ${category}: ${stats.count} products`);
        for (const [oldCat, count] of Object.entries(stats.from)) {
          console.log(`    ← from "${oldCat}": ${count}`);
        }
        console.log('');
      }
    }
    
    // Show sample updates
    if (updates.length > 0 && verbose) {
      console.log('-'.repeat(80));
      console.log(`SAMPLE UPDATES (first ${Math.min(10, updates.length)})`);
      console.log('-'.repeat(80) + '\n');
      
      updates.slice(0, 10).forEach((update, idx) => {
        console.log(`${idx + 1}. "${update.productName}"`);
        console.log(`   ${update.oldCategory} → ${update.newCategory}`);
        console.log(`   Price: PKR ${(update.price || 0).toLocaleString()}`);
        console.log('');
      });
      
      if (updates.length > 10) {
        console.log(`   ... and ${updates.length - 10} more\n`);
      }
    }
    
    // Show unchanged products
    if (unchanged.length > 0 && unchanged.length <= 20) {
      console.log('-'.repeat(80));
      console.log('PRODUCTS THAT COULD NOT BE AUTO-CATEGORIZED');
      console.log('-'.repeat(80) + '\n');
      
      unchanged.forEach((item, idx) => {
        console.log(`${idx + 1}. "${item.productName}"`);
        console.log(`   Current Category: "${item.category}"`);
        console.log('');
      });
    }
    
    console.log('='.repeat(80) + '\n');
    
    if (dryRun && updates.length > 0) {
      console.log('💡 To apply these changes, run: node backend/scripts/fixPeripheralsCategory.js\n');
    }
    
    return {
      processedCount,
      updatedCount,
      unchangedCount,
      errorCount,
      updates,
      categoryStats
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const isVerbose = !args.includes('--quiet') && !args.includes('-q');
  
  await connectDB();
  
  try {
    const result = await fixPeripheralsCategory({
      dryRun: isDryRun,
      verbose: isVerbose
    });
    
    console.log('✅ Operation completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fixPeripheralsCategory };
