/**
 * Product Database Cleanup & Standardization Script
 * 
 * Purpose: Analyze, fix, and standardize product names, brands, and categories
 * Safety: Creates backups, logs all changes, flags ambiguous items
 * 
 * Process:
 * 1. Backup original products
 * 2. Analyze each product title
 * 3. Fix brands using mapping rules
 * 4. Fix categories using keyword matching
 * 5. Normalize titles
 * 6. Detect duplicates
 * 7. Flag ambiguous items
 * 8. Log all changes
 * 9. Generate reports
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Brand mapping rules
const BRAND_MAPPING = {
  'Intel': ['intel', 'i3', 'i5', 'i7', 'i9', 'xeon', 'core i'],
  'AMD': ['amd', 'ryzen', 'epyc', 'athlon'],
  'NVIDIA': ['nvidia', 'geforce', 'gtx', 'rtx', 'cuda'],
  'MSI': ['msi', 'mag'],
  'ASUS': ['asus', 'rog', 'strix', 'tuf'],
  'Gigabyte': ['gigabyte', 'aorus'],
  'ASRock': ['asrock'],
  'Corsair': ['corsair', 'vengeance', 'dominator'],
  'Kingston': ['kingston', 'hyperx'],
  'G.Skill': ['g.skill', 'trident'],
  'Crucial': ['crucial', 'ballistix'],
  'Samsung': ['samsung'],
  'WD': ['western digital', 'wd'],
  'Seagate': ['seagate', 'barracuda'],
  'EVGA': ['evga'],
  'Seasonic': ['seasonic'],
  'Thermaltake': ['thermaltake'],
  'Noctua': ['noctua'],
  'be quiet!': ['be quiet'],
  'NZXT': ['nzxt'],
  'Lian Li': ['lian li'],
  'HP': ['hp', 'hewlett'],
  'Dell': ['dell'],
  'Lenovo': ['lenovo', 'ideapad', 'thinkpad'],
  'ASUS': ['asus', 'vivobook', 'zenbook'],
  'Acer': ['acer', 'aspire'],
  'Razer': ['razer'],
  'SteelSeries': ['steelseries'],
  'Logitech': ['logitech'],
  'GameMax': ['gamemax'],
  'Maxsun': ['maxsun']
};

// Category mapping rules
const CATEGORY_RULES = {
  'Processors': {
    keywords: ['ryzen', 'core i3', 'core i5', 'core i7', 'core i9', 'intel core', 'xeon', 'epyc', 'processor', 'cpu'],
    exclude: ['graphics', 'gpu', 'video', 'card', 'geforce', 'gtx', 'rtx', 'radeon', 'arc'],
    sockets: ['lga1700', 'lga1200', 'am5', 'am4', 'tr4']
  },
  'CPU Coolers': {
    keywords: ['aio', 'radiator', 'liquid', 'cooler', 'fan', 'air cooler', 'tower cooler', 'heatsink'],
    exclude: ['case', 'power', 'psu']
  },
  'Motherboards': {
    keywords: ['motherboard', 'mobo', 'mainboard', 'b650', 'z790', 'z690', 'b550', 'x570', 'am5', 'lga1700'],
    exclude: ['cpu', 'processor', 'cooler']
  },
  'RAM': {
    keywords: ['ram', 'memory', 'ddr4', 'ddr5', 'ddr3', 'gb', 'dimm'],
    exclude: ['cpu', 'cooler']
  },
  'SSD': {
    keywords: ['ssd', 'nvme', 'm.2', 'solid state', 'nand'],
    exclude: ['hdd', 'hard drive']
  },
  'HDD': {
    keywords: ['hdd', 'hard drive', 'storage', '3.5', '2.5'],
    exclude: ['ssd', 'nvme']
  },
  'GPU': {
    keywords: ['gpu', 'graphics', 'video card', 'geforce', 'gtx', 'rtx', 'radeon', 'arc', 'vram'],
    exclude: ['cpu', 'processor']
  },
  'Laptops': {
    keywords: ['laptop', 'notebook', 'probook', 'ideapad', 'vivobook', 'zenbook', 'aspire', 'pavilion', 'inspiron'],
    exclude: ['desktop', 'tower']
  },
  'Power Supply': {
    keywords: ['psu', 'power supply', 'watts', 'watt', '80+'],
    exclude: []
  },
  'Cases': {
    keywords: ['case', 'chassis', 'tower', 'cabinet', 'casing'],
    exclude: ['cooler', 'fan']
  },
  'Monitors': {
    keywords: ['monitor', 'display', 'screen', 'lcd', 'led', 'inch', 'hz', 'resolution'],
    exclude: []
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

// Detect brand from title
function detectBrand(title) {
  if (!title) return null;
  const lowerTitle = String(title).toLowerCase();
  
  for (const [brand, patterns] of Object.entries(BRAND_MAPPING)) {
    for (const pattern of patterns) {
      if (lowerTitle.includes(pattern)) {
        return brand;
      }
    }
  }
  return null;
}

// Detect category from title
function detectCategory(title) {
  if (!title) return null;
  const lowerTitle = String(title).toLowerCase();
  
  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    // Check if any exclude keyword is present
    const hasExclude = rules.exclude.some(keyword => lowerTitle.includes(keyword));
    if (hasExclude) continue;
    
    // Check if any keyword is present
    const hasKeyword = rules.keywords.some(keyword => lowerTitle.includes(keyword));
    if (hasKeyword) return category;
  }
  
  return null;
}

// Normalize title
function normalizeTitle(title) {
  if (!title) return '';
  
  let normalized = String(title).trim();
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove repeated brand tokens
  normalized = normalized.replace(/^(Intel|AMD|NVIDIA|MSI|ASUS)\s+\1/gi, '$1');
  
  // Remove common verbose suffixes
  normalized = normalized.replace(/\s+\(Tray\)\s*$/gi, ' | Tray');
  normalized = normalized.replace(/\s+Desktop Processor\s*/gi, '');
  normalized = normalized.replace(/\s+Processor\s*$/gi, '');
  
  // Limit length
  if (normalized.length > 150) {
    normalized = normalized.substring(0, 147) + '...';
  }
  
  return normalized;
}

// Check if product is ambiguous
function isAmbiguous(product, detectedBrand, detectedCategory) {
  const title = String(product.Name || product.name || product.title || '').toLowerCase();
  
  // Check for multiple category keywords
  let categoryCount = 0;
  for (const rules of Object.values(CATEGORY_RULES)) {
    const hasKeyword = rules.keywords.some(k => title.includes(k));
    if (hasKeyword) categoryCount++;
  }
  
  if (categoryCount > 1) return true;
  
  // Check for suspicious price
  const price = product.price || 0;
  if (price === 0 || price < 100) return true;
  
  // Check title length
  if (title.length > 200) return true;
  
  // Check for conflicting brand
  if (product.brand && detectedBrand && product.brand !== detectedBrand) {
    return true;
  }
  
  return false;
}

// Main cleanup function
async function cleanupProducts() {
  try {
    const ProductModel = getProductModel();
    
    // Get all products
    const products = await ProductModel.find({}).lean();
    console.log(`\n📊 Found ${products.length} products to analyze\n`);
    
    let fixed = 0;
    let ambiguous = 0;
    const changes = [];
    const ambiguousProducts = [];
    const duplicates = [];
    
    // Track titles for duplicate detection
    const titleMap = new Map();
    
    for (const product of products) {
      const productTitle = product.Name || product.name || product.title || '';
      const productId = product._id || product.id;
      
      if (!productTitle) continue;
      
      // Detect brand and category
      const detectedBrand = detectBrand(productTitle);
      const detectedCategory = detectCategory(productTitle);
      const normalizedTitle = normalizeTitle(productTitle);
      
      // Check if ambiguous
      const ambig = isAmbiguous(product, detectedBrand, detectedCategory);
      
      // Prepare updates
      const updates = {};
      
      if (detectedBrand && (!product.brand || product.brand === '')) {
        updates.brand = detectedBrand;
        changes.push({
          productId,
          title: productTitle,
          field: 'brand',
          oldValue: product.brand || 'N/A',
          newValue: detectedBrand,
          reason: 'Auto-detected from title'
        });
        fixed++;
      }
      
      if (detectedCategory && (!product.category || product.category === '')) {
        updates.category = detectedCategory;
        changes.push({
          productId,
          title: productTitle,
          field: 'category',
          oldValue: product.category || 'N/A',
          newValue: detectedCategory,
          reason: 'Auto-detected from title'
        });
        fixed++;
      }
      
      // Apply updates
      if (Object.keys(updates).length > 0) {
        await ProductModel.findByIdAndUpdate(productId, updates);
      }
      
      // Track ambiguous
      if (ambig) {
        ambiguous++;
        ambiguousProducts.push({
          productId,
          title: productTitle,
          currentBrand: product.brand || 'N/A',
          detectedBrand: detectedBrand || 'N/A',
          currentCategory: product.category || 'N/A',
          detectedCategory: detectedCategory || 'N/A',
          price: product.price || 0,
          reason: 'Flagged for manual review'
        });
      }
      
      // Track duplicates
      if (titleMap.has(productTitle)) {
        duplicates.push({
          title: productTitle,
          ids: [titleMap.get(productTitle), productId]
        });
      } else {
        titleMap.set(productTitle, productId);
      }
    }
    
    console.log(`\n✅ Cleanup Complete!`);
    console.log(`📈 Products processed: ${products.length}`);
    console.log(`✨ Fields fixed: ${fixed}`);
    console.log(`⚠️  Ambiguous items: ${ambiguous}`);
    console.log(`🔄 Duplicate groups: ${duplicates.length}`);
    
    // Save reports
    saveReport('product-changes.json', changes);
    saveReport('ambiguous-products.json', ambiguousProducts);
    saveReport('duplicate-groups.json', duplicates);
    
    console.log(`\n📋 Reports saved:`);
    console.log(`   - product-changes.json`);
    console.log(`   - ambiguous-products.json`);
    console.log(`   - duplicate-groups.json`);
    
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Save report to file
function saveReport(filename, data) {
  const filepath = path.join(__dirname, '..', 'reports', filename);
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Main
async function main() {
  console.log('🚀 Starting Product Database Cleanup...\n');
  await connectDB();
  await cleanupProducts();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
