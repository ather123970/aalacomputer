/**
 * Simple script to add category and brand to existing JSON file
 * NO BACKEND NEEDED - Just processes the JSON file directly
 */

const fs = require('fs');

// Category detection keywords
const CATEGORIES = {
  'Processors': ['processor', 'cpu', 'core i', 'ryzen', 'intel', 'amd'],
  'Motherboards': ['motherboard', 'mobo', 'lga', 'am4', 'am5', 'atx', 'b650', 'z790', 'x670'],
  'RAM': ['ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'gb'],
  'Graphics Cards': ['rtx', 'gtx', 'geforce', 'radeon', 'graphics card', 'gpu', 'video card'],
  'Power Supplies': ['power supply', 'psu', '650w', '750w', '850w', 'watt'],
  'CPU Coolers': ['cooler', 'aio', 'liquid', 'coreliquid', 'cooling'],
  'PC Cases': ['case', 'tower', 'cabinet', 'chassis', 'gaming case'],
  'Storage': ['ssd', 'hdd', 'nvme', 'm.2', 'storage', 'hard drive'],
  'Monitors': ['monitor', 'display', 'hz', 'screen', 'fhd', 'qhd', '4k'],
  'Keyboards': ['keyboard', 'mechanical', 'gaming keyboard'],
  'Mouse': ['mouse', 'gaming mouse', 'wireless mouse'],
  'Headsets': ['headset', 'headphone', 'gaming headset'],
  'Laptops': ['laptop', 'notebook', 'elitebook', 'probook', 'zbook', 'macbook', 'imac'],
  'Printers': ['printer', 'scanner', 'ecotank'],
  'Networking': ['router', 'wifi', 'tp-link', 'access point'],
  'UPS': ['ups', 'battery backup'],
  'Peripherals': ['mousepad', 'webcam', 'controller', 'gamepad'],
  'Accessories': ['cable', 'adapter', 'sleeve', 'bag', 'backpack']
};

const BRANDS = [
  'Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Corsair', 'Kingston', 
  'G.Skill', 'XPG', 'Crucial', 'Samsung', 'WD', 'Western Digital', 'Seagate',
  'Cooler Master', 'DeepCool', 'NZXT', 'Thermaltake', 'Lian Li', 'Zotac',
  'Sapphire', 'XFX', 'Palit', 'Logitech', 'Razer', 'HyperX', 'Redragon',
  'Fantech', 'Dell', 'HP', 'Lenovo', 'Acer', 'Apple', 'LG', 'AOC', 'BenQ',
  'JBL', 'SteelSeries', 'Epson', 'Canon', 'TP-Link', 'DarkFlash', 'Mchose',
  'EasySMX', 'Thunder Carbon', 'Boost', 'HikSemi', 'Super Flower', 'SOLO',
  'CoolBell', 'Amaze', 'UGREEN', 'Tenda', 'Black Shark', 'GALAX', 'Biostar',
  'ViewSonic', 'PowerColor', 'Antec', 'Arctic', 'Thermalright', 'ID-COOLING',
  'Cougar', 'TeamGroup', 'T-Force', 'PNY', 'Bloody', 'Twisted Minds'
];

function detectCategory(productName) {
  const text = productName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Uncategorized';
}

function detectBrand(productName) {
  const text = productName.toLowerCase();
  
  // Sort by length (longest first) for better matching
  const sortedBrands = [...BRANDS].sort((a, b) => b.length - a.length);
  
  for (const brand of sortedBrands) {
    if (text.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return 'Generic';
}

// Main process
console.log('🚀 Processing allproducts.json...\n');

try {
  // Read file
  const data = fs.readFileSync('allproducts.json', 'utf8');
  
  if (!data || data.trim() === '') {
    console.log('❌ ERROR: allproducts.json is EMPTY!');
    console.log('\n📋 Please paste your products data into allproducts.json first\n');
    process.exit(1);
  }
  
  const products = JSON.parse(data);
  console.log(`✅ Loaded ${products.length} products\n`);
  
  // Process each product
  let updated = 0;
  const stats = { categories: {}, brands: {} };
  
  products.forEach((product, i) => {
    const name = product.name || product.title || '';
    
    // Add category if missing
    if (!product.category || product.category === '') {
      product.category = detectCategory(name);
      updated++;
    }
    
    // Add brand if missing
    if (!product.brand || product.brand === '') {
      product.brand = detectBrand(name);
      updated++;
    }
    
    // Stats
    stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Processed ${i + 1}/${products.length}...`);
    }
  });
  
  // Save back to same file
  fs.writeFileSync('allproducts.json', JSON.stringify(products, null, 2));
  
  console.log(`\n✅ Updated ${updated} fields in ${products.length} products`);
  console.log('💾 Saved to: allproducts.json\n');
  
  // Show stats
  console.log('📊 CATEGORIES:');
  Object.entries(stats.categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat.padEnd(20)} ${count} products`);
    });
  
  console.log('\n🏷️  TOP BRANDS:');
  Object.entries(stats.brands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([brand, count]) => {
      console.log(`   ${brand.padEnd(20)} ${count} products`);
    });
  
  console.log('\n✨ Done!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.message.includes('JSON')) {
    console.log('\n💡 JSON file has syntax errors. Please check the format.\n');
  }
}
