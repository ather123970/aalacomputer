// Ultra-strict: ONLY keep pure Intel/AMD CPU processors
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');
}

function getProductModel() {
  const schema = new mongoose.Schema({}, { strict: false, timestamps: false, collection: 'products' });
  return mongoose.models.Product || mongoose.model('Product', schema);
}

// Ultra-strict CPU validation
function isActualCPU(productName, brand) {
  if (!productName) return false;
  
  const nameLower = productName.toLowerCase();
  const brandLower = (brand || '').toLowerCase();
  
  // MUST be Intel or AMD
  if (!brandLower.includes('intel') && !brandLower.includes('amd')) {
    return false;
  }
  
  // EXCLUDE anything that's NOT a CPU
  const excludePatterns = [
    /mini\s*pc/i, /\bnuc\b/i, /laptop/i, /notebook/i, /\btv\b/i,
    /router/i, /switch/i, /headphone/i, /speaker/i, /\bfan\b/i,
    /cooler/i, /thermal/i, /\baio\b/i, /all.in.one/i, /desktop/i,
    /workstation/i, /monitor/i, /display/i, /keyboard/i, /mouse/i,
    /\bssd\b/i, /hard\s*drive/i, /motherboard/i, /prebuilt/i
  ];
  
  for (const pattern of excludePatterns) {
    if (pattern.test(productName)) {
      return false;
    }
  }
  
  // MUST explicitly say "processor" or "cpu"
  if (!nameLower.includes('processor') && !nameLower.includes(' cpu')) {
    return false;
  }
  
  // MUST match Intel or AMD CPU patterns
  const intelPatterns = [
    /intel\s+core\s+(i[3579]|ultra)/i,
    /core\s+(i[3579]|ultra)\s*-?\s*\d+/i,
    /\b(i[3579])-\d{4,5}[kf]?\b/i,
    /intel\s+(pentium|celeron|xeon)/i
  ];
  
  const amdPatterns = [
    /ryzen\s+[3579]/i,
    /ryzen\s+threadripper/i,
    /ryzen\s+athlon/i,
    /\bamd\s+fx\b/i
  ];
  
  const allPatterns = [...intelPatterns, ...amdPatterns];
  
  for (const pattern of allPatterns) {
    if (pattern.test(productName)) {
      return true; // This is an actual CPU!
    }
  }
  
  return false;
}

async function ultraStrictCleanup() {
  console.log('🔥 ULTRA-STRICT CLEANUP: Only keeping pure CPUs\n');
  
  const Product = getProductModel();
  const processors = await Product.find({ category_id: 1 }).lean();
  
  console.log(`📦 Found ${processors.length} products\n`);
  
  const toMove = [];
  const toKeep = [];
  
  for (const product of processors) {
    const name = product.name || product.title || product.Name || '';
    const brand = product.brand || '';
    
    if (isActualCPU(name, brand)) {
      toKeep.push(product);
      console.log(`✅ KEEP: ${name.substring(0, 70)}...`);
    } else {
      toMove.push(product);
      console.log(`❌ MOVE: ${name.substring(0, 70)}...`);
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Keep in Processors: ${toKeep.length}`);
  console.log(`   ❌ Move out: ${toMove.length}\n`);
  
  // Move non-CPUs to Prebuilt PCs
  if (toMove.length > 0) {
    const updates = toMove.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { 
          $set: { 
            category_id: 15,
            category: 'Prebuilt PCs',
            categorySlug: 'prebuilts'
          }
        }
      }
    }));
    
    const result = await Product.bulkWrite(updates);
    console.log(`✅ Moved ${result.modifiedCount} products\n`);
  }
  
  // Final verification
  const finalCount = await Product.countDocuments({ category_id: 1 });
  console.log(`\n🎯 FINAL: ${finalCount} pure CPUs in Processor category\n`);
  
  const final = await Product.find({ category_id: 1 }).select('name brand').lean();
  console.log('✅ Final Processor category (ALL products):');
  final.forEach((p, idx) => {
    const name = p.name || p.title || p.Name || '';
    console.log(`   ${idx + 1}. [${p.brand}] ${name}`);
  });
}

async function main() {
  try {
    await connectDB();
    await ultraStrictCleanup();
    console.log('\n🎉 Ultra-strict cleanup done!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err);
    process.exit(1);
  }
}

main();
