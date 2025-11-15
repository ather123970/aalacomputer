/**
 * Intelligent Category Detection System
 * Detects correct category based on product name and keywords
 * Scans anywhere in the product name (beginning, middle, or end)
 */

const CATEGORY_KEYWORDS = {
  // PRIORITY 1: Laptops (HIGHEST PRIORITY)
  'Laptops': {
    keywords: ['laptop', 'notebook', 'ultrabook', 'chromebook', 'macbook', 'probook', 'elitebook', 'thinkpad', 'vivobook', 'zenbook', 'ideapad', 'pavilion', 'open box', 'gen laptop'],
    priority: 100,
    exactMatch: false,
    excludeKeywords: [] // No exclusions for laptops
  },
  
  // PRIORITY 2: Prebuilt PCs / Mini PCs
  'Prebuilt PC': {
    keywords: ['mini pc', 'ease mini pc', 'desktop computer', 'ver 1', 'ver 2', 'phantom', 'frost', 'unleash', 'prebuilt'],
    priority: 99,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // PRIORITY 3: Processors / CPUs (STRICT)
  'Processors': {
    keywords: [
      // Intel processors
      'intel core i3', 'intel core i5', 'intel core i7', 'intel core i9',
      'intel core ultra', 'core ultra 5', 'core ultra 7', 'core ultra 9',
      'core i3', 'core i5', 'core i7', 'core i9',
      'i3-', 'i5-', 'i7-', 'i9-',
      'pentium', 'celeron', 'xeon',
      // AMD processors
      'amd ryzen 3', 'amd ryzen 5', 'amd ryzen 7', 'amd ryzen 9',
      'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9',
      'ryzen 5600', 'ryzen 5700', 'ryzen 7600', 'ryzen 7700', 'ryzen 7800', 'ryzen 9600', 'ryzen 9700', 'ryzen 9800', 'ryzen 9900',
      'threadripper', 'athlon',
      // Suffixes
      'kf', 'f suffix', 'x suffix', 'tray', 'box processor'
    ],
    priority: 98,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'prebuilt', 'mini pc', 'desktop computer', 'monitor', 'display'],
    customValidation: (product) => {
      const name = (product.name || product.Name || product.title || '').toLowerCase();
      // Must have Intel or AMD in name for processors
      const hasIntelOrAMD = name.includes('intel') || name.includes('amd') || name.includes('ryzen');
      // Must NOT be a laptop/pc
      const isNotLaptop = !name.includes('laptop') && !name.includes('notebook') && !name.includes('mini pc');
      return hasIntelOrAMD && isNotLaptop;
    }
  },
  
  // PRIORITY 4: RAM / Memory
  'RAM': {
    keywords: [
      'g.skill', 'corsair', 'kingston', 'crucial',
      'ddr4', 'ddr5', 'ddr3',
      'desktop memory', 'ram module',
      'rgb ram', 'trident', 'vengeance', 'ripjaws', 'dominator',
      'expo', 'xmp',
      'dimm', 'sodimm',
      '8gb ddr', '16gb ddr', '32gb ddr', '64gb ddr'
    ],
    priority: 97,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'graphics card', 'gpu', 'ssd', 'hdd']
  },
  
  // PRIORITY 5: Motherboards
  'Motherboards': {
    keywords: [
      'motherboard', 'mobo', 'mainboard',
      // Intel chipsets
      'b650', 'b760', 'b660', 'h610', 'h670', 'h770', 'z690', 'z790', 'z890',
      // AMD chipsets
      'b550', 'b650', 'x570', 'x670', 'x870',
      // Form factors
      'atx', 'matx', 'mini-itx', 'e-atx',
      // Sockets
      'am5', 'am4', 'lga1700', 'lga1200',
      // Brands
      'msi mag', 'gigabyte', 'asus rog', 'asrock',
      'maxsun',
      // Features
      'wifi motherboard', 'sata'
    ],
    priority: 96,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'prebuilt']
  },
  
  // PRIORITY 6: CPU Cooling / Fans
  'Cooling': {
    keywords: [
      'cpu fan', 'cpu cooler', 'aio', 'liquid cooler', 'air cooler',
      'darkflash', 'thermalright', 'noctua', 'cooler master', 'arctic',
      'argb', 'rgb fan',
      '120mm', '140mm', '240mm', '360mm',
      'radiator', 'case fan',
      'thermal paste', 'cooling pad'
    ],
    priority: 95,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Graphics Cards / GPUs
  'Graphics Cards': {
    keywords: [
      'rtx', 'gtx', 'gpu', 'graphics card', 'video card', 'geforce',
      'radeon rx', 'radeon', 'rx 7', 'rx 6', 'rx 5',
      'rtx 5090', 'rtx 5080', 'rtx 5070', 'rtx 5060',
      'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 4060',
      'rtx 3090', 'rtx 3080', 'rtx 3070', 'rtx 3060',
      'gtx 1660', 'gtx 1650'
    ],
    priority: 94,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'monitor', 'display']
  },
  
  // Monitors
  'Monitors': {
    keywords: [
      'monitor', 'display', 'lcd', 'led monitor', 'gaming monitor',
      '24 inch', '27 inch', '32 inch', '34 inch',
      '144hz', '165hz', '240hz', 'curved monitor', 'ultrawide'
    ],
    priority: 90,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'gpu', 'graphics card']
  },
  
  // Motherboards
  'Motherboards': {
    keywords: [
      'motherboard', 'mobo', 'mainboard',
      'b550', 'b650', 'b760', 'x570', 'x670', 'x870',
      'z690', 'z790', 'z890', 'h610', 'h670', 'h770'
    ],
    priority: 85,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // RAM / Memory
  'RAM': {
    keywords: [
      'ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'sodimm',
      '8gb ram', '16gb ram', '32gb ram', '64gb ram',
      'corsair vengeance', 'g.skill', 'kingston fury'
    ],
    priority: 85,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'graphics card', 'gpu']
  },
  
  // Storage (SSD/HDD)
  'Storage': {
    keywords: [
      'ssd', 'hdd', 'nvme', 'm.2', 'hard drive', 'hard disk',
      'solid state', '1tb ssd', '2tb ssd', '500gb ssd',
      'gen3 ssd', 'gen4 ssd', 'gen5 ssd', 'sata ssd'
    ],
    priority: 85,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Power Supply (PSU)
  'Power Supply': {
    keywords: [
      'psu', 'power supply', 'watt psu', '650w', '750w', '850w', '1000w',
      'modular psu', 'semi-modular', '80 plus', 'platinum psu', 'gold psu'
    ],
    priority: 80,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // PC Cases
  'Cases': {
    keywords: [
      'case', 'pc case', 'tower', 'mid tower', 'full tower', 'mini itx case',
      'atx case', 'gaming case', 'rgb case', 'tempered glass case'
    ],
    priority: 80,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'phone', 'mobile']
  },
  
  // Cooling (Fans & Coolers)
  'Cooling': {
    keywords: [
      'cooler', 'cpu cooler', 'aio', 'liquid cooler', 'air cooler',
      'case fan', 'rgb fan', 'radiator', '120mm fan', '140mm fan',
      'thermal paste', 'cooling pad'
    ],
    priority: 75,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Keyboards
  'Keyboards': {
    keywords: [
      'keyboard', 'mechanical keyboard', 'gaming keyboard',
      'wireless keyboard', 'rgb keyboard', 'tkl keyboard',
      'mechanical switches', 'cherry mx'
    ],
    priority: 80,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'combo', 'bundle']
  },
  
  // Mouse
  'Mouse': {
    keywords: [
      'mouse', 'gaming mouse', 'wireless mouse', 'optical mouse',
      'ergonomic mouse', 'rgb mouse', 'dpi mouse'
    ],
    priority: 80,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'pad', 'mousepad', 'combo', 'bundle']
  },
  
  // Headsets / Audio
  'Headsets': {
    keywords: [
      'headset', 'headphone', 'earphone', 'gaming headset',
      'wireless headset', 'usb headset', '7.1 headset',
      'earbuds', 'airpods'
    ],
    priority: 75,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Speakers
  'Speakers': {
    keywords: [
      'speaker', 'speakers', 'soundbar', 'audio system',
      '2.1 speaker', '5.1 speaker', 'bluetooth speaker',
      'gaming speaker', 'desktop speaker'
    ],
    priority: 75,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'headset']
  },
  
  // Webcam
  'Webcams': {
    keywords: [
      'webcam', 'web camera', 'streaming camera',
      '1080p webcam', '4k webcam', 'usb camera'
    ],
    priority: 75,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Controllers / Gamepads
  'Controllers': {
    keywords: [
      'controller', 'gamepad', 'joystick', 'game controller',
      'xbox controller', 'ps5 controller', 'ps4 controller',
      'dualsense', 'dualshock', 'gaming controller'
    ],
    priority: 75,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Networking
  'Networking': {
    keywords: [
      'router', 'wifi', 'wi-fi', 'modem', 'network card',
      'ethernet', 'access point', 'mesh wifi', 'wireless adapter',
      'network switch', 'range extender'
    ],
    priority: 70,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Chairs
  'Chairs': {
    keywords: [
      'chair', 'gaming chair', 'office chair', 'ergonomic chair',
      'racing chair', 'desk chair', 'executive chair'
    ],
    priority: 70,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook']
  },
  
  // Desks
  'Desks': {
    keywords: [
      'desk', 'gaming desk', 'computer desk', 'standing desk',
      'office desk', 'workstation', 'desk setup'
    ],
    priority: 70,
    exactMatch: false,
    excludeKeywords: ['laptop', 'notebook', 'chair']
  }
};

/**
 * Detect the correct category for a product based on its name
 * @param {Object} product - Product object with name/Name/title field
 * @returns {string|null} - Detected category name or null if no match
 */
function detectCategory(product) {
  const productName = (product.name || product.Name || product.title || '').toLowerCase();
  const productBrand = (product.brand || '').toLowerCase();
  
  if (!productName) {
    return null;
  }
  
  let bestMatch = null;
  let bestScore = 0;
  
  // Check each category
  for (const [categoryName, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    let hasKeywordMatch = false;
    
    // Check if any keyword matches (anywhere in the name)
    for (const keyword of config.keywords) {
      if (productName.includes(keyword.toLowerCase())) {
        hasKeywordMatch = true;
        // Longer keywords get higher scores (more specific)
        score += keyword.length;
      }
    }
    
    // Skip if no keyword match
    if (!hasKeywordMatch) {
      continue;
    }
    
    // Check exclude keywords - if any match, skip this category
    let hasExclude = false;
    for (const exclude of config.excludeKeywords) {
      if (productName.includes(exclude.toLowerCase())) {
        hasExclude = true;
        break;
      }
    }
    
    if (hasExclude) {
      continue;
    }
    
    // Run custom validation if exists
    if (config.customValidation && !config.customValidation(product)) {
      continue;
    }
    
    // Add priority to score
    score += config.priority;
    
    // Update best match if this is better
    if (score > bestScore) {
      bestScore = score;
      bestMatch = categoryName;
    }
  }
  
  return bestMatch;
}

/**
 * Validate if a product is correctly categorized
 * @param {Object} product - Product object
 * @returns {Object} - { isCorrect: boolean, detectedCategory: string|null, currentCategory: string }
 */
function validateProductCategory(product) {
  const currentCategory = product.category || '';
  const detectedCategory = detectCategory(product);
  
  return {
    isCorrect: !detectedCategory || currentCategory.toLowerCase() === detectedCategory.toLowerCase(),
    detectedCategory,
    currentCategory
  };
}

/**
 * Get category slug from category name
 * @param {string} categoryName
 * @returns {string}
 */
function getCategorySlug(categoryName) {
  if (!categoryName) return '';
  return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Batch validate products and return statistics
 * @param {Array} products - Array of product objects
 * @returns {Object} - Statistics about categorization
 */
function batchValidateProducts(products) {
  const stats = {
    total: products.length,
    correct: 0,
    incorrect: 0,
    uncategorized: 0,
    byCategory: {}
  };
  
  const incorrectProducts = [];
  
  for (const product of products) {
    const validation = validateProductCategory(product);
    
    if (!product.category) {
      stats.uncategorized++;
    } else if (validation.isCorrect) {
      stats.correct++;
    } else {
      stats.incorrect++;
      incorrectProducts.push({
        id: product._id || product.id,
        name: product.name || product.Name || product.title,
        currentCategory: validation.currentCategory,
        detectedCategory: validation.detectedCategory
      });
    }
    
    // Track by detected category
    if (validation.detectedCategory) {
      if (!stats.byCategory[validation.detectedCategory]) {
        stats.byCategory[validation.detectedCategory] = 0;
      }
      stats.byCategory[validation.detectedCategory]++;
    }
  }
  
  return {
    stats,
    incorrectProducts
  };
}

module.exports = {
  CATEGORY_KEYWORDS,
  detectCategory,
  validateProductCategory,
  getCategorySlug,
  batchValidateProducts
};
