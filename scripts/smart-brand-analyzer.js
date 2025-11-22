/**
 * Smart Brand Analyzer Script
 * Analyzes product names and intelligently assigns brand names
 * Runs on entire MongoDB database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Brand patterns for intelligent detection
const BRAND_PATTERNS = {
  // CPU Brands
  'Intel': {
    patterns: [/\bintel\b/i, /\bi3\b/i, /\bi5\b/i, /\bi7\b/i, /\bi9\b/i, /\bxeon\b/i],
    category: 'Processor'
  },
  'AMD': {
    patterns: [/\bamd\b/i, /\bryzen\b/i, /\bepyc\b/i, /\bathlon\b/i],
    category: 'Processor'
  },
  
  // GPU Brands
  'NVIDIA': {
    patterns: [/\bnvidia\b/i, /\bgeforce\b/i, /\bgtx\b/i, /\brtx\b/i, /\bcuda\b/i],
    category: 'GPU'
  },
  'AMD Radeon': {
    patterns: [/\bradeon\b/i, /\brx\s*\d{3,4}\b/i, /\bvega\b/i],
    category: 'GPU'
  },
  'Intel Arc': {
    patterns: [/\bintel\s+arc\b/i, /\barc\s+a\d{3,4}\b/i],
    category: 'GPU'
  },
  
  // Motherboard Brands
  'ASUS': {
    patterns: [/\basus\b/i, /\brog\b/i, /\bstrix\b/i, /\btuf\b/i],
    category: 'Motherboard'
  },
  'MSI': {
    patterns: [/\bmsi\b/i, /\bmag\b/i, /\bgaming\s+edge\b/i],
    category: 'Motherboard'
  },
  'Gigabyte': {
    patterns: [/\bgigabyte\b/i, /\baorus\b/i, /\bwing\b/i],
    category: 'Motherboard'
  },
  'ASRock': {
    patterns: [/\basrock\b/i, /\bfatal1ty\b/i],
    category: 'Motherboard'
  },
  
  // RAM Brands
  'Corsair': {
    patterns: [/\bcorsair\b/i, /\bvengeance\b/i, /\bdominators\b/i],
    category: 'RAM'
  },
  'Kingston': {
    patterns: [/\bkingston\b/i, /\bhyperx\b/i],
    category: 'RAM'
  },
  'G.Skill': {
    patterns: [/\bg\.skill\b/i, /\btrident\b/i, /\bflare\b/i],
    category: 'RAM'
  },
  'Crucial': {
    patterns: [/\bcrucial\b/i, /\bballistix\b/i],
    category: 'RAM'
  },
  
  // Storage Brands
  'Samsung': {
    patterns: [/\bsamsung\b/i, /\b970\b/i, /\b860\b/i, /\b980\b/i],
    category: 'SSD'
  },
  'WD': {
    patterns: [/\bwestern\s+digital\b/i, /\bwd\b/i, /\bblue\b/i, /\bblack\b/i],
    category: 'Storage'
  },
  'Seagate': {
    patterns: [/\bseagate\b/i, /\bbarracuda\b/i, /\bfirecuda\b/i],
    category: 'Storage'
  },
  'SK Hynix': {
    patterns: [/\bsk\s+hynix\b/i, /\bhynix\b/i],
    category: 'RAM'
  },
  'Micron': {
    patterns: [/\bmicron\b/i, /\bcrucia\b/i],
    category: 'RAM'
  },
  
  // PSU Brands
  'Corsair': {
    patterns: [/\bcorsair\b/i],
    category: 'Power Supply'
  },
  'EVGA': {
    patterns: [/\bevga\b/i],
    category: 'Power Supply'
  },
  'Seasonic': {
    patterns: [/\bseasonic\b/i],
    category: 'Power Supply'
  },
  'Thermaltake': {
    patterns: [/\bthermaltake\b/i],
    category: 'Power Supply'
  },
  
  // Cooling Brands
  'Noctua': {
    patterns: [/\bnoctua\b/i],
    category: 'Cooling'
  },
  'be quiet!': {
    patterns: [/\bbe\s+quiet\b/i],
    category: 'Cooling'
  },
  'Corsair': {
    patterns: [/\bcorsair\b/i],
    category: 'Cooling'
  },
  
  // Case Brands
  'NZXT': {
    patterns: [/\bnzxt\b/i],
    category: 'Case'
  },
  'Corsair': {
    patterns: [/\bcorsair\b/i],
    category: 'Case'
  },
  'Lian Li': {
    patterns: [/\blian\s+li\b/i],
    category: 'Case'
  },
  
  // Monitor Brands
  'ASUS': {
    patterns: [/\basus\b/i],
    category: 'Monitor'
  },
  'LG': {
    patterns: [/\blg\b/i],
    category: 'Monitor'
  },
  'Dell': {
    patterns: [/\bdell\b/i],
    category: 'Monitor'
  },
  'BenQ': {
    patterns: [/\bbenq\b/i],
    category: 'Monitor'
  },
  
  // Peripheral Brands
  'Logitech': {
    patterns: [/\blogitech\b/i],
    category: 'Peripherals'
  },
  'Razer': {
    patterns: [/\brazer\b/i],
    category: 'Peripherals'
  },
  'SteelSeries': {
    patterns: [/\bsteelseries\b/i],
    category: 'Peripherals'
  }
};

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

// Intelligent brand detection
function detectBrand(productName) {
  if (!productName) return null;
  
  const name = String(productName).toLowerCase();
  
  // Check each brand pattern
  for (const [brandName, config] of Object.entries(BRAND_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(name)) {
        return {
          brand: brandName,
          category: config.category,
          confidence: 'high'
        };
    }
    }
  }
  
  return null;
}

// Extract category from product name
function detectCategory(productName) {
  if (!productName) return null;
  
  const name = String(productName).toLowerCase();
  
  const categoryPatterns = {
    'Processor': [/\b(cpu|processor|intel|amd|ryzen|i3|i5|i7|i9|xeon)\b/i],
    'GPU': [/\b(gpu|graphics|video card|gtx|rtx|radeon|geforce|arc)\b/i],
    'RAM': [/\b(ram|memory|ddr|ddr4|ddr5)\b/i],
    'SSD': [/\b(ssd|nvme|m\.2|solid state)\b/i],
    'HDD': [/\b(hdd|hard drive|3\.5|2\.5)\b/i],
    'Motherboard': [/\b(motherboard|mobo|mainboard)\b/i],
    'Power Supply': [/\b(psu|power|watts|watt)\b/i],
    'Cooling': [/\b(cooler|cooling|fan|heatsink)\b/i],
    'Case': [/\b(case|chassis|tower)\b/i],
    'Monitor': [/\b(monitor|display|screen)\b/i],
    'Keyboard': [/\b(keyboard|keeb)\b/i],
    'Mouse': [/\b(mouse|mice)\b/i]
  };
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return category;
      }
    }
  }
  
  return null;
}

// Main analysis function
async function analyzeAndUpdateProducts() {
  try {
    const ProductModel = getProductModel();
    
    // Get all products
    const products = await ProductModel.find({}).lean();
    console.log(`\n📊 Found ${products.length} products to analyze\n`);
    
    let updated = 0;
    let skipped = 0;
    const results = [];
    
    for (const product of products) {
      const productName = product.Name || product.name || product.title || '';
      
      if (!productName) {
        skipped++;
        continue;
      }
      
      // Detect brand and category
      const brandInfo = detectBrand(productName);
      const detectedCategory = detectCategory(productName);
      
      // Prepare update
      const updateData = {};
      
      if (brandInfo) {
        updateData.brand = brandInfo.brand;
        if (!product.category) {
          updateData.category = brandInfo.category;
        }
      }
      
      if (detectedCategory && !product.category) {
        updateData.category = detectedCategory;
      }
      
      // Update if there's new data
      // IMPORTANT: Never touch image fields - preserve existing images!
      if (Object.keys(updateData).length > 0) {
        // Ensure we're not overwriting any image fields
        const safeUpdateData = { ...updateData };
        delete safeUpdateData.imageUrl;
        delete safeUpdateData.img;
        delete safeUpdateData.image;
        
        if (Object.keys(safeUpdateData).length > 0) {
          await ProductModel.findByIdAndUpdate(product._id, safeUpdateData);
          updated++;
          
          results.push({
            name: productName,
            brand: updateData.brand || product.brand || 'N/A',
            category: updateData.category || product.category || 'N/A',
            status: '✅ Updated'
          });
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`\n✅ Analysis Complete!`);
    console.log(`📈 Updated: ${updated} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`\n📋 Sample Results (first 10):\n`);
    
    results.slice(0, 10).forEach(r => {
      console.log(`  📦 ${r.name}`);
      console.log(`     Brand: ${r.brand} | Category: ${r.category}`);
    });
    
    console.log(`\n✨ Brand assignment complete!`);
    
  } catch (err) {
    console.error('❌ Error during analysis:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
async function main() {
  console.log('🚀 Starting Smart Brand Analyzer...\n');
  await connectDB();
  await analyzeAndUpdateProducts();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
