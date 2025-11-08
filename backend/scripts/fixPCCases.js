/**
 * FIX PC CASES CATEGORY
 * Ensure all PC cases are in the correct category
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

// PC Case indicators
const PC_CASE_KEYWORDS = [
  'pc case',
  'gaming case',
  'atx case',
  'mid tower',
  'full tower',
  'mini tower',
  'computer case',
  'tower case',
  'pc cabinet',
  'gaming cabinet',
  'tempered glass.*case',
  'rgb.*case',
  'argb.*case',
  
  // Specific case models
  'darkflash.*case',
  'msi mag pano',
  'msi mag forge',
  'asus.*case',
  'cougar.*case',
  'gamemax.*case',
  'thermaltake.*case',
  'corsair.*case',
  'nzxt.*case',
  'lian li.*case',
  'fractal.*case',
  'phanteks.*case',
  'cooler master.*case',
  
  // Case features
  'side panel',
  'mesh panel',
  'radiator support',
  'gpu clearance',
  'matx case',
  'e-atx case',
  'mini-itx case'
];

// These are NOT cases (CPU coolers that might be confused)
const NOT_CASES = [
  'laptop case',
  'phone case',
  'macbook case',
  'shield case',
  'tablet case',
  'cpu cooler',
  'air cooler',
  'liquid cooler'
];

async function fixPCCases() {
  console.log('\n🔧 FIXING PC CASES CATEGORY\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');
  
  // First, check current PC Cases
  const currentCases = await Product.countDocuments({ category: /^cases$/i });
  console.log(`Current PC Cases in category: ${currentCases}\n`);
  
  // Find all products that should be PC cases
  const allProducts = await Product.find({}).lean();
  
  console.log(`Scanning ${allProducts.length} products for PC cases...\n`);
  
  let fixed = 0;
  
  for (const product of allProducts) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    const currentCategory = (product.category || '').toLowerCase();
    
    // Skip if already in Cases category
    if (currentCategory === 'cases') continue;
    
    // Check if it's NOT a case (accessories)
    const isNotCase = NOT_CASES.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(name);
    });
    
    if (isNotCase) continue;
    
    // Check if it IS a PC case
    const isPCCase = PC_CASE_KEYWORDS.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(name);
    });
    
    if (isPCCase) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { category: 'Cases', categorySlug: 'cases' } }
      );
      
      console.log(`✅ MOVED TO CASES: "${name.substring(0, 70)}..."`);
      fixed++;
    }
  }
  
  console.log(`\n📊 Moved ${fixed} products to Cases category\n`);
  
  // Check final count
  const finalCount = await Product.countDocuments({ category: /^cases$/i });
  console.log(`📦 Total PC Cases now: ${finalCount}\n`);
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

fixPCCases();
