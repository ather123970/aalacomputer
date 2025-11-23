/**
 * Smart Category Matcher
 * Handles flexible category matching with variations like:
 * - "processors" vs "processor type"
 * - "graphics cards" vs "graphics card type"
 * - "cpu coolers" vs "cooling type"
 * etc.
 */

// Define category groups with all known variations
// Based on actual database categories
export const CATEGORY_GROUPS = {
  'cpu coolers': {
    canonical: 'CPU Coolers',
    aliases: ['cpu coolers', 'cpu cooler', 'cooling', 'cooler', 'cooling type', 'cooler type', 'fan', 'aio'],
    keywords: ['cooler', 'cooling', 'fan', 'aio', 'radiator', 'thermal']
  },
  'monitors': {
    canonical: 'Monitors',
    aliases: ['monitors', 'monitor', 'display', 'monitor type', 'display type', 'screen', 'lcd'],
    keywords: ['monitor', 'display', 'screen', '4k', 'gaming monitor']
  },
  'mouse': {
    canonical: 'Mouse',
    aliases: ['mouse', 'mice', 'mouse type', 'gaming mouse', 'wireless mouse'],
    keywords: ['mouse', 'pointer', 'gaming mouse']
  },
  'keyboards': {
    canonical: 'Keyboards',
    aliases: ['keyboards', 'keyboard', 'keyboard type', 'mechanical keyboard'],
    keywords: ['keyboard', 'key', 'mechanical', 'gaming keyboard']
  },
  'laptops': {
    canonical: 'Laptops',
    aliases: ['laptops', 'laptop', 'notebook', 'laptop type', 'gaming laptop', 'ultrabook'],
    keywords: ['laptop', 'notebook', 'gaming laptop', 'ultrabook']
  },
  'graphics cards': {
    canonical: 'Graphics Cards',
    aliases: ['graphics cards', 'graphics card', 'graphics card type', 'gpu', 'gpus', 'gpu type', 'graphics', 'vga', 'video card'],
    keywords: ['graphics', 'gpu', 'rtx', 'gtx', 'radeon', 'geforce', 'vga']
  },
  'power supplies': {
    canonical: 'Power Supplies',
    aliases: ['power supplies', 'power supply', 'psu', 'power supply type', 'psu type', 'smps'],
    keywords: ['power supply', 'psu', 'smps', 'watt']
  },
  'pc cases': {
    canonical: 'PC Cases',
    aliases: ['pc cases', 'pc case', 'case', 'casing', 'case type', 'chassis', 'tower case'],
    keywords: ['case', 'casing', 'chassis', 'tower', 'cabinet']
  },
  'ram': {
    canonical: 'RAM',
    aliases: ['ram', 'memory', 'ddr', 'ddr4', 'ddr5', 'memory type', 'ram type', 'dimm'],
    keywords: ['ram', 'memory', 'ddr', 'dimm', 'sodimm']
  },
  'motherboards': {
    canonical: 'Motherboards',
    aliases: ['motherboards', 'motherboard', 'motherboard type', 'mobo', 'mainboard', 'mb', 'mobo type'],
    keywords: ['motherboard', 'mobo', 'mainboard', 'socket']
  },
  'headsets': {
    canonical: 'Headsets',
    aliases: ['headsets', 'headset', 'headphone', 'headphones', 'headset type', 'gaming headset'],
    keywords: ['headset', 'headphone', 'audio', 'gaming headset']
  },
  'processors': {
    canonical: 'Processors',
    aliases: ['processors', 'processor', 'processor type', 'cpu', 'cpus', 'cpu type', 'processor types'],
    keywords: ['processor', 'cpu', 'intel', 'amd', 'ryzen', 'core i', 'xeon', 'threadripper']
  },
  'storage': {
    canonical: 'Storage',
    aliases: ['storage', 'ssd', 'hdd', 'nvme', 'storage type', 'ssd type', 'hard drive', 'solid state'],
    keywords: ['storage', 'ssd', 'hdd', 'nvme', 'm.2', 'hard drive']
  },
  'deals': {
    canonical: 'Deals',
    aliases: ['deals', 'deal', 'offers', 'offer', 'discount', 'sale', 'special offer'],
    keywords: ['deal', 'offer', 'discount', 'sale', 'special']
  },
  'prebuilds': {
    canonical: 'Prebuilds',
    aliases: ['prebuilds', 'prebuild', 'prebuilt', 'pre-built', 'custom pc', 'gaming pc'],
    keywords: ['prebuild', 'prebuilt', 'custom pc', 'gaming pc']
  },
  'cables & accessories': {
    canonical: 'Cables & Accessories',
    aliases: ['cables & accessories', 'cables and accessories', 'accessories', 'cable', 'cables', 'adapter'],
    keywords: ['cable', 'adapter', 'dock', 'hub', 'accessory']
  },
  'networking': {
    canonical: 'Networking',
    aliases: ['networking', 'network', 'router', 'modem', 'switch', 'wifi'],
    keywords: ['router', 'modem', 'network', 'wifi', 'ethernet']
  },
  'empty': {
    canonical: 'Uncategorized',
    aliases: ['empty', 'uncategorized', 'unknown', 'other', ''],
    keywords: ['empty', 'uncategorized']
  }
};

/**
 * Normalize a category string for matching
 * @param {string} category - Raw category string
 * @returns {string} - Normalized category
 */
export function normalizeCategory(category) {
  if (!category) return '';
  
  const normalized = category.toLowerCase().trim();
  
  // Check each group for a match
  for (const [key, group] of Object.entries(CATEGORY_GROUPS)) {
    if (group.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return group.canonical;
    }
  }
  
  return category; // Return original if no match found
}

/**
 * Check if a product category matches a selected category
 * Handles variations and partial matches
 * @param {string} productCategory - Category from product in database
 * @param {string} selectedCategory - Category selected by user
 * @returns {boolean} - True if categories match
 */
export function categoriesMatch(productCategory, selectedCategory) {
  if (!productCategory || !selectedCategory) return false;
  
  const prodCat = productCategory.toLowerCase().trim();
  const selCat = selectedCategory.toLowerCase().trim();
  
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
  
  // STRICT matching: only match if product category contains the selected category as a complete word
  // e.g., "processor type" matches "processor" but "Dell Intel i7" does NOT match "Intel"
  const prodWords = prodCat.split(/\s+/);
  const selWords = selCat.split(/\s+/);
  
  // Check if all selected words appear in product category
  const allWordsMatch = selWords.every(selWord => 
    prodWords.some(prodWord => prodWord === selWord || prodWord.includes(selWord))
  );
  
  if (allWordsMatch) {
    return true;
  }
  
  return false;
}

/**
 * Get all unique categories from a list of products
 * Returns normalized canonical names
 * @param {Array} products - Array of product objects
 * @returns {Array} - Unique category names
 */
export function getUniqueCategories(products) {
  const categories = new Set();
  
  products.forEach(product => {
    if (product.category) {
      const normalized = normalizeCategory(product.category);
      categories.add(normalized);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Get all category variations from database
 * Useful for debugging and understanding what categories exist
 * @param {Array} products - Array of product objects
 * @returns {Object} - Map of canonical to actual database values
 */
export function getCategoryVariations(products) {
  const variations = {};
  
  products.forEach(product => {
    if (product.category) {
      const normalized = normalizeCategory(product.category);
      if (!variations[normalized]) {
        variations[normalized] = new Set();
      }
      variations[normalized].add(product.category);
    }
  });
  
  // Convert Sets to Arrays
  const result = {};
  for (const [key, set] of Object.entries(variations)) {
    result[key] = Array.from(set);
  }
  
  return result;
}

/**
 * Get category group info
 * @param {string} category - Category name
 * @returns {Object|null} - Category group info or null
 */
export function getCategoryGroup(category) {
  if (!category) return null;
  
  const normalized = category.toLowerCase().trim();
  
  for (const [key, group] of Object.entries(CATEGORY_GROUPS)) {
    if (group.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return group;
    }
  }
  
  return null;
}

export default {
  normalizeCategory,
  categoriesMatch,
  getUniqueCategories,
  getCategoryVariations,
  getCategoryGroup,
  CATEGORY_GROUPS
};
