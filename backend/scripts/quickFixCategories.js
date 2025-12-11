/**
 * QUICK FIX: Immediately correct obvious miscategorizations
 * Targets specific wrong products visible in screenshots
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

// Define lightweight Product model
const ProductSchema = new mongoose.Schema({
  name: String,
  Name: String,
  title: String,
  category: String,
  categorySlug: String,
  brand: String,
  is_active: Boolean
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

// Quick fix rules - VERY specific patterns
const QUICK_FIXES = [
  // RAM in Processors category
  {
    wrongCategory: /processor/i,
    detectKeywords: ['ram', 'ddr4', 'ddr5', 'memory', 'dimm', 'gb ram', 'sodimm'],
    correctCategory: 'RAM',
    correctSlug: 'ram'
  },
  
  // SSDs in Processors category
  {
    wrongCategory: /processor/i,
    detectKeywords: ['ssd', 'nvme', 'm.2', 'hard drive', 'hdd', 'storage', '1tb', '512gb', '256gb'],
    correctCategory: 'Storage',
    correctSlug: 'storage'
  },
  
  // PC Cases in Processors category
  {
    wrongCategory: /processor/i,
    detectKeywords: ['case', 'tower', 'cabinet', 'atx', 'mid tower', 'full tower', 'pc case', 'gaming case'],
    correctCategory: 'Cases',
    correctSlug: 'cases'
  },
  
  // Cooling/Fans in Processors category
  {
    wrongCategory: /processor/i,
    detectKeywords: ['fan', 'cooler', 'rgb fan', 'cooling', 'radiator', 'aio', 'liquid cooler', 'cpu cooler'],
    correctCategory: 'Cooling',
    correctSlug: 'cooling'
  },
  
  // Monitors in Laptops category
  {
    wrongCategory: /laptop/i,
    detectKeywords: ['monitor', 'display', 'inch display', '"', 'hz', 'gaming monitor', 'curved'],
    excludeKeywords: ['laptop', 'notebook'],
    correctCategory: 'Monitors',
    correctSlug: 'monitors'
  },
  
  // Mouse in Laptops category
  {
    wrongCategory: /laptop/i,
    detectKeywords: ['mouse', 'gaming mouse', 'wireless mouse', 'optical mouse', 'dpi'],
    excludeKeywords: ['laptop', 'notebook', 'mousepad'],
    correctCategory: 'Mouse',
    correctSlug: 'mouse'
  },
  
  // Keyboards in Laptops category
  {
    wrongCategory: /laptop/i,
    detectKeywords: ['keyboard', 'mechanical keyboard', 'gaming keyboard', 'wireless keyboard'],
    excludeKeywords: ['laptop', 'notebook'],
    correctCategory: 'Keyboards',
    correctSlug: 'keyboards'
  }
];

async function quickFix() {
  try {
    console.log('\n🚀 QUICK CATEGORY FIX\n');
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');
    
    let totalFixed = 0;
    
    for (const rule of QUICK_FIXES) {
      console.log(`\n🔍 Checking: ${rule.wrongCategory} → ${rule.correctCategory}`);
      
      // Find products in wrong category matching keywords
      const products = await Product.find({
        category: rule.wrongCategory,
        is_active: { $ne: false }
      }).lean();
      
      let fixedCount = 0;
      
      for (const product of products) {
        const productName = (product.name || product.Name || product.title || '').toLowerCase();
        
        // Check if product name contains any detect keywords
        const hasKeyword = rule.detectKeywords.some(kw => productName.includes(kw.toLowerCase()));
        
        // Check if product name contains exclude keywords (if any)
        const hasExclude = rule.excludeKeywords ? 
          rule.excludeKeywords.some(kw => productName.includes(kw.toLowerCase())) : false;
        
        if (hasKeyword && !hasExclude) {
          // Fix this product
          await Product.updateOne(
            { _id: product._id },
            {
              $set: {
                category: rule.correctCategory,
                categorySlug: rule.correctSlug
              }
            }
          );
          
          console.log(`  ✅ Fixed: "${productName.substring(0, 60)}..." → ${rule.correctCategory}`);
          fixedCount++;
          totalFixed++;
        }
      }
      
      console.log(`  📊 Fixed ${fixedCount} products in this category`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`🎉 TOTAL FIXED: ${totalFixed} products`);
    console.log('='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    console.log('✅ Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickFix();
