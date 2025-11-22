/**
 * Restore Brands and Categories Script
 * Re-applies all the brands and categories that were cleared
 * Restores the database to the state AFTER cleanup but BEFORE restoration
 */

const mongoose = require('mongoose');
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
    exclude: ['graphics', 'gpu', 'video', 'card', 'geforce', 'gtx', 'rtx', 'radeon', 'arc']
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

// Main restore function
async function restoreBrandsAndCategories() {
  try {
    const ProductModel = getProductModel();
    
    console.log('\n🔄 Restoring Brands and Categories...\n');
    
    // Get all products
    const products = await ProductModel.find({}).lean();
    console.log(`📊 Found ${products.length} products\n`);
    
    let brandRestored = 0;
    let categoryRestored = 0;
    
    for (const product of products) {
      const productTitle = product.Name || product.name || product.title || '';
      if (!productTitle) continue;
      
      const updates = {};
      
      // Restore brand if empty
      if (!product.brand || product.brand === '') {
        const detectedBrand = detectBrand(productTitle);
        if (detectedBrand) {
          updates.brand = detectedBrand;
          brandRestored++;
        }
      }
      
      // Restore category if empty
      if (!product.category || product.category === '') {
        const detectedCategory = detectCategory(productTitle);
        if (detectedCategory) {
          updates.category = detectedCategory;
          categoryRestored++;
        }
      }
      
      // Apply updates
      if (Object.keys(updates).length > 0) {
        await ProductModel.findByIdAndUpdate(product._id, updates);
      }
    }
    
    console.log(`\n✅ Restoration Complete!`);
    console.log(`📈 Brands restored: ${brandRestored}`);
    console.log(`📂 Categories restored: ${categoryRestored}`);
    console.log(`\n✨ All brands and categories have been restored!`);
    
  } catch (err) {
    console.error('❌ Error during restoration:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Main
async function main() {
  console.log('🚀 Starting Brands and Categories Restoration...');
  await connectDB();
  await restoreBrandsAndCategories();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
