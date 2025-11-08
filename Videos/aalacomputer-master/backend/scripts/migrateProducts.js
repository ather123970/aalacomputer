// Auto-migration script to add category_id, brand, and is_active to existing products
const mongoose = require('mongoose');
require('dotenv').config();

const { PAKISTAN_CATEGORIES } = require('../data/pakistanCategories');

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// Get Product model (matching your actual collection name)
function getProductModel() {
  const schema = new mongoose.Schema({}, { 
    strict: false, 
    timestamps: false,
    collection: 'products' // Explicitly set collection name
  });
  return mongoose.models.Product || mongoose.model('Product', schema);
}

// Extract brand from product name (usually first word)
function extractBrand(productName) {
  if (!productName) return '';
  
  const name = productName.trim();
  
  // Common brand patterns
  const brandPatterns = [
    'SteelSeries', 'Epson', 'MSI', 'ASUS', 'Gigabyte', 'ASRock', 'Intel', 'AMD',
    'Corsair', 'Cooler Master', 'Thermaltake', 'DeepCool', 'NZXT', 'Logitech',
    'Razer', 'Redragon', 'Kingston', 'Samsung', 'Western Digital', 'Seagate',
    'G.Skill', 'Crucial', 'ADATA', 'TeamGroup', 'Zotac', 'Palit', 'Sapphire',
    'XFX', 'PowerColor', 'Biostar', 'Lian Li', 'Noctua', 'ARCTIC', 'AOC',
    'ViewSonic', 'BenQ', 'LG', 'Xiaomi', 'Fantech', 'JBL', 'HyperX', 'Sony',
    'Sennheiser', 'Edifier', 'Creative', 'TP-Link', 'D-Link', 'Huawei',
    'Mikrotik', 'Tenda', 'Dell', 'HP', 'Lenovo', 'Acer', 'Antec', 'Seasonic'
  ];
  
  // Check if any known brand is in the name
  for (const brand of brandPatterns) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // If no known brand found, take first word
  const firstWord = name.split(/[\s-]/)[0];
  return firstWord;
}

// Detect category from product name and assign category_id
function detectCategory(productName) {
  if (!productName) return { category: '', category_id: null };
  
  const nameLower = productName.toLowerCase();
  
  // Check each Pakistan category's keywords
  for (const cat of PAKISTAN_CATEGORIES) {
    // Check keywords
    for (const keyword of cat.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return {
          category: cat.name,
          category_id: cat.id,
          categorySlug: cat.slug
        };
      }
    }
    
    // Check category name itself
    if (nameLower.includes(cat.name.toLowerCase())) {
      return {
        category: cat.name,
        category_id: cat.id,
        categorySlug: cat.slug
      };
    }
  }
  
  // Default fallback - check for common patterns
  if (nameLower.includes('headset') || nameLower.includes('headphone')) {
    return { category: 'Headphones', category_id: 12, categorySlug: 'headphones' };
  }
  if (nameLower.includes('cooler') && (nameLower.includes('cpu') || nameLower.includes('liquid') || nameLower.includes('aio'))) {
    return { category: 'CPU Coolers', category_id: 8, categorySlug: 'cooling' };
  }
  if (nameLower.includes('case') || nameLower.includes('cabinet') || nameLower.includes('tower')) {
    return { category: 'PC Cases', category_id: 7, categorySlug: 'cases' };
  }
  if (nameLower.includes('keyboard')) {
    return { category: 'Keyboards', category_id: 10, categorySlug: 'keyboards' };
  }
  if (nameLower.includes('mouse') || nameLower.includes('mice')) {
    return { category: 'Mice', category_id: 11, categorySlug: 'mice' };
  }
  if (nameLower.includes('monitor') || nameLower.includes('display')) {
    return { category: 'Monitors', category_id: 9, categorySlug: 'monitors' };
  }
  
  // Unknown category
  return { category: 'Other', category_id: null, categorySlug: 'other' };
}

// Main migration function
async function migrateProducts() {
  console.log('🚀 Starting product migration...\n');
  
  const Product = getProductModel();
  
  try {
    // Get all products
    const allProducts = await Product.find({}).lean();
    console.log(`📦 Found ${allProducts.length} products to migrate\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    const updates = [];
    
    for (const product of allProducts) {
      try {
        const productName = product.name || product.title || product.Name || '';
        
        // Skip if no name
        if (!productName) {
          console.log(`⚠️  Skipping product ${product._id} - no name`);
          skipped++;
          continue;
        }
        
        // Extract brand
        const brand = product.brand || extractBrand(productName);
        
        // Detect category
        const categoryInfo = detectCategory(productName);
        
        // Prepare update
        const updateData = {
          brand: brand || '',
          category: categoryInfo.category || product.category || '',
          category_id: categoryInfo.category_id,
          categorySlug: categoryInfo.categorySlug || '',
          is_active: true
        };
        
        // Only update if we have a valid category_id
        if (categoryInfo.category_id) {
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: updateData }
            }
          });
          
          console.log(`✅ ${productName.substring(0, 50)}...`);
          console.log(`   Brand: ${brand} | Category: ${categoryInfo.category} (ID: ${categoryInfo.category_id})\n`);
          updated++;
        } else {
          console.log(`⚠️  Could not detect category for: ${productName.substring(0, 60)}...`);
          console.log(`   Brand: ${brand}\n`);
          skipped++;
        }
        
      } catch (err) {
        console.error(`❌ Error processing product ${product._id}:`, err.message);
        errors++;
      }
    }
    
    // Execute bulk update
    if (updates.length > 0) {
      console.log(`\n📝 Executing bulk update for ${updates.length} products...`);
      const result = await Product.bulkWrite(updates);
      console.log(`✅ Bulk update completed: ${result.modifiedCount} products updated\n`);
    }
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📦 Total: ${allProducts.length}`);
    console.log('═══════════════════════════════════════\n');
    
    // Show category breakdown
    console.log('📈 CATEGORY BREAKDOWN:');
    const categoryCount = {};
    for (const product of allProducts) {
      const cat = detectCategory(product.name || product.title || product.Name || '');
      if (cat.category) {
        categoryCount[cat.category] = (categoryCount[cat.category] || 0) + 1;
      }
    }
    
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
}

// Run migration
async function main() {
  try {
    await connectDB();
    await migrateProducts();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

main();
