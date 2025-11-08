// Final cleanup - remove ALL non-CPU items from Processors
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

// Detect category with maximum accuracy
function detectCategory(productName, brand) {
  if (!productName) return null;
  
  const nameLower = productName.toLowerCase();
  const brandLower = (brand || '').toLowerCase();
  
  // 1. LAPTOPS (highest priority - many contain CPU names)
  const laptopPatterns = [
    /laptop/i, /notebook/i, /katana/i, /\bhp\s+\d+/i, /elitebook/i,
    /expertbook/i, /vivobook/i, /zenbook/i, /thinkpad/i, /ideapad/i,
    /pavilion/i, /envy/i, /spectre/i, /mac\s*studio/i, /macbook/i,
    /chromebook/i, /\basus\s+[a-z]+\d+\b.*\d+gb.*\d+gb/i
  ];
  
  for (const pattern of laptopPatterns) {
    if (pattern.test(productName)) {
      return { category_id: 15, category: 'Prebuilt PCs', categorySlug: 'prebuilts' };
    }
  }
  
  // 2. STORAGE (SSDs, HDDs, NAS - check before CPUs as they may contain "core")
  if (nameLower.match(/\bssd\b|solid state|hard drive|\bhdd\b|nvme|m\.?2\s*ssd|verbatim.*ssd|\bnas\b/i)) {
    return { category_id: 5, category: 'Storage', categorySlug: 'storage' };
  }
  
  // 3. THERMAL PASTE / COOLING ACCESSORIES
  if (nameLower.match(/thermal\s*paste|thermal\s*compound|polartherm|arctic\s*mx/i)) {
    return { category_id: 8, category: 'CPU Coolers', categorySlug: 'cooling' };
  }
  
  // 4. MONITORS
  if (nameLower.match(/monitor|display|\bscreen\b|"\s*gaming.*hz|hz.*gaming/i)) {
    return { category_id: 9, category: 'Monitors', categorySlug: 'monitors' };
  }
  
  // 5. MOTHERBOARDS
  if (nameLower.match(/motherboard|mobo|mainboard/i)) {
    return { category_id: 2, category: 'Motherboards', categorySlug: 'motherboards' };
  }
  
  // 6. GRAPHICS CARDS
  if (nameLower.match(/\brtx\s*\d+|gtx\s*\d+|geforce|radeon\s*rx|graphics\s*card/i)) {
    return { category_id: 3, category: 'Graphics Cards', categorySlug: 'graphics-cards' };
  }
  
  // 7. PREBUILT PCs / DESKTOPS
  if (nameLower.match(/prebuilt|desktop|workstation|gaming\s*pc|gaming\s*rig/i)) {
    return { category_id: 15, category: 'Prebuilt PCs', categorySlug: 'prebuilts' };
  }
  
  // 8. ONLY NOW CHECK FOR PURE CPUs
  // Must explicitly say "processor" or "cpu" or "tray" or "box"
  const cpuKeywords = ['processor', ' cpu', 'tray', 'box', 'boxed'];
  const hasCpuKeyword = cpuKeywords.some(kw => nameLower.includes(kw));
  
  if (!hasCpuKeyword) {
    return null; // Not explicitly a CPU product
  }
  
  // Must be Intel or AMD brand
  const validCpuBrands = ['intel', 'amd'];
  const isValidBrand = validCpuBrands.some(b => 
    brandLower.includes(b) || nameLower.includes(b)
  );
  
  if (!isValidBrand) {
    return null; // Not Intel or AMD
  }
  
  // Must match CPU model patterns
  const cpuPatterns = [
    /intel\s+core\s+(i[3579]|ultra)/i,
    /core\s+(i[3579]|ultra)\s*-?\s*\d+/i,
    /\b(i[3579])-\d{4,5}/i,
    /ryzen\s+[3579]/i,
    /threadripper/i,
    /athlon/i,
    /pentium/i,
    /celeron/i,
    /xeon/i
  ];
  
  for (const pattern of cpuPatterns) {
    if (pattern.test(productName)) {
      return { category_id: 1, category: 'Processors', categorySlug: 'processors' };
    }
  }
  
  return null; // No clear match
}

async function finalCleanup() {
  console.log('🧹 Final cleanup of Processor category...\n');
  
  const Product = getProductModel();
  
  // Get ALL products in Processor category
  const processors = await Product.find({ category_id: 1 }).lean();
  
  console.log(`📦 Analyzing ${processors.length} products in Processor category...\n`);
  
  const updates = [];
  const moveStats = {};
  
  for (const product of processors) {
    const name = product.name || product.title || product.Name || '';
    const brand = product.brand || '';
    
    const correctCategory = detectCategory(name, brand);
    
    // If we detected a different category OR couldn't confirm it's a CPU
    if (correctCategory && correctCategory.category_id !== 1) {
      updates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: correctCategory }
        }
      });
      
      const catName = correctCategory.category;
      moveStats[catName] = (moveStats[catName] || 0) + 1;
      
      console.log(`❌ NOT A CPU: ${name.substring(0, 70)}...`);
      console.log(`   → Moving to: ${correctCategory.category}\n`);
    } else if (!correctCategory) {
      // Couldn't determine category - move to "Other" or keep as is
      console.log(`⚠️  Unclear: ${name.substring(0, 70)}...`);
      console.log(`   Brand: ${brand || 'N/A'}\n`);
    }
  }
  
  // Execute updates
  if (updates.length > 0) {
    const result = await Product.bulkWrite(updates);
    console.log(`\n✅ Moved ${result.modifiedCount} products out of Processors\n`);
  } else {
    console.log('\n✅ No products need to be moved\n');
  }
  
  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 FINAL CLEANUP SUMMARY');
  console.log('═══════════════════════════════════════');
  if (Object.keys(moveStats).length > 0) {
    console.log('Products moved to:');
    Object.entries(moveStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   → ${cat}: ${count} products`);
      });
  }
  console.log('═══════════════════════════════════════\n');
  
  // Final count
  const finalCount = await Product.countDocuments({ category_id: 1 });
  console.log(`✅ Final Processor category: ${finalCount} products\n`);
  
  // Show remaining products
  const remaining = await Product.find({ category_id: 1 })
    .select('name brand')
    .lean()
    .limit(30);
  
  console.log('🔍 Final Processor category products:');
  remaining.forEach((p, idx) => {
    const name = p.name || p.title || p.Name || '';
    const brand = p.brand || 'N/A';
    console.log(`   ${idx + 1}. [${brand}] ${name.substring(0, 70)}...`);
  });
}

async function main() {
  try {
    await connectDB();
    await finalCleanup();
    console.log('\n🎉 Final cleanup completed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Cleanup failed:', err);
    process.exit(1);
  }
}

main();
