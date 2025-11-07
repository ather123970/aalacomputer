/**
 * Automated Test Products Generator
 * Adds sample products for all Pakistan market categories
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Test products for all categories
const TEST_PRODUCTS = [
  // Processors
  { name: 'Intel Core i9-14900K Processor', category: 'Processors', brand: 'Intel', price: 125000, imageUrl: '/images/intel-i9-14900k.jpg', description: '24-Core Desktop Processor', WARRANTY: '3 Years' },
  { name: 'AMD Ryzen 9 7950X Processor', category: 'Processors', brand: 'AMD', price: 115000, imageUrl: '/images/amd-ryzen-9-7950x.jpg', description: '16-Core Desktop Processor', WARRANTY: '3 Years' },
  { name: 'Intel Core i7-13700K', category: 'Processors', brand: 'Intel', price: 85000, imageUrl: '/images/intel-i7-13700k.jpg', description: '16-Core Gaming Processor', WARRANTY: '3 Years' },
  
  // Motherboards
  { name: 'ASUS ROG Strix B650-A Gaming WiFi', category: 'Motherboards', brand: 'ASUS', price: 55000, imageUrl: '/images/asus-rog-b650.jpg', description: 'AMD AM5 ATX Gaming Motherboard', WARRANTY: '3 Years' },
  { name: 'MSI MPG Z790 Edge WiFi', category: 'Motherboards', brand: 'MSI', price: 65000, imageUrl: '/images/msi-z790.jpg', description: 'Intel LGA1700 ATX Motherboard', WARRANTY: '3 Years' },
  { name: 'Gigabyte B760 AORUS Elite', category: 'Motherboards', brand: 'Gigabyte', price: 45000, imageUrl: '/images/gigabyte-b760.jpg', description: 'Intel B760 Chipset', WARRANTY: '3 Years' },
  
  // Graphics Cards
  { name: 'MSI GeForce RTX 4070 Gaming X Trio', category: 'Graphics Cards', brand: 'MSI', price: 180000, imageUrl: '/images/msi-rtx-4070.jpg', description: '12GB GDDR6X Graphics Card', WARRANTY: '3 Years' },
  { name: 'ASUS TUF RTX 4080 OC Edition', category: 'Graphics Cards', brand: 'ASUS', price: 280000, imageUrl: '/images/asus-rtx-4080.jpg', description: '16GB GDDR6X Graphics Card', WARRANTY: '3 Years' },
  { name: 'Gigabyte RTX 4060 Ti Gaming OC', category: 'Graphics Cards', brand: 'Gigabyte', price: 120000, imageUrl: '/images/gigabyte-rtx-4060ti.jpg', description: '8GB GDDR6 Graphics Card', WARRANTY: '3 Years' },
  { name: 'Zotac RTX 4070 Ti Trinity', category: 'Graphics Cards', brand: 'Zotac', price: 220000, imageUrl: '/images/zotac-rtx-4070ti.jpg', description: '12GB GDDR6X Graphics Card', WARRANTY: '3 Years' },
  
  // RAM
  { name: 'Corsair Vengeance RGB 32GB DDR5 6000MHz', category: 'RAM', brand: 'Corsair', price: 35000, imageUrl: '/images/corsair-vengeance-ddr5.jpg', description: '2x16GB DDR5 RAM Kit', WARRANTY: 'Lifetime' },
  { name: 'G.Skill Trident Z5 RGB 32GB DDR5', category: 'RAM', brand: 'G.Skill', price: 38000, imageUrl: '/images/gskill-trident-z5.jpg', description: '2x16GB DDR5 6400MHz', WARRANTY: 'Lifetime' },
  { name: 'Kingston Fury Beast 16GB DDR4 3200MHz', category: 'RAM', brand: 'Kingston', price: 15000, imageUrl: '/images/kingston-fury-ddr4.jpg', description: '2x8GB DDR4 RAM Kit', WARRANTY: 'Lifetime' },
  { name: 'XPG Lancer RGB 32GB DDR5', category: 'RAM', brand: 'XPG', price: 32000, imageUrl: '/images/xpg-lancer-ddr5.jpg', description: '2x16GB DDR5 5200MHz', WARRANTY: 'Lifetime' },
  
  // Storage
  { name: 'Samsung 980 PRO 1TB NVMe SSD', category: 'Storage', brand: 'Samsung', price: 28000, imageUrl: '/images/samsung-980-pro.jpg', description: 'Gen4 NVMe M.2 SSD', WARRANTY: '5 Years' },
  { name: 'WD Black SN850X 2TB NVMe', category: 'Storage', brand: 'WD', price: 45000, imageUrl: '/images/wd-black-sn850x.jpg', description: 'Gen4 NVMe Gaming SSD', WARRANTY: '5 Years' },
  { name: 'Kingston NV2 500GB NVMe SSD', category: 'Storage', brand: 'Kingston', price: 12000, imageUrl: '/images/kingston-nv2.jpg', description: 'Gen4 NVMe M.2 SSD', WARRANTY: '3 Years' },
  { name: 'Seagate Barracuda 2TB HDD', category: 'Storage', brand: 'Seagate', price: 15000, imageUrl: '/images/seagate-barracuda.jpg', description: '7200RPM 3.5" HDD', WARRANTY: '2 Years' },
  
  // Power Supply
  { name: 'Corsair RM850x 850W 80+ Gold', category: 'Power Supply', brand: 'Corsair', price: 35000, imageUrl: '/images/corsair-rm850x.jpg', description: 'Fully Modular PSU', WARRANTY: '10 Years' },
  { name: 'Cooler Master MWE 750W 80+ Bronze', category: 'Power Supply', brand: 'Cooler Master', price: 22000, imageUrl: '/images/cm-mwe-750.jpg', description: 'Semi-Modular PSU', WARRANTY: '5 Years' },
  { name: 'Thermaltake Toughpower GF1 750W', category: 'Power Supply', brand: 'Thermaltake', price: 28000, imageUrl: '/images/thermaltake-gf1.jpg', description: '80+ Gold Fully Modular', WARRANTY: '7 Years' },
  
  // CPU Coolers
  { name: 'Cooler Master Hyper 212 RGB', category: 'CPU Coolers', brand: 'Cooler Master', price: 8500, imageUrl: '/images/cm-hyper-212.jpg', description: 'Tower CPU Air Cooler', WARRANTY: '2 Years' },
  { name: 'DeepCool AK400 CPU Cooler', category: 'CPU Coolers', brand: 'DeepCool', price: 7000, imageUrl: '/images/deepcool-ak400.jpg', description: 'High Performance Air Cooler', WARRANTY: '3 Years' },
  { name: 'NZXT Kraken X63 280mm AIO', category: 'CPU Coolers', brand: 'NZXT', price: 32000, imageUrl: '/images/nzxt-kraken-x63.jpg', description: 'RGB Liquid CPU Cooler', WARRANTY: '6 Years' },
  
  // PC Cases
  { name: 'Lian Li O11 Dynamic EVO', category: 'PC Cases', brand: 'Lian Li', price: 38000, imageUrl: '/images/lian-li-o11.jpg', description: 'Mid-Tower ATX Case', WARRANTY: '2 Years' },
  { name: 'NZXT H510 Elite', category: 'PC Cases', brand: 'NZXT', price: 28000, imageUrl: '/images/nzxt-h510.jpg', description: 'Compact ATX Mid-Tower', WARRANTY: '2 Years' },
  { name: 'Cooler Master TD500 Mesh', category: 'PC Cases', brand: 'Cooler Master', price: 22000, imageUrl: '/images/cm-td500.jpg', description: 'High Airflow ATX Case', WARRANTY: '2 Years' },
  
  // Peripherals
  { name: 'Logitech G502 HERO Gaming Mouse', category: 'Peripherals', brand: 'Logitech', price: 12000, imageUrl: '/images/logitech-g502.jpg', description: '25K DPI Gaming Mouse', WARRANTY: '2 Years' },
  { name: 'Razer BlackWidow V3 Mechanical Keyboard', category: 'Peripherals', brand: 'Razer', price: 25000, imageUrl: '/images/razer-blackwidow.jpg', description: 'RGB Mechanical Keyboard', WARRANTY: '2 Years' },
  { name: 'HyperX Cloud II Gaming Headset', category: 'Peripherals', brand: 'HyperX', price: 18000, imageUrl: '/images/hyperx-cloud-ii.jpg', description: '7.1 Surround Sound Headset', WARRANTY: '2 Years' },
  { name: 'Redragon K552 Mechanical Keyboard', category: 'Peripherals', brand: 'Redragon', price: 8500, imageUrl: '/images/redragon-k552.jpg', description: 'RGB Mechanical Gaming Keyboard', WARRANTY: '1 Year' },
  
  // Monitors
  { name: 'ASUS TUF VG27AQ 27" 165Hz', category: 'Monitors', brand: 'ASUS', price: 75000, imageUrl: '/images/asus-vg27aq.jpg', description: '1440p IPS Gaming Monitor', WARRANTY: '3 Years' },
  { name: 'MSI Optix MAG274QRF-QD', category: 'Monitors', brand: 'MSI', price: 85000, imageUrl: '/images/msi-mag274.jpg', description: '27" 1440p 165Hz Monitor', WARRANTY: '3 Years' },
  { name: 'Samsung Odyssey G7 27"', category: 'Monitors', brand: 'Samsung', price: 95000, imageUrl: '/images/samsung-odyssey-g7.jpg', description: '1440p 240Hz Curved Gaming', WARRANTY: '3 Years' },
  { name: 'Dell S2722DGM 27" 165Hz', category: 'Monitors', brand: 'Dell', price: 65000, imageUrl: '/images/dell-s2722.jpg', description: '1440p Curved Gaming Monitor', WARRANTY: '3 Years' },
  
  // Laptops
  { name: 'ASUS ROG Strix G16 RTX 4060', category: 'Laptops', brand: 'ASUS', price: 320000, imageUrl: '/images/asus-rog-g16.jpg', description: 'i7-13650HX, 16GB, RTX 4060', WARRANTY: '2 Years' },
  { name: 'MSI Katana 15 RTX 4050', category: 'Laptops', brand: 'MSI', price: 250000, imageUrl: '/images/msi-katana-15.jpg', description: 'i5-13450HX, 16GB, RTX 4050', WARRANTY: '2 Years' },
  { name: 'Dell G15 5530 RTX 4050', category: 'Laptops', brand: 'Dell', price: 280000, imageUrl: '/images/dell-g15.jpg', description: 'i7-13650HX, 16GB DDR5', WARRANTY: '1 Year' },
  { name: 'HP Victus 15 RTX 3050', category: 'Laptops', brand: 'HP', price: 220000, imageUrl: '/images/hp-victus-15.jpg', description: 'i5-12500H, 16GB, RTX 3050', WARRANTY: '1 Year' },
  
  // Cables & Accessories
  { name: 'Ugreen USB-C to HDMI Cable 2m', category: 'Cables & Accessories', brand: 'Ugreen', price: 2500, imageUrl: '/images/ugreen-usbc-hdmi.jpg', description: '4K 60Hz HDMI Cable', WARRANTY: '1 Year' },
  { name: 'Vention DisplayPort Cable 1.4', category: 'Cables & Accessories', brand: 'Vention', price: 1800, imageUrl: '/images/vention-dp.jpg', description: '8K DisplayPort Cable', WARRANTY: '1 Year' },
  { name: 'Orico USB Hub 4-Port', category: 'Cables & Accessories', brand: 'Orico', price: 1500, imageUrl: '/images/orico-hub.jpg', description: 'USB 3.0 Hub', WARRANTY: '1 Year' },
  
  // Audio Devices
  { name: 'Redragon S101 RGB Speakers', category: 'Audio Devices', brand: 'Redragon', price: 6500, imageUrl: '/images/redragon-s101.jpg', description: '2.1 RGB Gaming Speakers', WARRANTY: '1 Year' },
  { name: 'Fifine K669B USB Microphone', category: 'Audio Devices', brand: 'Fifine', price: 8500, imageUrl: '/images/fifine-k669b.jpg', description: 'USB Condenser Mic', WARRANTY: '1 Year' },
  { name: 'Logitech Z333 2.1 Speakers', category: 'Audio Devices', brand: 'Logitech', price: 12000, imageUrl: '/images/logitech-z333.jpg', description: '80W Speaker System', WARRANTY: '2 Years' },
  
  // Gaming Chairs
  { name: 'Cougar Armor ONE Gaming Chair', category: 'Gaming Chairs', brand: 'Cougar', price: 55000, imageUrl: '/images/cougar-armor.jpg', description: 'Ergonomic Gaming Chair', WARRANTY: '2 Years' },
  { name: 'ThunderX3 TC3 Gaming Chair', category: 'Gaming Chairs', brand: 'ThunderX3', price: 45000, imageUrl: '/images/thunderx3-tc3.jpg', description: 'Professional Gaming Chair', WARRANTY: '2 Years' },
  
  // Deals
  { name: 'RTX 4070 Gaming Bundle Deal', category: 'Deals', brand: 'Mixed', price: 350000, imageUrl: '/images/gaming-bundle.jpg', description: 'i7 + RTX 4070 + 32GB RAM Bundle', WARRANTY: 'Varies', originalPrice: 420000, discount: 17 },
  { name: 'Black Friday Laptop Deal', category: 'Deals', brand: 'Mixed', price: 180000, imageUrl: '/images/laptop-deal.jpg', description: 'Gaming Laptop Special Offer', WARRANTY: '1 Year', originalPrice: 250000, discount: 28 }
];

async function addTestProducts() {
  try {
    console.log('🚀 Starting Test Products Import...\n');
    
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define Product Schema
    const productSchema = new mongoose.Schema({
      name: String,
      Name: String,
      title: String,
      category: String,
      brand: String,
      price: Number,
      imageUrl: String,
      img: String,
      description: String,
      WARRANTY: String,
      originalPrice: Number,
      discount: Number,
      stock: { type: Number, default: 10 },
      createdAt: { type: Date, default: Date.now }
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // Clear existing test products (optional)
    console.log('🗑️  Clearing old test products...');
    await Product.deleteMany({ description: { $regex: /test|sample/i } });
    
    // Add all test products
    console.log('📦 Adding test products...\n');
    
    let successCount = 0;
    let failCount = 0;
    const categoryCount = {};

    for (const product of TEST_PRODUCTS) {
      try {
        const productData = {
          name: product.name,
          Name: product.name,
          title: product.name,
          category: product.category,
          brand: product.brand,
          price: product.price,
          imageUrl: product.imageUrl,
          img: product.imageUrl,
          description: product.description,
          WARRANTY: product.WARRANTY,
          originalPrice: product.originalPrice,
          discount: product.discount,
          stock: 10,
          createdAt: new Date()
        };

        await Product.create(productData);
        
        // Track by category
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        
        console.log(`✅ Added: ${product.name} (${product.category})`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${product.name} - ${error.message}`);
        failCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${failCount} products`);
    console.log('\n📁 Products by Category:');
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });
    
    console.log('\n🎉 Test products import completed!');
    console.log('\n🔍 Verification:');
    console.log('   1. Go to http://localhost:5175/admin');
    console.log('   2. Click "Products" tab');
    console.log('   3. You should see all test products');
    console.log('   4. Go to http://localhost:5175/products');
    console.log('   5. Filter by different categories');
    console.log('\n✨ All categories and brands are now tested!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addTestProducts();
