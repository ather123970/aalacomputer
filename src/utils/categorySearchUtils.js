/**
 * Generic Category Search Utilities
 * Works for ANY product category (GPUs, CPUs, RAM, etc.)
 */

/**
 * Define all product categories with their keywords
 */
const CATEGORY_KEYWORDS = {
  'Graphics Cards': {
    keywords: ['gpu', 'graphics card', 'video card', 'graphics', 'rtx', 'gtx', 'radeon', 'rx', 'geforce', 'amd', 'nvidia', 'graphics processor', 'discrete graphics', 'vram', 'cuda', 'tensor', 'ray tracing', 'dlss', 'fsr'],
    models: [/rtx\s*\d+/i, /gtx\s*\d+/i, /rx\s*\d+/i, /radeon\s*rx/i, /geforce\s*rtx/i, /geforce\s*gtx/i, /tesla\s*\w+/i, /quadro\s*\w+/i, /arc\s*\w+/i],
    brands: ['nvidia', 'amd', 'asus', 'msi', 'gigabyte', 'zotac', 'pny', 'xfx', 'sapphire', 'powercolor', 'palit', 'galax']
  },
  'Processors': {
    keywords: ['cpu', 'processor', 'core', 'ghz', 'intel', 'amd', 'ryzen', 'core i', 'xeon', 'threadripper', 'athlon'],
    models: [/core\s*i[3579]/i, /ryzen\s*\d+/i, /ryzen\s*[3579]/i, /xeon\s*\w+/i, /threadripper\s*\d+/i, /athlon\s*\d+/i],
    brands: ['intel', 'amd']
  },
  'RAM': {
    keywords: ['ram', 'memory', 'ddr', 'ddr4', 'ddr5', 'gb', 'mhz', 'corsair', 'kingston', 'crucial', 'g.skill'],
    models: [/ddr[45]/i, /\d+gb/i, /\d+mhz/i],
    brands: ['corsair', 'kingston', 'g.skill', 'crucial', 'xpg', 'teamgroup']
  },
  'Storage': {
    keywords: ['ssd', 'hdd', 'storage', 'nvme', 'm.2', 'drive', 'disk', 'samsung', 'western digital', 'seagate'],
    models: [/nvme/i, /m\.2/i, /ssd/i, /hdd/i],
    brands: ['samsung', 'kingston', 'western digital', 'wd', 'seagate', 'crucial', 'xpg']
  },
  'Motherboards': {
    keywords: ['motherboard', 'mobo', 'mainboard', 'socket', 'chipset', 'b450', 'b550', 'z690', 'x570', 'lga'],
    models: [/b\d{3}/i, /x\d{3}/i, /z\d{3}/i, /lga\d+/i],
    brands: ['asus', 'msi', 'gigabyte', 'asrock', 'biostar']
  },
  'Power Supplies': {
    keywords: ['psu', 'power supply', 'watt', 'w', 'modular', 'semi-modular', 'cooler master', 'corsair', 'thermaltake'],
    models: [/\d+w/i, /watt/i],
    brands: ['cooler master', 'corsair', 'thermaltake', 'deepcool', 'gigabyte', 'msi', 'super flower', 'antec']
  },
  'CPU Coolers': {
    keywords: ['cooler', 'cooling', 'fan', 'heatsink', 'tower', 'aio', 'liquid', 'air cooler'],
    models: [/aio/i, /tower/i],
    brands: ['cooler master', 'deepcool', 'nzxt', 'thermalright', 'id-cooling', 'arctic', 'corsair', 'noctua']
  },
  'PC Cases': {
    keywords: ['case', 'chassis', 'tower', 'atx', 'itx', 'mid-tower', 'full-tower', 'tempered glass'],
    models: [/atx/i, /itx/i, /tower/i],
    brands: ['lian li', 'cooler master', 'deepcool', 'nzxt', 'cougar', 'thermaltake', 'darkflash']
  },
  'Monitors': {
    keywords: ['monitor', 'display', 'screen', 'hz', 'refresh rate', '144hz', '165hz', '240hz', 'ips', 'va', 'tn'],
    models: [/\d+hz/i, /\d+"/i],
    brands: ['asus', 'msi', 'samsung', 'dell', 'gigabyte', 'viewsonic', 'aoc', 'hp', 'lg', 'benq']
  },
  'Keyboards': {
    keywords: ['keyboard', 'mechanical', 'switch', 'rgb', 'wireless', 'gaming keyboard', 'keycap'],
    models: [/mechanical/i, /switch/i],
    brands: ['logitech', 'redragon', 'fantech', 'razer', 'corsair', 'hyperx', 'mchose', 'black shark', 'msi']
  },
  'Mouse': {
    keywords: ['mouse', 'gaming mouse', 'dpi', 'sensor', 'wireless', 'rgb', 'ergonomic'],
    models: [/dpi/i],
    brands: ['razer', 'logitech', 'bloody', 'fantech', 'redragon', 'mchose', 'corsair', 'hyperx', 'msi']
  },
  'Headsets': {
    keywords: ['headset', 'headphone', 'audio', 'surround sound', '7.1', 'wireless', 'gaming headset'],
    models: [/7\.1/i, /5\.1/i],
    brands: ['hyperx', 'razer', 'redragon', 'fantech', 'logitech', 'corsair', 'jbl', 'steelseries', 'boost']
  },
  'Laptops': {
    keywords: ['laptop', 'notebook', 'portable', 'ultrabook', 'gaming laptop', 'workstation'],
    models: [/pro/i, /air/i],
    brands: ['asus', 'msi', 'lenovo', 'dell', 'hp', 'acer', 'gigabyte', 'apple']
  },
  'Networking': {
    keywords: ['router', 'wifi', 'network', 'ethernet', 'modem', 'switch', 'mesh'],
    models: [/wifi\s*\d/i, /mesh/i],
    brands: ['tp-link', 'tenda', 'd-link', 'ubiquiti', 'cisco']
  },
  'Cables & Accessories': {
    keywords: ['cable', 'adapter', 'connector', 'usb', 'hdmi', 'displayport', 'accessory', 'stand', 'mount'],
    models: [/usb/i, /hdmi/i, /displayport/i],
    brands: ['universal', 'cablemod', 'generic', 'ugreen', 'amaze']
  }
};

/**
 * Detect which category a search query is about
 */
export function detectSearchCategory(query) {
  if (!query) return null;
  
  const lowerQuery = query.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    
    // Check keywords
    config.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        score += 10;
      }
    });
    
    // Check models
    config.models.forEach(pattern => {
      if (pattern.test(lowerQuery)) {
        score += 20;
      }
    });
    
    // Check brands
    config.brands.forEach(brand => {
      if (lowerQuery.includes(brand)) {
        score += 15;
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }
  
  return bestScore > 0 ? bestMatch : null;
}

/**
 * Check if a product belongs to a specific category
 */
export function isProductInCategory(product, category) {
  if (!product || !category) return false;
  
  const config = CATEGORY_KEYWORDS[category];
  if (!config) return false;
  
  const name = (product.name || product.title || product.Name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  
  // Check category field first (most reliable)
  if (productCategory.includes(category.toLowerCase())) {
    return true;
  }
  
  // Check keywords
  const hasKeyword = config.keywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
  
  // Check models
  const hasModel = config.models.some(pattern => 
    pattern.test(name) || pattern.test(description)
  );
  
  // Check brands
  const hasBrand = config.brands.some(b => 
    brand.includes(b) || name.includes(b)
  );
  
  return hasKeyword || hasModel || (hasBrand && (hasKeyword || hasModel));
}

/**
 * Calculate relevance score for a product in a category
 */
export function calculateCategoryRelevanceScore(product, query, category) {
  let score = 0;
  
  const name = (product.name || product.title || product.Name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  
  const config = CATEGORY_KEYWORDS[category];
  if (!config) return 0;
  
  // Category match (highest priority)
  if (productCategory.includes(category.toLowerCase())) {
    score += 100;
  }
  
  // Exact query match in name
  if (name === lowerQuery) {
    score += 200;
  }
  
  // Query contains in name
  if (name.includes(lowerQuery)) {
    score += 80;
  }
  
  // Model number match
  config.models.forEach(pattern => {
    if (pattern.test(name)) {
      if (lowerQuery.match(pattern)) {
        score += 100;
      } else {
        score += 40;
      }
    }
  });
  
  // Brand match
  config.brands.forEach(b => {
    if (brand.includes(b) && lowerQuery.includes(b)) {
      score += 60;
    } else if (brand.includes(b)) {
      score += 20;
    }
  });
  
  // Keyword matches
  config.keywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      if (name.includes(keyword)) {
        score += 50;
      } else if (description.includes(keyword)) {
        score += 20;
      }
    }
  });
  
  // Token matching
  const queryWords = lowerQuery.split(/\s+/);
  const nameWords = name.split(/\s+/);
  const matchingWords = queryWords.filter(word => nameWords.some(nw => nw.includes(word)));
  score += matchingWords.length * 15;
  
  return score;
}

/**
 * Search products by category
 */
export function searchByCategory(products, query, category, options = {}) {
  const {
    maxResults = 20,
    minScore = 0
  } = options;
  
  if (!category) return [];
  
  // Filter products in category
  const categoryProducts = products.filter(p => isProductInCategory(p, category));
  
  // Score and sort
  const scored = categoryProducts.map(product => ({
    ...product,
    categoryScore: calculateCategoryRelevanceScore(product, query, category)
  }))
  .filter(p => p.categoryScore >= minScore)
  .sort((a, b) => b.categoryScore - a.categoryScore)
  .slice(0, maxResults);
  
  return scored;
}

/**
 * Get all categories
 */
export function getAllCategories() {
  return Object.keys(CATEGORY_KEYWORDS);
}

/**
 * Format category search results
 */
export function formatCategorySearchResults(products, query, category) {
  const results = searchByCategory(products, query, category, {
    maxResults: 20,
    minScore: 5
  });
  
  return {
    query,
    category,
    totalResults: results.length,
    results: results.map(p => ({
      id: p.id || p._id,
      name: p.name || p.title || p.Name || 'Unnamed Product',
      brand: p.brand || 'Unknown Brand',
      price: p.price || 0,
      image: p.img || p.imageUrl || p.image || '/placeholder.svg',
      category: p.category || category,
      description: p.description || '',
      specs: p.specs || p.Spec || [],
      url: `/product/${p.id || p._id}`
    })),
    message: results.length === 0 
      ? `No ${category} found matching "${query}". Try different search terms.` 
      : `Found ${results.length} ${category}${results.length !== 1 ? 's' : ''} matching "${query}"`
  };
}

/**
 * Get category suggestions based on query
 */
export function getCategorySuggestions(query) {
  if (!query || query.length < 2) {
    return Object.keys(CATEGORY_KEYWORDS).map(cat => ({
      value: cat,
      label: cat,
      isCategory: true
    }));
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return Object.keys(CATEGORY_KEYWORDS)
    .filter(cat => cat.toLowerCase().includes(lowerQuery))
    .map(cat => ({
      value: cat,
      label: cat,
      isCategory: true
    }))
    .slice(0, 5);
}
