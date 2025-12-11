/**
 * Category Matching Test Script
 * Tests how many products match each category
 * Run: node scripts/test-categories.cjs
 */

const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Category matching logic (same as frontend)
const CATEGORY_GROUPS = {
  'cpu coolers': {
    canonical: 'CPU Coolers',
    aliases: ['cpu coolers', 'cpu cooler', 'cooling', 'cooler', 'cooling type', 'cooler type', 'fan', 'aio']
  },
  'monitors': {
    canonical: 'Monitors',
    aliases: ['monitors', 'monitor', 'display', 'monitor type', 'display type', 'screen', 'lcd']
  },
  'mouse': {
    canonical: 'Mouse',
    aliases: ['mouse', 'mice', 'mouse type', 'gaming mouse', 'wireless mouse']
  },
  'keyboards': {
    canonical: 'Keyboards',
    aliases: ['keyboards', 'keyboard', 'keyboard type', 'mechanical keyboard']
  },
  'laptops': {
    canonical: 'Laptops',
    aliases: ['laptops', 'laptop', 'notebook', 'laptop type', 'gaming laptop', 'ultrabook']
  },
  'graphics cards': {
    canonical: 'Graphics Cards',
    aliases: ['graphics cards', 'graphics card', 'graphics card type', 'gpu', 'gpus', 'gpu type', 'graphics', 'vga', 'video card']
  },
  'power supplies': {
    canonical: 'Power Supplies',
    aliases: ['power supplies', 'power supply', 'psu', 'power supply type', 'psu type', 'smps']
  },
  'pc cases': {
    canonical: 'PC Cases',
    aliases: ['pc cases', 'pc case', 'case', 'casing', 'case type', 'chassis', 'tower case']
  },
  'ram': {
    canonical: 'RAM',
    aliases: ['ram', 'memory', 'ddr', 'ddr4', 'ddr5', 'memory type', 'ram type', 'dimm']
  },
  'motherboards': {
    canonical: 'Motherboards',
    aliases: ['motherboards', 'motherboard', 'motherboard type', 'mobo', 'mainboard', 'mb', 'mobo type']
  },
  'headsets': {
    canonical: 'Headsets',
    aliases: ['headsets', 'headset', 'headphone', 'headphones', 'headset type', 'gaming headset']
  },
  'processors': {
    canonical: 'Processors',
    aliases: ['processors', 'processor', 'processor type', 'cpu', 'cpus', 'cpu type', 'processor types']
  },
  'storage': {
    canonical: 'Storage',
    aliases: ['storage', 'ssd', 'hdd', 'nvme', 'storage type', 'ssd type', 'hard drive', 'solid state']
  },
  'deals': {
    canonical: 'Deals',
    aliases: ['deals', 'deal', 'offers', 'offer', 'discount', 'sale', 'special offer']
  },
  'prebuilds': {
    canonical: 'Prebuilds',
    aliases: ['prebuilds', 'prebuild', 'prebuilt', 'pre-built', 'custom pc', 'gaming pc']
  },
  'cables & accessories': {
    canonical: 'Cables & Accessories',
    aliases: ['cables & accessories', 'cables and accessories', 'accessories', 'cable', 'cables', 'adapter']
  },
  'networking': {
    canonical: 'Networking',
    aliases: ['networking', 'network', 'router', 'modem', 'switch', 'wifi']
  },
  'empty': {
    canonical: 'Uncategorized',
    aliases: ['empty', 'uncategorized', 'unknown', 'other', '']
  }
};

/**
 * Check if a product category matches a selected category
 */
function categoriesMatch(productCategory, selectedCategory) {
  if (!productCategory || !selectedCategory) return false;
  
  const prodCat = (productCategory || '').toLowerCase().trim();
  const selCat = (selectedCategory || '').toLowerCase().trim();
  
  // Direct match
  if (prodCat === selCat) return true;
  
  // Find which group each category belongs to
  let productGroup = null;
  let selectedGroup = null;
  
  for (const [key, group] of Object.entries(CATEGORY_GROUPS)) {
    const prodMatch = group.aliases.some(alias => alias.toLowerCase() === prodCat);
    const selMatch = group.aliases.some(alias => alias.toLowerCase() === selCat);
    
    if (prodMatch) productGroup = key;
    if (selMatch) selectedGroup = key;
  }
  
  // If both belong to the same group, they match
  if (productGroup && selectedGroup && productGroup === selectedGroup) {
    return true;
  }
  
  // Flexible matching
  if (prodCat.includes(selCat) || selCat.includes(prodCat)) {
    return true;
  }
  
  return false;
}

/**
 * Main test function
 */
async function testCategoryMatching() {
  try {
    console.log('================================================================================');
    console.log('CATEGORY MATCHING TEST');
    console.log('================================================================================\n');
    
    // Fetch products from API
    console.log('📥 Fetching products from API...');
    const response = await fetch('http://localhost:10000/api/products?limit=10000');
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    let products = Array.isArray(data) ? data : (data.products || []);
    
    console.log(`✅ Fetched ${products.length} products\n`);
    
    // Get all unique categories from database
    const dbCategories = [...new Set(products.map(p => p.category || 'empty'))];
    console.log(`📊 Unique categories in database: ${dbCategories.length}`);
    console.log(`   ${dbCategories.sort().join(', ')}\n`);
    
    // Test each category
    const results = {};
    const categoryGroups = Object.keys(CATEGORY_GROUPS).map(k => CATEGORY_GROUPS[k].canonical);
    
    console.log('================================================================================');
    console.log('CATEGORY MATCHING RESULTS');
    console.log('================================================================================\n');
    
    let totalMatched = 0;
    let totalUnmatched = 0;
    
    for (const categoryName of categoryGroups) {
      const matched = products.filter(p => categoriesMatch(p.category, categoryName));
      const count = matched.length;
      
      results[categoryName] = {
        matched: count,
        percentage: ((count / products.length) * 100).toFixed(1)
      };
      
      totalMatched += count;
      
      // Show results with bar chart
      const bar = '█'.repeat(Math.floor(count / 5)) + '░'.repeat(Math.max(0, 20 - Math.floor(count / 5)));
      console.log(`${categoryName.padEnd(25)} │ ${bar} │ ${count.toString().padStart(4)} (${results[categoryName].percentage.padStart(5)}%)`);
    }
    
    // Calculate unmatched
    totalUnmatched = products.length - totalMatched;
    
    console.log('\n================================================================================');
    console.log('SUMMARY');
    console.log('================================================================================\n');
    
    console.log(`Total Products:        ${products.length}`);
    console.log(`Total Matched:         ${totalMatched} (${((totalMatched / products.length) * 100).toFixed(1)}%)`);
    console.log(`Total Unmatched:       ${totalUnmatched} (${((totalUnmatched / products.length) * 100).toFixed(1)}%)`);
    console.log(`Categories Configured: ${categoryGroups.length}`);
    
    // Show top categories
    console.log('\n================================================================================');
    console.log('TOP CATEGORIES');
    console.log('================================================================================\n');
    
    const sorted = Object.entries(results)
      .sort((a, b) => b[1].matched - a[1].matched)
      .slice(0, 10);
    
    sorted.forEach(([cat, data], idx) => {
      console.log(`${(idx + 1).toString().padStart(2)}. ${cat.padEnd(25)} ${data.matched.toString().padStart(4)} products`);
    });
    
    // Show unmatched categories
    console.log('\n================================================================================');
    console.log('UNMATCHED PRODUCTS');
    console.log('================================================================================\n');
    
    const unmatched = products.filter(p => {
      const cat = p.category || 'empty';
      return !categoryGroups.some(cg => categoriesMatch(cat, cg));
    });
    
    if (unmatched.length > 0) {
      console.log(`Found ${unmatched.length} unmatched products:\n`);
      
      // Group by category
      const unmatchedByCategory = {};
      unmatched.forEach(p => {
        const cat = p.category || 'empty';
        if (!unmatchedByCategory[cat]) {
          unmatchedByCategory[cat] = [];
        }
        unmatchedByCategory[cat].push(p);
      });
      
      for (const [cat, items] of Object.entries(unmatchedByCategory)) {
        console.log(`  ${cat}: ${items.length} products`);
        items.slice(0, 3).forEach(p => {
          console.log(`    - ${p.name || p.title || 'Unknown'}`);
        });
        if (items.length > 3) {
          console.log(`    ... and ${items.length - 3} more`);
        }
      }
    } else {
      console.log('✅ All products are matched to categories!');
    }
    
    // Show category distribution
    console.log('\n================================================================================');
    console.log('DETAILED CATEGORY BREAKDOWN');
    console.log('================================================================================\n');
    
    for (const [categoryName, data] of Object.entries(results)) {
      if (data.matched > 0) {
        console.log(`${categoryName}: ${data.matched} products (${data.percentage}%)`);
      }
    }
    
    console.log('\n================================================================================');
    console.log('✅ TEST COMPLETE');
    console.log('================================================================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running: npm run dev (in backend folder)');
    console.log('2. API is accessible at http://localhost:10000');
    console.log('3. Database has products');
  }
}

// Run the test
testCategoryMatching();
