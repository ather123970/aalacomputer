/**
 * CLEAN PC CASES CATEGORY
 * Remove case fans, CPU coolers, iPad cases, etc.
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String,
  Name: String,
  title: String,
  category: String,
  categorySlug: String,
  brand: String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

// Items that should NOT be in PC Cases category
const NOT_PC_CASES = [
  // Case Fans (should be in Cooling)
  {
    keywords: ['case fan', 'rgb fan', 'argb fan', 'cooling fan', '120mm', '140mm', 'pwm fan', 'uni fan', 'aer rgb', 'infinity fan'],
    newCategory: 'Cooling',
    newSlug: 'cooling'
  },
  
  // CPU Coolers (should be in Cooling)
  {
    keywords: ['cpu cooler', 'cpu air cooler', 'tower cpu', 'cpu fan', 'single tower', 'dual tower', 'liquid cooler', 'aio cooler'],
    newCategory: 'Cooling',
    newSlug: 'cooling'
  },
  
  // iPad/Tablet Cases (should be in Accessories)
  {
    keywords: ['ipad case', 'tablet case', 'ipad protective', 'rotative ipad', 'ipad 10.', 'macbook case', 'protective case for'],
    newCategory: 'Accessories',
    newSlug: 'accessories'
  },
  
  // Briefcases/Bags (should be in Accessories)
  {
    keywords: ['briefcase', 'laptop bag', 'carrying case', 'travel case'],
    newCategory: 'Accessories',
    newSlug: 'accessories'
  },
  
  // SSD Enclosures (should be in Storage)
  {
    keywords: ['ssd enclosure', 'external enclosure', 'nvme enclosure', 'portable enclosure', 'ssd external'],
    newCategory: 'Storage',
    newSlug: 'storage'
  }
];

async function cleanPCCases() {
  console.log('\n🧹 CLEANING PC CASES CATEGORY\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');
  
  // Get all products in Cases category
  const caseProducts = await Product.find({ category: /^cases$/i }).lean();
  
  console.log(`Found ${caseProducts.length} products in Cases category\n`);
  console.log('Removing non-PC-case items...\n');
  
  let totalMoved = 0;
  const movedByCategory = {};
  
  for (const product of caseProducts) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    let moved = false;
    
    // Check each rule
    for (const rule of NOT_PC_CASES) {
      const hasKeyword = rule.keywords.some(kw => name.includes(kw.toLowerCase()));
      
      if (hasKeyword) {
        // This is NOT a PC case, move it
        await Product.updateOne(
          { _id: product._id },
          { $set: { category: rule.newCategory, categorySlug: rule.newSlug } }
        );
        
        console.log(`✅ "${name.substring(0, 65)}..." → ${rule.newCategory}`);
        
        if (!movedByCategory[rule.newCategory]) {
          movedByCategory[rule.newCategory] = 0;
        }
        movedByCategory[rule.newCategory]++;
        totalMoved++;
        moved = true;
        break;
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SUMMARY: Moved ${totalMoved} non-PC-case items\n`);
  
  if (Object.keys(movedByCategory).length > 0) {
    console.log('Breakdown by category:');
    for (const [category, count] of Object.entries(movedByCategory)) {
      console.log(`  ✅ ${category}: ${count} products`);
    }
  }
  
  // Check final count
  const finalCount = await Product.countDocuments({ category: /^cases$/i });
  console.log(`\n📦 Remaining PC Cases: ${finalCount}\n`);
  
  console.log('='.repeat(70) + '\n');
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

cleanPCCases();
