/**
 * Fetch products from API and auto-categorize them
 */

const fs = require('fs');
const path = require('path');

// ====== YOUR API CONFIGURATION ======
const API_BASE_URL = 'http://localhost:5000'; // Update with your backend URL
const API_ENDPOINT = '/api/products?limit=100000'; // Fetch all products

// ====== CATEGORY AND BRAND DATA (Pakistan Market) ======

const PC_HARDWARE_CATEGORIES = [
  {
    name: 'Processors',
    alternativeNames: ['CPU', 'Processor'],
    brands: ['Intel', 'AMD'],
    keywords: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen', 'Processor', 'CPU']
  },
  {
    name: 'Motherboards',
    alternativeNames: ['Motherboard', 'Mobo'],
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar'],
    keywords: ['Motherboard', 'LGA', 'AM4', 'AM5', 'ATX', 'B650', 'Z790']
  },
  {
    name: 'RAM',
    alternativeNames: ['Memory', 'DDR4', 'DDR5'],
    brands: ['Corsair', 'G.Skill', 'Kingston', 'XPG', 'Crucial', 'HikSemi'],
    keywords: ['RAM', 'Memory', 'DDR4', 'DDR5', 'GB', 'MHz']
  },
  {
    name: 'Graphics Cards',
    alternativeNames: ['GPU', 'Graphics Card', 'Video Card'],
    brands: ['ASUS', 'MSI', 'Gigabyte', 'Zotac', 'Sapphire', 'XFX', 'Palit'],
    keywords: ['RTX', 'GTX', 'GeForce', 'Radeon', 'Graphics', 'GPU']
  },
  {
    name: 'Power Supplies',
    alternativeNames: ['PSU'],
    brands: ['Corsair', 'Cooler Master', 'Thermaltake', 'DeepCool', 'Super Flower'],
    keywords: ['Power Supply', 'PSU', 'W', '650W', '750W', '850W']
  },
  {
    name: 'CPU Coolers',
    alternativeNames: ['Cooler', 'AIO'],
    brands: ['Cooler Master', 'DeepCool', 'NZXT', 'Arctic'],
    keywords: ['Cooler', 'AIO', 'Liquid', '240mm', '360mm']
  },
  {
    name: 'PC Cases',
    alternativeNames: ['Case', 'Cabinet'],
    brands: ['Lian Li', 'Cooler Master', 'NZXT', 'DeepCool', 'MSI', 'DarkFlash'],
    keywords: ['Case', 'Tower', 'Cabinet', 'ATX', 'Chassis']
  },
  {
    name: 'Storage',
    alternativeNames: ['SSD', 'HDD', 'NVMe'],
    brands: ['Samsung', 'Kingston', 'WD', 'Seagate', 'Crucial', 'XPG'],
    keywords: ['SSD', 'HDD', 'NVMe', 'TB', 'GB', 'Storage']
  },
  {
    name: 'Monitors',
    alternativeNames: ['Monitor', 'Display'],
    brands: ['ASUS', 'MSI', 'Samsung', 'Dell', 'HP', 'LG', 'AOC'],
    keywords: ['Monitor', 'Display', 'Hz', 'FHD', '4K', 'QHD']
  },
  {
    name: 'Keyboards',
    alternativeNames: ['Keyboard'],
    brands: ['Logitech', 'Razer', 'Corsair', 'Redragon', 'Fantech', 'Mchose'],
    keywords: ['Keyboard', 'Mechanical', 'Gaming']
  },
  {
    name: 'Mouse',
    alternativeNames: ['Gaming Mouse'],
    brands: ['Logitech', 'Razer', 'Corsair', 'Fantech', 'Mchose'],
    keywords: ['Mouse', 'Gaming Mouse', 'Wireless']
  },
  {
    name: 'Headsets',
    alternativeNames: ['Headphones'],
    brands: ['HyperX', 'Razer', 'Logitech', 'JBL', 'SteelSeries'],
    keywords: ['Headset', 'Headphones', 'Gaming']
  },
  {
    name: 'Laptops',
    alternativeNames: ['Notebook'],
    brands: ['ASUS', 'MSI', 'Dell', 'HP', 'Lenovo', 'Acer', 'Apple'],
    keywords: ['Laptop', 'Notebook', 'EliteBook', 'ProBook', 'ZBook', 'MacBook']
  }
];

function autoDetectCategory(product) {
  const text = `${product.name || ''} ${product.title || ''}`.toLowerCase();
  
  for (const cat of PC_HARDWARE_CATEGORIES) {
    for (const keyword of cat.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return cat.name;
      }
    }
  }
  return 'Uncategorized';
}

function autoDetectBrand(product) {
  const text = `${product.name || ''} ${product.title || ''}`.toLowerCase();
  
  const allBrands = [...new Set(PC_HARDWARE_CATEGORIES.flatMap(c => c.brands))];
  
  for (const brand of allBrands) {
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`, 'i');
    if (regex.test(text)) {
      return brand;
    }
  }
  return 'Generic';
}

async function fetchAndCategorize() {
  console.log('🚀 Fetching products from API...\n');

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    let products = Array.isArray(data) ? data : (data.products || []);

    console.log(`✅ Fetched ${products.length} products\n`);
    console.log('🔍 Auto-categorizing...\n');

    const stats = { categories: {}, brands: {} };
    let categorized = 0;

    products.forEach((p, i) => {
      if (!p.category || p.category === '') {
        p.category = autoDetectCategory(p);
        categorized++;
      }
      
      if (!p.brand || p.brand === '') {
        p.brand = autoDetectBrand(p);
      }

      stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
      stats.brands[p.brand] = (stats.brands[p.brand] || 0) + 1;

      if ((i + 1) % 100 === 0) {
        console.log(`   Processed ${i + 1}/${products.length}...`);
      }
    });

    // Save
    const outputFile = path.join(__dirname, 'allproducts_categorized.json');
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));

    console.log(`\n✅ Saved ${products.length} products to: ${outputFile}\n`);
    console.log(`📊 Auto-categorized: ${categorized} products\n`);
    
    console.log('📦 CATEGORY DISTRIBUTION:\n');
    Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat.padEnd(25)} ${count} products`);
      });

    console.log('\n🏷️  BRAND DISTRIBUTION:\n');
    Object.entries(stats.brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([brand, count]) => {
        console.log(`   ${brand.padEnd(25)} ${count} products`);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your backend server is running!');
    console.log(`   Expected API: ${API_BASE_URL}${API_ENDPOINT}\n`);
  }
}

fetchAndCategorize();
