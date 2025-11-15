// Comprehensive fix - properly categorize ALL products
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');
}

function getProductModel() {
  const schema = new mongoose.Schema({}, { strict: false, timestamps: false, collection: 'products' });
  return mongoose.models.Product || mongoose.model('Product', schema);
}

// Comprehensive category detection
function detectCorrectCategory(productName) {
  if (!productName) return null;
  
  const nameLower = productName.toLowerCase();
  
  // PRIORITY 1: Motherboards (check first because they contain CPU names)
  if (nameLower.match(/motherboard|mobo|x870|b650|b850|z890|z790|h610|b760|x670|b550|a620|h510/i)) {
    if (!nameLower.match(/laptop|notebook/i)) {
      return { category_id: 2, category: 'Motherboards', categorySlug: 'motherboards' };
    }
  }
  
  // PRIORITY 2: Laptops (before processors because laptops contain CPU names)
  const laptopIndicators = [
    'laptop', 'notebook', 'elitebook', 'thinkpad', 'precision',
    'inspiron', 'latitude', 'vostro', 'probook', 'pavilion',
    'zenbook', 'vivobook', 'tuf gaming', 'rog strix', 'rog laptop',
    'chromebook', 'macbook', 'ideapad', 'legion', 'nitro v',
    'aspire', 'swift', 'expertbook'
  ];
  
  for (const indicator of laptopIndicators) {
    if (nameLower.includes(indicator)) {
      return { category_id: 15, category: 'Prebuilt PCs', categorySlug: 'prebuilts' };
    }
  }
  
  // PRIORITY 3: Storage (NAS, SSD, HDD)
  if (nameLower.match(/\bnas\b|network attached storage|asustor|synology|qnap|drivestor/i)) {
    return { category_id: 5, category: 'Storage', categorySlug: 'storage' };
  }
  
  // PRIORITY 4: Pure CPUs only (very strict)
  const cpuPatterns = [
    /\b(intel core|core)\s+(i[3579]|ultra)\s*-?\s*\d+/i,
    /\bamd\s+ryzen\s+[3579]\s+\d+x3d/i,
    /\bamd\s+ryzen\s+[3579]\s+\d+[gx]?e?\b/i,
    /\bintel\s+(pentium|celeron|xeon)\b/i,
    /\b(i3|i5|i7|i9)-\d{4,5}[kf]?\b/i,
    /\bryzen\s+(threadripper|athlon)\b/i
  ];
  
  // Must match CPU pattern AND be a standalone processor (not in laptop/motherboard)
  for (const pattern of cpuPatterns) {
    if (pattern.test(productName)) {
      // Make sure it's actually a CPU product
      const cpuKeywords = ['processor', 'cpu', 'tray', 'box'];
      const hasKeyword = cpuKeywords.some(kw => nameLower.includes(kw));
      
      // Exclude if it has non-CPU indicators
      const nonCpuIndicators = ['motherboard', 'laptop', 'notebook', 'monitor', 'case'];
      const hasNonCpu = nonCpuIndicators.some(ind => nameLower.includes(ind));
      
      if (hasKeyword && !hasNonCpu) {
        return { category_id: 1, category: 'Processors', categorySlug: 'processors' };
      }
    }
  }
  
  return null; // No match, keep existing category
}

async function comprehensiveFix() {
  console.log('🔧 Starting comprehensive categorization fix...\n');
  
  const Product = getProductModel();
  
  // Get all products in Processor category
  const processorsCategory = await Product.find({ category_id: 1 }).lean();
  
  console.log(`📦 Found ${processorsCategory.length} products in Processor category`);
  console.log('🔍 Re-categorizing each product...\n');
  
  const updates = [];
  const categoryCounts = {};
  
  for (const product of processorsCategory) {
    const name = product.name || product.title || product.Name || '';
    const correctCategory = detectCorrectCategory(name);
    
    if (correctCategory && correctCategory.category_id !== 1) {
      // This product should NOT be in Processors
      updates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: correctCategory }
        }
      });
      
      const catName = correctCategory.category;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      
      console.log(`📝 ${name.substring(0, 60)}...`);
      console.log(`   → Moving to: ${correctCategory.category}\n`);
    }
  }
  
  // Execute updates
  if (updates.length > 0) {
    const result = await Product.bulkWrite(updates);
    console.log(`✅ Updated ${result.modifiedCount} products\n`);
  }
  
  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 RECATEGORIZATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Products moved from Processors:`);
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   → ${cat}: ${count} products`);
    });
  console.log('═══════════════════════════════════════\n');
  
  // Final verification
  const finalProcessorCount = await Product.countDocuments({ category_id: 1 });
  console.log(`✅ Final Processor category count: ${finalProcessorCount} products\n`);
  
  console.log('🔍 Remaining products in Processor category:');
  const remainingProcessors = await Product.find({ category_id: 1 })
    .select('name brand')
    .lean()
    .limit(20);
  
  remainingProcessors.forEach(p => {
    const name = p.name || p.title || p.Name || '';
    console.log(`   - [${p.brand || 'N/A'}] ${name.substring(0, 70)}...`);
  });
}

async function main() {
  try {
    await connectDB();
    await comprehensiveFix();
    console.log('\n✅ Comprehensive fix completed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fix failed:', err);
    process.exit(1);
  }
}

main();
