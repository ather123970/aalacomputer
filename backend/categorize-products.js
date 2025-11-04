const mongoose = require('mongoose');
const Product = require('./models/Product.js');
require('dotenv').config();

// Category detection patterns (case-insensitive)
const categoryPatterns = {
  'GPU': ['gpu', 'graphics card', 'rtx', 'gtx', 'radeon', 'geforce', 'nvidia', 'amd rx', 'vga'],
  'CPU': ['cpu', 'processor', 'ryzen', 'intel core', 'i3', 'i5', 'i7', 'i9'],
  'RAM': ['ram', 'memory', 'ddr4', 'ddr5', 'dimm'],
  'Storage': ['ssd', 'hdd', 'nvme', 'hard drive', 'storage', 'solid state'],
  'Motherboard': ['motherboard', 'mobo', 'mainboard'],
  'PSU': ['psu', 'power supply', 'watts', 'watt'],
  'Case': ['case', 'cabinet', 'chassis', 'tower'],
  'Monitor': ['monitor', 'display', 'screen', 'lcd', 'led'],
  'Keyboard': ['keyboard'],
  'Mouse': ['mouse', 'mice'],
  'Headset': ['headset', 'headphone', 'earphone', 'gaming audio'],
  'Cooling': ['cooler', 'cooling', 'fan', 'liquid cooling', 'aio', 'argb fan', 'case fan'],
  'Laptops': ['laptop', 'notebook'],
  'PC': ['gaming pc', 'desktop pc', 'pre-build', 'prebuilt'],
  'Motherboard Accessories': ['wifi adapter', 'bluetooth adapter', 'network card', 'sound card'],
  'Laptop Accessories': ['laptop charger', 'laptop adapter', 'laptop battery', 'laptop cooling pad']
};

// Brand detection patterns
const brandPatterns = {
  'NVIDIA': ['nvidia', 'geforce'],
  'AMD': ['amd', 'radeon', 'ryzen'],
  'Intel': ['intel'],
  'ASUS': ['asus', 'tuf', 'rog'],
  'MSI': ['msi'],
  'Gigabyte': ['gigabyte'],
  'ASRock': ['asrock'],
  'Corsair': ['corsair'],
  'Kingston': ['kingston'],
  'Samsung': ['samsung'],
  'WD': ['western digital', 'wd '],
  'Seagate': ['seagate'],
  'Cooler Master': ['cooler master'],
  'Thermaltake': ['thermaltake'],
  'NZXT': ['nzxt'],
  'Logitech': ['logitech'],
  'Razer': ['razer'],
  'Redragon': ['redragon'],
  'HyperX': ['hyperx'],
  'Dell': ['dell'],
  'Acer': ['acer'],
  'LG': ['lg '],
  'ViewSonic': ['viewsonic'],
  'ZOTAC': ['zotac'],
  'PNY': ['pny'],
  'G.Skill': ['g.skill', 'gskill'],
  'ADATA': ['adata'],
  'Crucial': ['crucial'],
  'DeepCool': ['deepcool'],
  'Lian Li': ['lian li'],
  'Cougar': ['cougar'],
  'Bloody': ['bloody'],
  'A4Tech': ['a4tech'],
  'Fantech': ['fantech']
};

function detectCategory(productName) {
  const nameLower = productName.toLowerCase();
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (nameLower.includes(pattern)) {
        return category;
      }
    }
  }
  
  return ''; // Unknown category
}

function detectBrand(productName) {
  const nameLower = productName.toLowerCase();
  
  for (const [brand, patterns] of Object.entries(brandPatterns)) {
    for (const pattern of patterns) {
      if (nameLower.includes(pattern)) {
        return brand;
      }
    }
  }
  
  return ''; // Unknown brand
}

async function categorizeProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!\n');

    // Process products in batches to avoid memory issues
    const batchSize = 100;
    let totalUpdated = 0;
    let skip = 0;
    
    console.log('Starting batch processing...\n');

    while (true) {
      const products = await Product.find({}).skip(skip).limit(batchSize);
      
      if (products.length === 0) {
        break; // No more products
      }
      
      console.log(`Processing batch ${Math.floor(skip/batchSize) + 1} (${products.length} products)...`);
      
      let batchUpdated = 0;
      
      for (const product of products) {
        const detectedCategory = detectCategory(product.Name || '');
        const detectedBrand = detectBrand(product.Name || '');
        
        // Only update if category or brand changed
        if (product.category !== detectedCategory || product.brand !== detectedBrand) {
          product.category = detectedCategory;
          product.brand = detectedBrand;
          await product.save();
          batchUpdated++;
          totalUpdated++;
          
          if (batchUpdated <= 5) { // Only show first 5 updates per batch
            console.log(`  Updated: ${product.Name}`);
            console.log(`    Category: "${detectedCategory}"`);
            console.log(`    Brand: "${detectedBrand}"`);
          }
        }
      }
      
      if (batchUpdated > 5) {
        console.log(`  ... and ${batchUpdated - 5} more products updated`);
      }
      
      console.log(`  Batch complete: ${batchUpdated} products updated\n`);
      skip += batchSize;
    }

    console.log('\n=== CATEGORIZATION COMPLETE ===');
    console.log(`Total products updated: ${totalUpdated}`);
    
    // Show category distribution
    console.log('\n=== CATEGORY DISTRIBUTION ===');
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    categoryStats.forEach(stat => {
      console.log(`${stat._id || '(uncategorized)'}: ${stat.count} products`);
    });
    
    // Show brand distribution
    console.log('\n=== BRAND DISTRIBUTION ===');
    const brandStats = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: '' } } }, // Exclude empty brands
      { $sort: { count: -1 } }
    ]);
    
    brandStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} products`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Categorization failed:', error);
    process.exit(1);
  }
}

categorizeProducts();