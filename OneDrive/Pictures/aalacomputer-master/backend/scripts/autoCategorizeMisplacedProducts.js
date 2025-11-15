const mongoose = require('mongoose');
require('dotenv').config();

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  title: String,
  category: String,
  price: Number,
  brand: String,
  description: String,
  imageUrl: String,
  img: String,
  stock: Number
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Enhanced category detection with specific patterns
const CATEGORY_PATTERNS = {
  'Monitors': [
    'monitor', 'display', 'screen', 'lcd', 'led', 'oled', 'curved', 'gaming monitor',
    'ultrawide', '4k monitor', 'qhd', 'fhd', 'ips', 'va panel', 'tn panel',
    'viewsonic', 'asus monitor', 'msi monitor', 'samsung monitor', 'dell monitor',
    'aoc', 'benq', 'lg monitor', 'hp monitor', 'alienware monitor'
  ],
  
  'Audio Devices': [
    'speaker', 'headphone', 'headset', 'earphone', 'earbuds', 'microphone',
    'jbl', 'bose', 'sony audio', 'audio technica', 'sennheiser', 'beats',
    'logitech speaker', 'creative', 'harman kardon', 'marshall', 'skullcandy',
    'gaming headset', 'wireless headphone', 'bluetooth speaker', 'soundbar',
    'subwoofer', 'studio monitor', 'podcast mic', 'streaming mic'
  ],
  
  'Laptops': [
    'laptop', 'notebook', 'ultrabook', 'gaming laptop', 'business laptop',
    'macbook', 'thinkpad', 'inspiron', 'pavilion', 'aspire', 'vivobook',
    'zenbook', 'ideapad', 'legion', 'rog laptop', 'alienware laptop',
    'surface laptop', 'chromebook', 'convertible laptop', '2-in-1'
  ],
  
  'Graphics Cards': [
    'graphics card', 'gpu', 'video card', 'rtx', 'gtx', 'radeon', 'rx ',
    'geforce', 'nvidia', 'amd gpu', 'gaming gpu', 'mining gpu',
    'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 3080', 'rtx 3070', 'rtx 3060',
    'rx 7900', 'rx 7800', 'rx 6800', 'rx 6700', 'rx 6600'
  ],
  
  'Processors': [
    'processor', 'cpu', 'intel', 'amd', 'ryzen', 'core i3', 'core i5', 'core i7', 'core i9',
    'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'threadripper', 'xeon', 'pentium', 'celeron'
  ],
  
  'Motherboards': [
    'motherboard', 'mobo', 'mainboard', 'socket', 'chipset', 'atx', 'micro atx', 'mini itx',
    'b450', 'b550', 'x570', 'z690', 'z790', 'h610', 'h670', 'b660'
  ],
  
  'RAM': [
    'ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'sodimm', 'corsair ram', 'g.skill',
    'kingston ram', 'crucial ram', 'teamgroup', 'xpg ram', 'hyperx', 'vengeance'
  ],
  
  'Storage': [
    'ssd', 'hdd', 'hard drive', 'nvme', 'sata', 'm.2', 'storage', 'external drive',
    'samsung ssd', 'wd', 'seagate', 'crucial ssd', 'kingston ssd', 'sandisk'
  ],
  
  'Power Supply': [
    'power supply', 'psu', 'watt', 'modular psu', '80+ gold', '80+ bronze',
    'corsair psu', 'seasonic', 'evga psu', 'cooler master psu', 'thermaltake psu'
  ],
  
  'PC Cases': [
    'case', 'cabinet', 'tower', 'chassis', 'mid tower', 'full tower', 'mini itx case',
    'gaming case', 'rgb case', 'tempered glass', 'airflow case', 'silent case'
  ],
  
  'CPU Coolers': [
    'cooler', 'cpu cooler', 'air cooler', 'liquid cooler', 'aio', 'thermal paste',
    'noctua', 'cooler master cooler', 'corsair cooler', 'arctic cooler', 'be quiet'
  ],
  
  'Keyboards': [
    'keyboard', 'mechanical keyboard', 'gaming keyboard', 'wireless keyboard',
    'rgb keyboard', 'cherry mx', 'membrane keyboard', 'compact keyboard'
  ],
  
  'Mouse': [
    'mouse', 'gaming mouse', 'wireless mouse', 'optical mouse', 'laser mouse',
    'ergonomic mouse', 'vertical mouse', 'trackball', 'mouse pad', 'mousepad'
  ],
  
  'Webcams': [
    'webcam', 'camera', 'streaming camera', 'usb camera', 'hd camera', '4k camera',
    'logitech camera', 'conference camera', 'video call camera'
  ],
  
  'Cables & Accessories': [
    'cable', 'adapter', 'converter', 'hub', 'dock', 'extension', 'splitter',
    'usb cable', 'hdmi cable', 'displayport', 'ethernet cable', 'power cable',
    'charging cable', 'usb hub', 'card reader', 'stand', 'mount', 'bracket'
  ]
};

// Function to detect category based on product name
function detectCategory(productName) {
  if (!productName) return null;
  
  const name = productName.toLowerCase();
  
  // Check each category for matches
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (name.includes(pattern.toLowerCase())) {
        return category;
      }
    }
  }
  
  return null;
}

// Function to get confidence score for categorization
function getCategoryConfidence(productName, category) {
  if (!productName || !category) return 0;
  
  const name = productName.toLowerCase();
  const patterns = CATEGORY_PATTERNS[category] || [];
  
  let matches = 0;
  let totalScore = 0;
  
  for (const pattern of patterns) {
    if (name.includes(pattern.toLowerCase())) {
      matches++;
      // Longer, more specific patterns get higher scores
      totalScore += pattern.length;
    }
  }
  
  return matches > 0 ? (totalScore / patterns.length) * matches : 0;
}

async function autoCategorizeMisplacedProducts() {
  try {
    console.log('🚀 Starting auto-categorization of misplaced products...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer');
    console.log('✅ Connected to MongoDB\n');
    
    // Find all products in Peripherals category
    const peripheralProducts = await Product.find({ 
      category: { $in: ['Peripherals', 'peripherals', 'Peripheral'] }
    });
    
    console.log(`📦 Found ${peripheralProducts.length} products in Peripherals category\n`);
    
    if (peripheralProducts.length === 0) {
      console.log('✅ No products found in Peripherals category to recategorize');
      return;
    }
    
    const updates = [];
    const categoryCounts = {};
    
    // Analyze each product
    for (const product of peripheralProducts) {
      const productName = product.name || product.title || '';
      const detectedCategory = detectCategory(productName);
      
      if (detectedCategory && detectedCategory !== 'Peripherals') {
        const confidence = getCategoryConfidence(productName, detectedCategory);
        
        updates.push({
          product,
          oldCategory: product.category,
          newCategory: detectedCategory,
          confidence: confidence.toFixed(2),
          reason: `Detected from name: "${productName}"`
        });
        
        categoryCounts[detectedCategory] = (categoryCounts[detectedCategory] || 0) + 1;
      }
    }
    
    console.log('📊 CATEGORIZATION ANALYSIS:');
    console.log('=' .repeat(50));
    
    if (updates.length === 0) {
      console.log('✅ All products in Peripherals seem to be correctly categorized');
      return;
    }
    
    // Show summary
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total products to recategorize: ${updates.length}`);
    console.log(`\nNew category distribution:`);
    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`  • ${category}: ${count} products`);
    }
    
    console.log('\n📋 DETAILED CHANGES:');
    console.log('-'.repeat(80));
    
    // Show detailed changes
    updates.forEach((update, index) => {
      console.log(`${index + 1}. ${update.product.name || update.product.title || 'Unnamed'}`);
      console.log(`   ${update.oldCategory} → ${update.newCategory} (confidence: ${update.confidence})`);
      console.log(`   Reason: ${update.reason}`);
      console.log('');
    });
    
    // Ask for confirmation (in production, you might want to add a --confirm flag)
    console.log('🔄 APPLYING CHANGES...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Apply updates
    for (const update of updates) {
      try {
        await Product.findByIdAndUpdate(
          update.product._id,
          { category: update.newCategory },
          { new: true }
        );
        
        console.log(`✅ Updated: ${update.product.name || 'Unnamed'} → ${update.newCategory}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${update.product.name || 'Unnamed'} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 AUTO-CATEGORIZATION COMPLETE!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully updated: ${successCount} products`);
    console.log(`❌ Failed updates: ${errorCount} products`);
    console.log(`📊 Total processed: ${updates.length} products`);
    
    if (successCount > 0) {
      console.log('\n📈 Updated categories:');
      for (const [category, count] of Object.entries(categoryCounts)) {
        console.log(`  • ${category}: ${count} products`);
      }
    }
    
    console.log('\n💡 Recommendations:');
    console.log('  • Review the updated categories in your admin dashboard');
    console.log('  • Check if any products need manual adjustment');
    console.log('  • Consider running this script periodically for new products');
    
  } catch (error) {
    console.error('❌ Error during auto-categorization:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  autoCategorizeMisplacedProducts()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { autoCategorizeMisplacedProducts, detectCategory, getCategoryConfidence };
