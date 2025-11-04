/**
 * Advanced Product Search Utility
 * Implements normalized search with synonyms, brand aliases, and smart ranking
 */

// ==================== SYNONYM & ALIAS MAPS ====================

// Category synonyms - map variations to canonical category tokens
const categorySynonyms = {
  'gpu': ['gpu', 'gpus', 'graphics card', 'graphic card', 'graphics', 'vga', 'video card', 'videocard'],
  'motherboard': ['motherboard', 'motherboards', 'mobo', 'mainboard', 'mb', 'mother board'],
  'cpu': ['cpu', 'cpus', 'processor', 'processors', 'intel', 'amd', 'ryzen'],
  'ram': ['ram', 'memory', 'ddr', 'ddr4', 'ddr5', 'dimm'],
  'storage': ['storage', 'ssd', 'ssds', 'hdd', 'hdds', 'nvme', 'm.2', 'm2', 'hard drive', 'harddrive'],
  'psu': ['psu', 'psus', 'power supply', 'smps', 'power'],
  'case': ['case', 'cases', 'casing', 'casings', 'chassis', 'pc case'],
  'cooling': ['cooling', 'cooler', 'coolers', 'fan', 'fans', 'liquid cooling', 'aio', 'radiator'],
  'monitor': ['monitor', 'monitors', 'display', 'displays', 'screen', 'lcd', 'led'],
  'keyboard': ['keyboard', 'keyboards', 'key board', 'keys'],
  'mouse': ['mouse', 'mice', 'pointer', 'gaming mouse'],
  'headset': ['headset', 'headsets', 'headphone', 'headphones', 'earphone', 'earphones', 'audio'],
  'laptop': ['laptop', 'laptops', 'notebook', 'notebooks'],
  'deals': ['deal', 'deals', 'offer', 'offers', 'discount', 'sale'],
  'prebuilds': ['prebuild', 'prebuilds', 'pre-build', 'pre build', 'prebuilt'],
  'pc': ['pc', 'pcs', 'computer', 'computers', 'desktop', 'desktops', 'system']
};

// Brand aliases - normalize brand name variations
const brandAliases = {
  'asus': ['asus', 'asustek'],
  'msi': ['msi', 'micro star', 'micro-star'],
  'gigabyte': ['gigabyte', 'giga byte'],
  'corsair': ['corsair', 'corsair gaming'],
  'cooler master': ['cooler master', 'coolermaster', 'cm'],
  'western digital': ['wd', 'western digital', 'westerndigital'],
  'thermaltake': ['thermaltake', 'thermal take', 'tt'],
  'nzxt': ['nzxt', 'nz xt'],
  'g.skill': ['g.skill', 'gskill', 'g skill'],
  'kingston': ['kingston', 'king ston'],
  'nvidia': ['nvidia', 'nvdia', 'nvidea'],
  'intel': ['intel', 'intell'],
  'amd': ['amd', 'advanced micro devices'],
  'samsung': ['samsung', 'sam sung'],
  'logitech': ['logitech', 'logi'],
  'razer': ['razer', 'razor'],
  'redragon': ['redragon', 'red dragon'],
  'hyperx': ['hyperx', 'hyper x', 'hyper-x'],
  'seagate': ['seagate', 'sea gate'],
  'crucial': ['crucial', 'cruical'],
  'adata': ['adata', 'a-data'],
  'deepcool': ['deepcool', 'deep cool'],
  'asrock': ['asrock', 'as rock'],
  'zotac': ['zotac', 'zo tac'],
  'pny': ['pny'],
  'xpg': ['xpg', 'x pg'],
  'hikvision': ['hikvision', 'hik vision'],
  'antec': ['antec'],
  'silverstone': ['silverstone', 'silver stone'],
  'lian li': ['lian li', 'lianli', 'lian-li'],
  'arctic': ['arctic'],
  'dell': ['dell'],
  'acer': ['acer'],
  'lg': ['lg'],
  'viewsonic': ['viewsonic', 'view sonic'],
  'bloody': ['bloody', 'a4tech bloody'],
  'a4tech': ['a4tech', 'a4 tech'],
  'fantech': ['fantech', 'fan tech'],
  'ugreen': ['ugreen', 'u green'],
  'orico': ['orico'],
  'vention': ['vention'],
  'hp': ['hp', 'hewlett packard'],
  'lenovo': ['lenovo'],
  'anker': ['anker']
};

// ==================== NORMALIZATION FUNCTIONS ====================

/**
 * Normalize a category string to canonical form
 */
export function normalizeCategory(category) {
  if (!category) return 'other';
  const lower = category.toLowerCase().trim();
  
  // Find canonical category
  for (const [canonical, synonyms] of Object.entries(categorySynonyms)) {
    if (synonyms.includes(lower)) {
      return canonical;
    }
  }
  
  return lower;
}

/**
 * Normalize a brand string to canonical form
 */
export function normalizeBrand(brand) {
  if (!brand) return '';
  const lower = brand.toLowerCase().trim();
  
  // Find canonical brand
  for (const [canonical, aliases] of Object.entries(brandAliases)) {
    if (aliases.includes(lower)) {
      return canonical;
    }
  }
  
  return lower;
}

/**
 * Tokenize a string into lowercase word tokens
 */
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Normalize a product into a searchable structure
 */
export function normalizeProduct(product) {
  const displayName = product.title || product.name || product.Name || 'Unnamed Product';
  const categoryRaw = product.category || 'other';
  const brandRaw = product.brand || '';
  const description = product.description || (Array.isArray(product.specs) ? product.specs.join(' ') : '') || '';
  
  const categoryNormalized = normalizeCategory(categoryRaw);
  const brandNormalized = normalizeBrand(brandRaw);
  const nameTokens = tokenize(displayName);
  const descriptionTokens = tokenize(description);
  
  // Create a comprehensive search string
  const searchString = [
    categoryNormalized,
    brandNormalized,
    displayName,
    description,
    categoryRaw,
    brandRaw
  ].join(' ').toLowerCase();
  
  return {
    ...product,
    displayName,
    categoryNormalized,
    brandNormalized,
    nameTokens,
    descriptionTokens,
    searchString,
    _original: product
  };
}

// ==================== SEARCH LOGIC ====================

/**
 * Detect category token from query
 */
function detectCategory(queryTokens) {
  for (const token of queryTokens) {
    for (const [canonical, synonyms] of Object.entries(categorySynonyms)) {
      if (synonyms.includes(token)) {
        return canonical;
      }
    }
  }
  return null;
}

/**
 * Detect brand token from query
 */
function detectBrand(queryTokens) {
  for (const token of queryTokens) {
    for (const [canonical, aliases] of Object.entries(brandAliases)) {
      if (aliases.includes(token)) {
        return canonical;
      }
    }
  }
  return null;
}

/**
 * Calculate match score for a product
 */
function calculateScore(product, queryTokens, detectedCategory, detectedBrand, originalQuery) {
  let score = 0;
  
  // Exact category match (highest priority)
  if (detectedCategory && product.categoryNormalized === detectedCategory) {
    score += 100;
  }
  
  // Exact brand match (high priority)
  if (detectedBrand && product.brandNormalized === detectedBrand) {
    score += 80;
  }
  
  // Exact name substring match
  if (product.displayName.toLowerCase().includes(originalQuery.toLowerCase())) {
    score += 60;
  }
  
  // Token matches in name
  const nameMatches = queryTokens.filter(token => 
    product.nameTokens.includes(token)
  ).length;
  score += nameMatches * 20;
  
  // Brand in query matches product brand
  if (product.brandNormalized && originalQuery.toLowerCase().includes(product.brandNormalized)) {
    score += 40;
  }
  
  // Category in query matches product category
  if (product.categoryNormalized && originalQuery.toLowerCase().includes(product.categoryNormalized)) {
    score += 30;
  }
  
  // Description token matches
  const descMatches = queryTokens.filter(token =>
    product.descriptionTokens.includes(token)
  ).length;
  score += descMatches * 5;
  
  // Substring match in search string
  if (product.searchString.includes(originalQuery.toLowerCase())) {
    score += 10;
  }
  
  return score;
}

/**
 * Simple fuzzy match using Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Main search function
 */
export function searchProducts(products, query, options = {}) {
  const {
    minScore = 5,
    maxResults = 50,
    fuzzyThreshold = 2
  } = options;
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const originalQuery = query.trim();
  const queryTokens = tokenize(originalQuery);
  
  if (queryTokens.length === 0) {
    return [];
  }
  
  // Detect category and brand from query
  const detectedCategory = detectCategory(queryTokens);
  const detectedBrand = detectBrand(queryTokens);
  
  // Filter and score products
  let candidates = products.map(product => {
    const score = calculateScore(product, queryTokens, detectedCategory, detectedBrand, originalQuery);
    return { product, score };
  });
  
  // Apply category filter if detected
  if (detectedCategory) {
    candidates = candidates.filter(({ product }) => 
      product.categoryNormalized === detectedCategory
    );
  }
  
  // Apply brand filter if detected
  if (detectedBrand) {
    candidates = candidates.filter(({ product }) =>
      product.brandNormalized === detectedBrand
    );
  }
  
  // Filter by minimum score
  candidates = candidates.filter(({ score }) => score >= minScore);
  
  // If no results, try fuzzy matching
  if (candidates.length === 0) {
    candidates = products.map(product => {
      let fuzzyScore = 0;
      
      // Check fuzzy match on product name tokens
      for (const queryToken of queryTokens) {
        for (const nameToken of product.nameTokens) {
          const distance = levenshteinDistance(queryToken, nameToken);
          if (distance <= fuzzyThreshold) {
            fuzzyScore += (fuzzyThreshold - distance + 1) * 10;
          }
        }
      }
      
      // Check fuzzy match on brand
      if (product.brandNormalized) {
        const distance = levenshteinDistance(originalQuery.toLowerCase(), product.brandNormalized);
        if (distance <= fuzzyThreshold) {
          fuzzyScore += 20;
        }
      }
      
      return { product, score: fuzzyScore };
    }).filter(({ score }) => score > 0);
  }
  
  // Sort by score (highest first)
  candidates.sort((a, b) => b.score - a.score);
  
  // Return top results
  return candidates.slice(0, maxResults).map(({ product }) => product);
}

/**
 * Pre-compute search indexes for performance
 */
export function buildSearchIndex(products) {
  const categoryIndex = {};
  const brandIndex = {};
  
  products.forEach((product, index) => {
    // Category index
    const cat = product.categoryNormalized;
    if (!categoryIndex[cat]) {
      categoryIndex[cat] = [];
    }
    categoryIndex[cat].push(index);
    
    // Brand index
    const brand = product.brandNormalized;
    if (brand) {
      if (!brandIndex[brand]) {
        brandIndex[brand] = [];
      }
      brandIndex[brand].push(index);
    }
  });
  
  return { categoryIndex, brandIndex };
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(query) {
  const suggestions = [];
  const queryLower = query.toLowerCase().trim();
  
  // Suggest categories
  for (const [canonical, synonyms] of Object.entries(categorySynonyms)) {
    if (synonyms.some(syn => syn.startsWith(queryLower))) {
      suggestions.push({ type: 'category', value: canonical, display: canonical.toUpperCase() });
    }
  }
  
  // Suggest brands
  for (const [canonical, aliases] of Object.entries(brandAliases)) {
    if (aliases.some(alias => alias.startsWith(queryLower))) {
      suggestions.push({ 
        type: 'brand', 
        value: canonical, 
        display: canonical.charAt(0).toUpperCase() + canonical.slice(1) 
      });
    }
  }
  
  return suggestions.slice(0, 5);
}
