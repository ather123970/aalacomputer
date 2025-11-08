/**
 * COMPREHENSIVE LAPTOPS CLEANUP
 * Removes ALL non-laptop products from Laptops category
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

const RECLASSIFICATION_RULES = [
  // RAM - Even if it says "Laptop RAM"
  {
    keywords: ['ddr4', 'ddr5', 'ddr3', 'sodimm', 'memory module', 'ram', ' gb ddr', 'dimm'],
    newCategory: 'RAM',
    newSlug: 'ram',
    mustNotContain: []
  },
  
  // Storage - SSDs, HDDs
  {
    keywords: ['ssd', 'nvme', 'm.2', 'hard drive', 'hdd', 'internal ssd', 'solid state'],
    newCategory: 'Storage',
    newSlug: 'storage',
    mustNotContain: []
  },
  
  // Laptop Accessories - Bags, Sleeves, Stands
  {
    keywords: ['laptop bag', 'laptop sleeve', 'laptop stand', 'laptop case', 'laptop holder', 'laptop backpack', 'minimalist laptop', 'commuter bag', 'cozy classic'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  },
  
  // Cooling Pads
  {
    keywords: ['cooling pad', 'cooling stand', 'laptop cooler', 'laptop cooling'],
    newCategory: 'Cooling',
    newSlug: 'cooling',
    mustNotContain: []
  },
  
  // Projectors
  {
    keywords: ['projector', 'dlp projector', 'zenbeam'],
    newCategory: 'Projectors',
    newSlug: 'projectors',
    mustNotContain: []
  },
  
  // Graphics Cards
  {
    keywords: ['graphic card', 'graphics card', 'vga', 'geforce', 'radeon', 'rx550', 'gtx', 'rtx'],
    newCategory: 'Graphics Cards',
    newSlug: 'graphics-cards',
    mustNotContain: ['laptop']
  },
  
  // Fans / Cooling
  {
    keywords: ['argb pwm fan', 'case fan', 'rgb fan', 'cooling fan'],
    newCategory: 'Cooling',
    newSlug: 'cooling',
    mustNotContain: []
  },
  
  // All-in-One PCs
  {
    keywords: ['all-in-one', 'thinkcentre neo'],
    newCategory: 'Prebuilt PC',
    newSlug: 'prebuilt-pc',
    mustNotContain: []
  },
  
  // Keyboards
  {
    keywords: ['keyboard', 'mechanical keyboard', 'keycap', 'blackwidow'],
    newCategory: 'Keyboards',
    newSlug: 'keyboards',
    mustNotContain: ['laptop']
  },
  
  // USB Hubs and Adapters
  {
    keywords: ['usb hub', 'usb-c hub', 'multiport', 'adapter', 'wifi adapter', 'dongle'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  },
  
  // Thermal Paste
  {
    keywords: ['thermal grease', 'thermal paste', 'heat sink compound'],
    newCategory: 'Cooling',
    newSlug: 'cooling',
    mustNotContain: []
  },
  
  // Mouse
  {
    keywords: ['wireless mouse', 'optical tracking', '2.4g wireless mouse'],
    newCategory: 'Mouse',
    newSlug: 'mouse',
    mustNotContain: []
  },
  
  // Apple Accessories
  {
    keywords: ['airtag', 'apple pencil', 'magic trackpad'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  },
  
  // DVD/Blu-ray Drives
  {
    keywords: ['dvd burner', 'blu-ray burner', 'external dvd', 'portable usb', 'zendrive'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  },
  
  // Laptop Batteries
  {
    keywords: ['battery', 'cell battery', 'hs04'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  },
  
  // MacBook Cases/Covers
  {
    keywords: ['macbook case', 'shield case', 'ishield', 'haya case', 'ikavlar'],
    newCategory: 'Accessories',
    newSlug: 'accessories',
    mustNotContain: []
  }
];

async function cleanLaptops() {
  console.log('\n🧹 COMPREHENSIVE LAPTOPS CATEGORY CLEANUP\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');
  
  const laptopProducts = await Product.find({ 
    category: /laptop/i 
  }).lean();
  
  console.log(`Found ${laptopProducts.length} products in Laptops category\n`);
  console.log('Scanning for non-laptop products...\n');
  
  let totalFixed = 0;
  const fixedByCategory = {};
  
  for (const product of laptopProducts) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    let fixed = false;
    
    // Check each rule
    for (const rule of RECLASSIFICATION_RULES) {
      // Check if name contains any of the keywords
      const hasKeyword = rule.keywords.some(kw => name.includes(kw.toLowerCase()));
      
      // Check if name contains excluded keywords
      const hasMustNotContain = rule.mustNotContain.length > 0 ?
        rule.mustNotContain.some(kw => name.includes(kw.toLowerCase())) : false;
      
      if (hasKeyword && !hasMustNotContain) {
        // This is NOT a laptop, move it
        await Product.updateOne(
          { _id: product._id },
          { $set: { category: rule.newCategory, categorySlug: rule.newSlug } }
        );
        
        console.log(`✅ "${name.substring(0, 60)}..." → ${rule.newCategory}`);
        
        if (!fixedByCategory[rule.newCategory]) {
          fixedByCategory[rule.newCategory] = 0;
        }
        fixedByCategory[rule.newCategory]++;
        totalFixed++;
        fixed = true;
        break; // Only apply first matching rule
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SUMMARY: Fixed ${totalFixed} products\n`);
  
  console.log('Breakdown by category:');
  for (const [category, count] of Object.entries(fixedByCategory)) {
    console.log(`  ✅ ${category}: ${count} products`);
  }
  
  // Count remaining laptops
  const remainingLaptops = await Product.countDocuments({ category: /laptop/i });
  console.log(`\n📱 Remaining in Laptops category: ${remainingLaptops} products`);
  
  console.log('='.repeat(70) + '\n');
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

cleanLaptops();
