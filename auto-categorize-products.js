/**
 * AUTO-CATEGORIZATION SCRIPT
 * Automatically detects and fills category and brand fields for all products
 * Based on Pakistani PC hardware market data
 */

const fs = require('fs');
const path = require('path');

// ====== CATEGORY AND BRAND DATA (Pakistan Market) ======

const PC_HARDWARE_CATEGORIES = [
  {
    name: 'Processors',
    slug: 'processors',
    alternativeNames: ['CPU', 'Processor', 'CPUs'],
    brands: ['Intel', 'AMD'],
    keywords: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 
               'Threadripper', 'Xeon', '10th Gen', '11th Gen', '12th Gen', '13th Gen', '14th Gen',
               '3000 Series', '5000 Series', '7000 Series', '9000 Series', 'Processor']
  },
  {
    name: 'Motherboards',
    slug: 'motherboards',
    alternativeNames: ['Motherboard', 'Mobo', 'Mainboard'],
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar'],
    keywords: ['LGA1200', 'LGA1700', 'AM4', 'AM5', 'B450', 'B550', 'B650', 'B760', 'X570', 'X670',
               'Z490', 'Z690', 'Z790', 'ATX', 'Micro ATX', 'Mini ITX', 'Motherboard', 'MOBO']
  },
  {
    name: 'RAM',
    slug: 'ram',
    alternativeNames: ['Memory', 'RAM Memory', 'DDR4', 'DDR5'],
    brands: ['Corsair', 'XPG', 'G.Skill', 'G Skill', 'Kingston', 'TeamGroup', 'T-Force', 'Crucial', 'HikSemi'],
    keywords: ['DDR4', 'DDR5', '8GB', '16GB', '32GB', '64GB', 'RGB', '3200MHz', '3600MHz', '6000MHz',
               'Vengeance', 'Trident', 'Ripjaws', 'Memory', 'RAM', 'DIMM', 'SO-DIMM']
  },
  {
    name: 'Graphics Cards',
    slug: 'graphics-cards',
    alternativeNames: ['GPU', 'Graphics Card', 'Video Card', 'VGA'],
    brands: ['ASUS', 'MSI', 'Gigabyte', 'Zotac', 'PNY', 'XFX', 'Sapphire', 'PowerColor', 'Palit', 'GALAX'],
    keywords: ['RTX', 'GTX', 'GeForce', 'Radeon', 'RX', 'Ti', 'Super', 'XT', 'XTX',
               'Graphics Card', 'GPU', 'Video Card', '4060', '4070', '4080', '4090',
               '3060', '3070', '3080', '3090', '6600', '6700', '6800', '6900', '7600', '7700', '7800', '7900']
  },
  {
    name: 'Power Supplies',
    slug: 'power-supplies',
    alternativeNames: ['PSU', 'Power Supply', 'SMPS'],
    brands: ['Cooler Master', 'Corsair', 'Thermaltake', 'DeepCool', 'Gigabyte', 'MSI', 'Super Flower', 'Antec'],
    keywords: ['550W', '650W', '750W', '850W', '1000W', '1200W', '80+', 'Bronze', 'Gold', 'Platinum',
               'Modular', 'PSU', 'Power Supply', 'SMPS']
  },
  {
    name: 'CPU Coolers',
    slug: 'cpu-coolers',
    alternativeNames: ['Cooler', 'Cooling', 'Liquid Cooler', 'AIO'],
    brands: ['Cooler Master', 'DeepCool', 'NZXT', 'Thermalright', 'ID-COOLING', 'Arctic', 'Corsair'],
    keywords: ['AIO', 'Liquid Cooler', 'Air Cooler', 'CPU Cooler', '120mm', '240mm', '360mm',
               'RGB', 'Tower Cooler', 'CoreLiquid', 'Hyper']
  },
  {
    name: 'PC Cases',
    slug: 'pc-cases',
    alternativeNames: ['Case', 'Casing', 'Cabinet', 'Chassis'],
    brands: ['Lian Li', 'Cooler Master', 'DeepCool', 'NZXT', 'Cougar', 'Thermaltake', 'DarkFlash', 'Thunder Carbon', 'Boost'],
    keywords: ['Mid Tower', 'Full Tower', 'Mini ITX', 'ATX Case', 'Gaming Case', 'RGB',
               'Tempered Glass', 'Mesh', 'Case', 'Cabinet', 'Chassis']
  },
  {
    name: 'Storage',
    slug: 'storage',
    alternativeNames: ['SSD', 'HDD', 'NVMe', 'Hard Drive', 'M.2'],
    brands: ['Samsung', 'Kingston', 'WD', 'Western Digital', 'Seagate', 'Crucial', 'XPG', 'HikSemi'],
    keywords: ['SSD', 'HDD', 'NVMe', 'M.2', 'SATA', '1TB', '2TB', '4TB', '500GB', '512GB', '256GB',
               'Gen3', 'Gen4', 'Hard Drive', 'Solid State']
  },
  {
    name: 'Cables & Accessories',
    slug: 'cables-accessories',
    alternativeNames: ['Accessories', 'Cables', 'Adapter'],
    brands: ['Universal', 'CableMod', 'Generic', 'UGREEN', 'Amaze'],
    keywords: ['Cable', 'SATA', 'USB', 'HDMI', 'DisplayPort', 'Extension', 'Adapter',
               'RGB Hub', 'Splitter', 'Converter', 'Type-C']
  },
  {
    name: 'Keyboards',
    slug: 'keyboards',
    alternativeNames: ['Keyboard', 'Gaming Keyboard', 'Mechanical Keyboard'],
    brands: ['Logitech', 'Redragon', 'Fantech', 'Razer', 'Corsair', 'HyperX', 'Mchose', 'Black Shark', 'MSI'],
    keywords: ['Keyboard', 'Mechanical', 'Gaming Keyboard', 'RGB', 'Wireless',
               'Blue Switch', 'Red Switch', 'Brown Switch', 'TKL']
  },
  {
    name: 'Mouse',
    slug: 'mouse',
    alternativeNames: ['Mice', 'Gaming Mouse'],
    brands: ['Razer', 'Logitech', 'Bloody', 'Fantech', 'Redragon', 'Mchose', 'Corsair', 'HyperX', 'MSI'],
    keywords: ['Mouse', 'Gaming Mouse', 'Wireless Mouse', 'RGB', 'DPI', 'Optical']
  },
  {
    name: 'Headsets',
    slug: 'headsets',
    alternativeNames: ['Headset', 'Gaming Headset', 'Headphones'],
    brands: ['HyperX', 'Razer', 'Redragon', 'Fantech', 'Logitech', 'Corsair', 'JBL', 'SteelSeries', 'Boost'],
    keywords: ['Headset', 'Headphones', 'Gaming Headset', '7.1', 'Wireless', 'USB', 'Noise Cancelling']
  },
  {
    name: 'Peripherals',
    slug: 'peripherals',
    alternativeNames: ['Mousepad', 'Webcam', 'Speakers', 'Controller'],
    brands: ['Logitech', 'Razer', 'Fantech', 'Redragon', 'HyperX', 'JBL', 'EasySMX', 'MSI'],
    keywords: ['Mousepad', 'Webcam', 'Speakers', 'Controller', 'Gamepad', 'RGB Pad',
               'Extended', 'XXL', 'HD', '1080p', 'Bluetooth Speaker']
  },
  {
    name: 'Monitors',
    slug: 'monitors',
    alternativeNames: ['Monitor', 'Display', 'Screen'],
    brands: ['ASUS', 'MSI', 'Samsung', 'Dell', 'Gigabyte', 'ViewSonic', 'AOC', 'HP', 'LG', 'BenQ'],
    keywords: ['Monitor', 'Display', 'Screen', '60Hz', '75Hz', '144Hz', '165Hz', '240Hz',
               'FHD', 'QHD', '4K', 'Curved', 'Gaming Monitor', '1080p', '1440p', '2K']
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    alternativeNames: ['Laptop', 'Notebook'],
    brands: ['ASUS', 'MSI', 'Lenovo', 'Dell', 'HP', 'Acer', 'Gigabyte', 'Apple'],
    keywords: ['Laptop', 'Notebook', 'Gaming Laptop', 'Ultrabook', 'MacBook', 'iMac',
               'Core i5', 'Core i7', 'Ryzen 5', 'Ryzen 7', 'RTX', 'GTX']
  },
  {
    name: 'Prebuilt PCs',
    slug: 'prebuilt-pcs',
    alternativeNames: ['Desktop', 'PC', 'Custom Build'],
    brands: ['Custom Build', 'ASUS', 'MSI', 'Dell', 'HP'],
    keywords: ['Desktop', 'PC Build', 'Gaming PC', 'Workstation', 'Custom Build', 'Prebuilt']
  },
  {
    name: 'Networking',
    slug: 'networking',
    alternativeNames: ['Router', 'Switch', 'Access Point', 'Network'],
    brands: ['TP-Link', 'Tenda', 'D-Link', 'Ubiquiti', 'Cisco'],
    keywords: ['Router', 'Switch', 'Access Point', 'WiFi', 'Ethernet', 'Mesh', 'Gigabit',
               'TP-Link', 'Omada', 'Archer', 'Tapo']
  },
  {
    name: 'Printers & Scanners',
    slug: 'printers',
    alternativeNames: ['Printer', 'Scanner'],
    brands: ['Epson', 'HP', 'Canon', 'Brother'],
    keywords: ['Printer', 'Scanner', 'EcoTank', 'Ink Tank', 'LaserJet', 'All-in-One']
  },
  {
    name: 'UPS & Power',
    slug: 'ups-power',
    alternativeNames: ['UPS', 'Battery'],
    brands: ['SOLO', 'APC', 'CyberPower'],
    keywords: ['UPS', 'Battery Backup', 'Inverter', 'Line Interactive', 'KVA']
  },
  {
    name: 'Gaming Chairs',
    slug: 'gaming-chairs',
    alternativeNames: ['Chair', 'Gaming Chair'],
    brands: ['DXRacer', 'Secretlab', 'Boost', 'Generic'],
    keywords: ['Gaming Chair', 'Office Chair', 'Ergonomic', 'Footrest', 'RGB Chair']
  },
  {
    name: 'Laptop Bags',
    slug: 'laptop-bags',
    alternativeNames: ['Bag', 'Sleeve', 'Backpack'],
    brands: ['CoolBell', 'Amaze', 'Generic'],
    keywords: ['Laptop Bag', 'Backpack', 'Sleeve', 'Laptop Case', 'USB Charging Port']
  },
  {
    name: 'Monitor Arms',
    slug: 'monitor-arms',
    alternativeNames: ['Monitor Mount', 'Arm'],
    brands: ['Twisted Minds', 'Generic'],
    keywords: ['Monitor Arm', 'Monitor Mount', 'Articulating', 'Triple Monitor']
  }
];

// Get all unique brands
function getAllBrands() {
  const brandsSet = new Set();
  PC_HARDWARE_CATEGORIES.forEach(category => {
    category.brands.forEach(brand => brandsSet.add(brand));
  });
  return Array.from(brandsSet).sort();
}

// Auto-detect category
function autoDetectCategory(product) {
  const searchText = `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  
  let bestMatch = null;
  let highestScore = 0;

  // PRIORITY CHECK: If explicit category keywords exist, heavily favor them
  // This prevents motherboards mentioning "Ryzen 9000" from being categorized as Processors
  const explicitCategoryMatch = PC_HARDWARE_CATEGORIES.find(category => {
    const hasExplicitName = searchText.includes(category.name.toLowerCase());
    const hasExplicitSlug = searchText.includes(category.slug);
    const hasExplicitAlt = category.alternativeNames?.some(altName => 
      searchText.includes(altName.toLowerCase())
    );
    
    return hasExplicitName || hasExplicitSlug || hasExplicitAlt;
  });

  // If we found an explicit match, give it a huge boost
  if (explicitCategoryMatch) {
    bestMatch = explicitCategoryMatch;
    highestScore = 100; // Very high score to override other matches
  } else {
    // Otherwise, use keyword-based scoring
    for (const category of PC_HARDWARE_CATEGORIES) {
      let score = 0;

      // Check keywords
      category.keywords?.forEach(keyword => {
        if (searchText.includes(keyword.toLowerCase())) score += 3;
      });

      // Check brands (weaker signal)
      category.brands?.forEach(brand => {
        if (searchText.includes(brand.toLowerCase())) score += 2;
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = category;
      }
    }
  }

  return highestScore >= 5 ? bestMatch : null;
}

// Auto-detect brand
function autoDetectBrand(product) {
  const searchText = `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  const allBrands = getAllBrands();

  // Sort brands by length (longest first) to match more specific brands first
  const sortedBrands = allBrands.sort((a, b) => b.length - a.length);

  for (const brand of sortedBrands) {
    // Check for exact word match (with word boundaries)
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`, 'i');
    if (regex.test(searchText)) {
      return brand;
    }
  }

  // Fallback: check for contains (less strict)
  for (const brand of sortedBrands) {
    if (searchText.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'Generic';
}

// Main processing function
async function processProducts() {
  console.log('🚀 Starting auto-categorization...\n');

  // Read the JSON file
  const inputFile = path.join(__dirname, 'allproducts.json');
  const outputFile = path.join(__dirname, 'allproducts_categorized.json');
  const summaryFile = path.join(__dirname, 'categorization_summary.txt');

  console.log('📁 Reading products from:', inputFile);
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const products = JSON.parse(rawData);

  console.log(`✅ Loaded ${products.length} products\n`);
  console.log('🔍 Analyzing and categorizing...\n');

  // Statistics
  const categoryStats = {};
  const brandStats = {};
  let processedCount = 0;
  let categorizedCount = 0;
  let brandedCount = 0;

  // Process each product
  products.forEach((product, index) => {
    processedCount++;

    // Detect category
    let category = product.category;
    if (!category || category.trim() === '') {
      const detected = autoDetectCategory(product);
      if (detected) {
        category = detected.name;
        product.category = category;
        categorizedCount++;
      } else {
        category = 'Uncategorized';
        product.category = category;
      }
    }

    // Detect brand
    let brand = product.brand;
    if (!brand || brand.trim() === '') {
      brand = autoDetectBrand(product);
      product.brand = brand;
      brandedCount++;
    }

    // Update stats
    categoryStats[category] = (categoryStats[category] || 0) + 1;
    brandStats[brand] = (brandStats[brand] || 0) + 1;

    // Progress indicator
    if (processedCount % 100 === 0) {
      console.log(`   Processed ${processedCount}/${products.length} products...`);
    }
  });

  // Write categorized products
  console.log('\n💾 Writing categorized products...');
  fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
  console.log(`✅ Saved to: ${outputFile}\n`);

  // Generate summary
  console.log('📊 Generating summary report...\n');
  
  let summary = '';
  summary += '=' .repeat(70) + '\n';
  summary += '           AUTO-CATEGORIZATION SUMMARY REPORT\n';
  summary += '=' .repeat(70) + '\n\n';
  
  summary += `📦 Total Products Processed: ${processedCount}\n`;
  summary += `✨ Products Auto-Categorized: ${categorizedCount}\n`;
  summary += `🏷️  Products Auto-Branded: ${brandedCount}\n\n`;
  
  summary += '=' .repeat(70) + '\n';
  summary += '                    CATEGORY DISTRIBUTION\n';
  summary += '=' .repeat(70) + '\n\n';
  
  // Sort categories by count
  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1]);
  
  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / processedCount) * 100).toFixed(1);
    summary += `${category.padEnd(30)} ${count.toString().padStart(5)} products (${percentage}%)\n`;
  });
  
  summary += '\n' + '=' .repeat(70) + '\n';
  summary += '                     BRAND DISTRIBUTION\n';
  summary += '=' .repeat(70) + '\n\n';
  
  // Sort brands by count
  const sortedBrands = Object.entries(brandStats)
    .sort((a, b) => b[1] - a[1]);
  
  sortedBrands.forEach(([brand, count]) => {
    const percentage = ((count / processedCount) * 100).toFixed(1);
    summary += `${brand.padEnd(30)} ${count.toString().padStart(5)} products (${percentage}%)\n`;
  });
  
  summary += '\n' + '=' .repeat(70) + '\n';
  summary += '                    TOP 10 CATEGORIES\n';
  summary += '=' .repeat(70) + '\n\n';
  
  sortedCategories.slice(0, 10).forEach(([category, count], index) => {
    summary += `${(index + 1).toString().padStart(2)}. ${category.padEnd(28)} ${count} products\n`;
  });
  
  summary += '\n' + '=' .repeat(70) + '\n';
  summary += '                      TOP 10 BRANDS\n';
  summary += '=' .repeat(70) + '\n\n';
  
  sortedBrands.slice(0, 10).forEach(([brand, count], index) => {
    summary += `${(index + 1).toString().padStart(2)}. ${brand.padEnd(28)} ${count} products\n`;
  });
  
  summary += '\n' + '=' .repeat(70) + '\n';
  summary += 'Generated: ' + new Date().toLocaleString() + '\n';
  summary += '=' .repeat(70) + '\n';

  // Write summary
  fs.writeFileSync(summaryFile, summary);
  console.log(summary);
  console.log(`\n✅ Summary saved to: ${summaryFile}\n`);
  
  console.log('🎉 Auto-categorization complete!\n');
  console.log('📁 Output files:');
  console.log(`   - Categorized JSON: ${outputFile}`);
  console.log(`   - Summary Report: ${summaryFile}\n`);
}

// Run the script
processProducts().catch(console.error);
