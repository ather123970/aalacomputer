/**
 * FIX RAM CATEGORY
 * Removes non-RAM products from RAM category and recategorizes them correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

// Map of keywords to correct categories
const categoryPatterns = [
  {
    keywords: ['gaming chair', 'chair', 'ergonomic', 'anda seat'],
    category: 'Gaming Chairs',
    priority: 10
  },
  {
    keywords: ['fan', 'argb fan', 'rgb fan', 'cooling fan', 'gamemax'],
    category: 'CPU Coolers',
    priority: 9
  },
  {
    keywords: ['thermal paste', 'thermal grease', 'thermal compound', 'heat sink compound'],
    category: 'CPU Coolers',
    priority: 10
  },
  {
    keywords: ['webcam', 'camera', 'brio', '1080p'],
    category: 'Peripherals',
    priority: 9
  },
  {
    keywords: ['motherboard', 'mobo', 'b650', 'b860', 'z690', 'z790', 'lga 1700', 'lga 1851', 'am5'],
    category: 'Motherboards',
    priority: 10
  },
  {
    keywords: ['card reader', 'usb-c', 'ugreen', 'adapter'],
    category: 'Cables & Accessories',
    priority: 8
  },
  {
    keywords: ['nas', 'network storage', 'asustor', 'drivestor'],
    category: 'Storage',
    priority: 9
  },
  {
    keywords: ['pillow', 'lumbar', 'head pillow', 'neck pillow'],
    category: 'Gaming Chairs',
    priority: 10
  },
  {
    keywords: ['secure frame kit', 'am5 kit'],
    category: 'CPU Coolers',
    priority: 9
  }
];

async function fixRAMCategory() {
  console.log('🔧 Starting RAM category cleanup...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products in RAM category
    const ramProducts = await Product.find({
      category: { $regex: /^ram$/i }
    });

    console.log(`📊 Found ${ramProducts.length} products in RAM category\n`);

    let miscategorized = [];
    let correctlyPlaced = [];

    // Check each product
    ramProducts.forEach(product => {
      const productName = (product.Name || product.name || product.title || '').toLowerCase();
      
      // Check if it's actually RAM
      const isActualRAM = 
        productName.includes('ram') ||
        productName.includes('memory') ||
        productName.includes('ddr3') ||
        productName.includes('ddr4') ||
        productName.includes('ddr5') ||
        productName.includes('sodimm') ||
        productName.includes('dimm');

      // Check if it's clearly not RAM
      const isNotRAM = 
        productName.includes('chair') ||
        productName.includes('fan') ||
        productName.includes('thermal') ||
        productName.includes('paste') ||
        productName.includes('webcam') ||
        productName.includes('motherboard') ||
        productName.includes('mobo') ||
        productName.includes('card reader') ||
        productName.includes('nas') ||
        productName.includes('pillow') ||
        productName.includes('frame kit');

      if (isNotRAM || (!isActualRAM && productName.length > 0)) {
        // Find correct category
        let bestMatch = null;
        let highestPriority = 0;

        categoryPatterns.forEach(pattern => {
          const matches = pattern.keywords.some(keyword => 
            productName.includes(keyword.toLowerCase())
          );
          
          if (matches && pattern.priority > highestPriority) {
            bestMatch = pattern.category;
            highestPriority = pattern.priority;
          }
        });

        if (bestMatch) {
          miscategorized.push({
            product,
            newCategory: bestMatch
          });
        } else {
          miscategorized.push({
            product,
            newCategory: 'Uncategorized'
          });
        }
      } else {
        correctlyPlaced.push(product);
      }
    });

    console.log(`✅ Correctly categorized RAM: ${correctlyPlaced.length} products`);
    console.log(`⚠️  Miscategorized products: ${miscategorized.length} products\n`);

    if (miscategorized.length > 0) {
      console.log('📋 Products to be recategorized:\n');
      
      // Group by new category
      const grouped = {};
      miscategorized.forEach(item => {
        if (!grouped[item.newCategory]) {
          grouped[item.newCategory] = [];
        }
        grouped[item.newCategory].push(item.product);
      });

      Object.entries(grouped).forEach(([category, products]) => {
        console.log(`\n${category} (${products.length} products):`);
        products.forEach((p, i) => {
          const name = p.Name || p.name || p.title || 'Unnamed';
          const brand = p.brand || 'Unknown';
          console.log(`  ${i + 1}. ${name} (${brand})`);
        });
      });

      console.log('\n\n🔄 Updating categories...\n');

      // Update each miscategorized product
      let updateCount = 0;
      for (const item of miscategorized) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $set: { category: item.newCategory } }
        );
        updateCount++;
      }

      console.log(`✅ Successfully updated ${updateCount} products\n`);
    } else {
      console.log('✅ No miscategorized products found!\n');
    }

    // Final verification
    const finalRAMCount = await Product.countDocuments({
      category: { $regex: /^ram$/i },
      $or: [
        { name: { $regex: /ram|memory|ddr[345]|dimm/i } },
        { Name: { $regex: /ram|memory|ddr[345]|dimm/i } },
        { title: { $regex: /ram|memory|ddr[345]|dimm/i } }
      ]
    });

    console.log(`📊 Final RAM category count: ${finalRAMCount} products\n`);
    console.log('🎉 RAM category cleanup completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run the script
fixRAMCategory().catch(console.error);
