/**
 * Database Migration Script: Fix Miscategorized Products
 * 
 * This script:
 * 1. Scans all products in the database
 * 2. Detects correct category based on product name using keywords
 * 3. Updates miscategorized products
 * 4. Provides detailed statistics
 * 
 * Usage: node backend/scripts/fixCategories.js
 */

const mongoose = require('mongoose');
const { detectCategory, validateProductCategory, getCategorySlug, batchValidateProducts } = require('../utils/categoryDetector');

// MongoDB connection string - Uses same URI as other scripts
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

// Define Product Schema (lightweight version for migration)
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
  is_active: Boolean
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
    
    // Get or create Product model
    Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Category name to ID mapping
 * You may need to adjust these IDs based on your database
 */
const CATEGORY_ID_MAP = {
  'Laptops': 1,
  'Graphics Cards': 2,
  'Processors': 3,
  'Monitors': 4,
  'Motherboards': 5,
  'RAM': 6,
  'Storage': 7,
  'Power Supply': 8,
  'Cases': 9,
  'Cooling': 10,
  'Keyboards': 11,
  'Mouse': 12,
  'Headsets': 13,
  'Speakers': 14,
  'Webcams': 15,
  'Controllers': 16,
  'Networking': 17,
  'Chairs': 18,
  'Desks': 19
};

/**
 * Main migration function
 */
async function fixCategories(options = {}) {
  const {
    dryRun = false, // If true, only show what would change without updating
    batchSize = 100,
    verbose = true
  } = options;
  
  console.log('\n🔍 Starting Category Fix Migration...\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE UPDATE'}`);
  console.log(`Batch Size: ${batchSize}\n`);
  
  try {
    // Get all active products
    const totalProducts = await Product.countDocuments({ is_active: { $ne: false } });
    console.log(`📊 Total active products: ${totalProducts}\n`);
    
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    const categoryStats = {};
    const updates = [];
    
    // Process in batches
    for (let skip = 0; skip < totalProducts; skip += batchSize) {
      const products = await Product.find({ is_active: { $ne: false } })
        .skip(skip)
        .limit(batchSize)
        .lean();
      
      console.log(`Processing batch ${Math.floor(skip / batchSize) + 1}/${Math.ceil(totalProducts / batchSize)}...`);
      
      for (const product of products) {
        processedCount++;
        
        // Detect correct category
        const detectedCategory = detectCategory(product);
        const currentCategory = product.category || '';
        
        // Check if category needs updating
        const needsUpdate = detectedCategory && 
                           currentCategory.toLowerCase() !== detectedCategory.toLowerCase();
        
        if (needsUpdate) {
          const categorySlug = getCategorySlug(detectedCategory);
          const categoryId = CATEGORY_ID_MAP[detectedCategory] || null;
          
          if (verbose) {
            console.log(`  ⚠️  [${product._id}] "${product.name || product.Name || product.title}"`);
            console.log(`      Current: "${currentCategory}" → Detected: "${detectedCategory}"`);
          }
          
          updates.push({
            productId: product._id,
            productName: product.name || product.Name || product.title,
            oldCategory: currentCategory,
            newCategory: detectedCategory,
            newCategorySlug: categorySlug,
            newCategoryId: categoryId
          });
          
          // Track stats
          if (!categoryStats[detectedCategory]) {
            categoryStats[detectedCategory] = { fixed: 0, from: {} };
          }
          categoryStats[detectedCategory].fixed++;
          
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
                    category: detectedCategory,
                    categorySlug: categorySlug,
                    ...(categoryId && { category_id: categoryId })
                  }
                }
              );
              updatedCount++;
            } catch (updateError) {
              console.error(`    ❌ Error updating product ${product._id}:`, updateError.message);
              errorCount++;
            }
          }
        }
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(80) + '\n');
    console.log(`Total Products Processed: ${processedCount}`);
    console.log(`Products Needing Update: ${updates.length}`);
    
    if (!dryRun) {
      console.log(`Successfully Updated: ${updatedCount}`);
      console.log(`Errors: ${errorCount}`);
    } else {
      console.log(`\n⚠️  DRY RUN MODE - No changes were made to the database`);
    }
    
    console.log('\n' + '-'.repeat(80));
    console.log('CATEGORY BREAKDOWN');
    console.log('-'.repeat(80) + '\n');
    
    for (const [category, stats] of Object.entries(categoryStats)) {
      console.log(`📂 ${category}: ${stats.fixed} products fixed`);
      for (const [oldCat, count] of Object.entries(stats.from)) {
        console.log(`    ← from "${oldCat || '(empty)'}": ${count}`);
      }
      console.log('');
    }
    
    // Show sample updates
    if (updates.length > 0 && verbose) {
      console.log('-'.repeat(80));
      console.log('SAMPLE UPDATES (first 10)');
      console.log('-'.repeat(80) + '\n');
      
      updates.slice(0, 10).forEach((update, idx) => {
        console.log(`${idx + 1}. "${update.productName}"`);
        console.log(`   ${update.oldCategory || '(empty)'} → ${update.newCategory}`);
        console.log('');
      });
      
      if (updates.length > 10) {
        console.log(`   ... and ${updates.length - 10} more\n`);
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
    if (dryRun && updates.length > 0) {
      console.log('💡 To apply these changes, run the script without --dry-run flag\n');
    }
    
    return {
      processedCount,
      updatedCount,
      errorCount,
      updates,
      categoryStats
    };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

/**
 * Generate migration report
 */
async function generateReport() {
  console.log('\n📊 Generating Category Analysis Report...\n');
  
  try {
    const products = await Product.find({ is_active: { $ne: false } }).lean();
    const validation = batchValidateProducts(products);
    
    console.log('='.repeat(80));
    console.log('CATEGORIZATION HEALTH REPORT');
    console.log('='.repeat(80) + '\n');
    console.log(`Total Products: ${validation.stats.total}`);
    console.log(`Correctly Categorized: ${validation.stats.correct} (${((validation.stats.correct / validation.stats.total) * 100).toFixed(2)}%)`);
    console.log(`Incorrectly Categorized: ${validation.stats.incorrect} (${((validation.stats.incorrect / validation.stats.total) * 100).toFixed(2)}%)`);
    console.log(`Uncategorized: ${validation.stats.uncategorized} (${((validation.stats.uncategorized / validation.stats.total) * 100).toFixed(2)}%)`);
    
    console.log('\n' + '-'.repeat(80));
    console.log('PRODUCTS BY DETECTED CATEGORY');
    console.log('-'.repeat(80) + '\n');
    
    for (const [category, count] of Object.entries(validation.stats.byCategory)) {
      console.log(`${category}: ${count} products`);
    }
    
    if (validation.incorrectProducts.length > 0) {
      console.log('\n' + '-'.repeat(80));
      console.log('INCORRECTLY CATEGORIZED PRODUCTS (first 20)');
      console.log('-'.repeat(80) + '\n');
      
      validation.incorrectProducts.slice(0, 20).forEach((p, idx) => {
        console.log(`${idx + 1}. "${p.name}"`);
        console.log(`   Current: "${p.currentCategory}" → Should be: "${p.detectedCategory}"`);
        console.log('');
      });
      
      if (validation.incorrectProducts.length > 20) {
        console.log(`   ... and ${validation.incorrectProducts.length - 20} more\n`);
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Report generation error:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const isReportOnly = args.includes('--report') || args.includes('-r');
  const isVerbose = !args.includes('--quiet') && !args.includes('-q');
  
  await connectDB();
  
  try {
    if (isReportOnly) {
      await generateReport();
    } else {
      await fixCategories({
        dryRun: isDryRun,
        verbose: isVerbose
      });
      
      // Show updated report after migration
      if (!isDryRun) {
        console.log('\n📊 Updated Statistics:\n');
        await generateReport();
      }
    }
    
    console.log('✅ Migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
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

module.exports = { fixCategories, generateReport };
