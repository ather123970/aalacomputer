const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Manual price estimates based on Pakistan market research (PKR)
const priceDatabase = {
  // High-End Graphics Cards
  'rtx 5090': 850000,
  'rtx 5080': 500000,
  'rtx 5070': 350000,
  'rtx 5060': 200000,
  'rtx 4090': 650000,
  'rtx 4080': 450000,
  'rtx 4070': 320000,
  'rtx 4060': 180000,
  
  // Gaming Laptops (High-End)
  'hp omen': 350000,
  'hp victus': 280000,
  'lenovo legion pro 7': 550000,
  'lenovo legion': 400000,
  'lenovo loq': 250000,
  'dell alienware m16': 500000,
  'dell xps': 400000,
  'asus rog': 380000,
  
  // Business Laptops
  'hp elitebook': 200000,
  'hp probook': 180000,
  'hp spectre': 350000,
  'lenovo thinkpad': 220000,
  'lenovo yoga': 320000,
  'dell inspiron': 250000,
  
  // Budget Laptops
  'hp 15s': 130000,
  'hp 15-fd': 150000,
  'hp pavilion 15': 140000,
  'lenovo ideapad': 110000,
  
  // Monitors
  'samsung odyssey g9': 450000,
  'samsung odyssey g6': 85000,
  'samsung odyssey g5': 65000,
  'samsung viewfinity': 95000,
  'dell alienware': 120000,
  'asus rog monitor': 180000,
  'lg ultrawide': 95000,
  
  // Keyboards
  'skyloong gk87': 26500,
  'aula f87': 18500,
  'aula f75': 16500,
  'mechanical keyboard': 15000,
  
  // Motherboards
  'gigabyte b650m': 55000,
  'asus prime z790': 73500,
  
  // Networking
  'tp-link archer t2u': 5500,
  'tp-link archer ax': 35000,
  'tp-link archer c': 12000,
  'tp-link eap': 28000,
  'tp-link er605': 16000,
  'tp-link er7212': 45000,
  'tp-link er8411': 120000,
  'tp-link ue300c': 4500,
  'tp-link mc220l': 6000,
  
  // Peripherals
  'logitech m325': 5500,
  'logitech m330': 6500,
  'logitech mouse': 4500,
  'jbl live pro': 22000,
  'jbl headset': 18000,
  
  // Graphics Cards (General)
  'zotac rtx': 200000,
  'gigabyte windforce': 450000,
  'graphics card': 150000
};

// Estimate price based on product name
function estimatePrice(productName, category, brand) {
  const nameLower = productName.toLowerCase();
  
  // Try to match against price database
  for (const [keyword, price] of Object.entries(priceDatabase)) {
    if (nameLower.includes(keyword)) {
      return price;
    }
  }
  
  // Category-based fallback estimates
  const categoryPrices = {
    'laptops': 180000,
    'monitors': 45000,
    'graphics cards': 250000,
    'keyboards': 12000,
    'mouse': 4000,
    'headsets': 12000,
    'motherboards': 45000,
    'processors': 55000,
    'storage': 18000,
    'networking': 12000,
    'cooling': 15000,
    'cases': 18000
  };
  
  const categoryLower = (category || '').toLowerCase();
  for (const [cat, price] of Object.entries(categoryPrices)) {
    if (categoryLower.includes(cat)) {
      return price;
    }
  }
  
  // Default fallback
  return 25000;
}

async function autoUpdatePrices() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
  });

  try {
    console.log('🚀 Starting Automated Price Update with Market Research');
    console.log('='.repeat(80) + '\n');
    
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db('aalacomputer');
    const productsCollection = db.collection('products');

    // Fetch products without prices
    console.log('🔍 Fetching products without prices...');
    const productsNeedingPrices = await productsCollection
      .find({
        $or: [
          { price: 0 },
          { price: null },
          { price: { $exists: false } }
        ]
      })
      .project({ _id: 1, Name: 1, name: 1, title: 1, category: 1, brand: 1 })
      .toArray();

    console.log(`Found ${productsNeedingPrices.length} products without prices\n`);
    console.log('🔄 Estimating and updating prices...\n');
    console.log('='.repeat(80));

    let updatedCount = 0;
    const updateLog = [];

    for (const product of productsNeedingPrices) {
      const productName = product.Name || product.name || product.title || 'Unknown';
      const category = product.category || '';
      const brand = product.brand || '';
      
      // Estimate price
      const estimatedPrice = estimatePrice(productName, category, brand);
      
      try {
        // Update in database
        await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              price: estimatedPrice,
              updatedAt: new Date()
            }
          }
        );

        updatedCount++;
        const logEntry = `✅ "${productName}" → PKR ${estimatedPrice.toLocaleString()} (${category})`;
        console.log(logEntry);
        updateLog.push(logEntry);
        
      } catch (error) {
        const errorEntry = `❌ Error: "${productName}" - ${error.message}`;
        console.error(errorEntry);
        updateLog.push(errorEntry);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`📝 Total processed: ${productsNeedingPrices.length} products`);
    console.log('='.repeat(80) + '\n');

    // Save log
    const logPath = path.join(__dirname, 'auto-price-update-log.txt');
    fs.writeFileSync(logPath, updateLog.join('\n'), 'utf-8');
    console.log(`📄 Detailed log saved to: ${logPath}\n`);

    console.log('✅ Automated price update completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Database connection closed');
  }
}

autoUpdatePrices();
