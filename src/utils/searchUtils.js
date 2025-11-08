/**
 * Advanced Product Search Utility
 * Implements normalized search with synonyms, brand aliases, and smart ranking
 */

// ==================== SYNONYM & ALIAS MAPS ====================

// Category synonyms - map variations to canonical category tokens
const categorySynonyms = {
  'gpu': ['gpu', 'gpus', 'graphics card', 'graphic card', 'graphics', 'vga', 'video card', 'videocard', 'rtx', 'gtx', 'radeon', 'graphics processing unit'],
  'motherboard': ['motherboard', 'motherboards', 'mobo', 'mainboard', 'mb', 'mother board', 'system board'],
  'cpu': ['cpu', 'cpus', 'processor', 'processors', 'intel', 'amd', 'ryzen', 'core i', 'corei', 'ryzen\s*\d', 'threadripper', 'xeon', 'pentium', 'celeron', 'athlon'],
  'ram': ['ram', 'memory', 'ddr', 'ddr4', 'ddr5', 'dimm', 'sodimm', 'memory module', 'ram stick'],
  'storage': ['storage', 'ssd', 'ssds', 'hdd', 'hdds', 'nvme', 'm.2', 'm2', 'hard drive', 'harddrive', 'solid state drive', 'hard disk', 'external hdd', 'external ssd', 'usb drive', 'flash drive', 'pendrive'],
  'psu': ['psu', 'psus', 'power supply', 'smps', 'power', 'power unit', 'power supply unit'],
  'case': ['case', 'cases', 'casing', 'casings', 'chassis', 'pc case', 'computer case', 'tower case', 'mid tower', 'full tower'],
  'cooling': ['cooling', 'cooler', 'coolers', 'fan', 'fans', 'liquid cooling', 'aio', 'radiator', 'cpu cooler', 'case fan', 'thermal paste', 'thermal compound'],
  'monitor': ['monitor', 'monitors', 'display', 'displays', 'screen', 'lcd', 'led', 'gaming monitor', '4k monitor', 'ultrawide', 'curved monitor'],
  'keyboard': ['keyboard', 'keyboards', 'key board', 'keys', 'mechanical keyboard', 'gaming keyboard', 'wireless keyboard'],
  'mouse': ['mouse', 'mice', 'pointer', 'gaming mouse', 'wireless mouse', 'optical mouse', 'laser mouse'],
  'headset': ['headset', 'headsets', 'headphone', 'headphones', 'earphone', 'earphones', 'audio', 'gaming headset', 'wireless headset', 'bluetooth headset'],
  'laptop': ['laptop', 'laptops', 'notebook', 'notebooks', 'gaming laptop', 'ultrabook', '2 in 1', 'convertible', 'chromebook'],
  'deals': ['deal', 'deals', 'offer', 'offers', 'discount', 'sale', 'clearance', 'special offer'],
  'prebuilds': ['prebuild', 'prebuilds', 'pre-build', 'pre build', 'prebuilt', 'pre-built', 'custom pc', 'gaming pc'],
  'pc': ['pc', 'pcs', 'computer', 'computers', 'desktop', 'desktops', 'system', 'workstation', 'all in one', 'all-in-one'],
  'accessories': ['accessory', 'accessories', 'cable', 'cables', 'adapter', 'adapters', 'dock', 'docking station', 'hub', 'usb hub'],
  'networking': ['router', 'routers', 'switch', 'switches', 'modem', 'modems', 'network', 'networking', 'wifi', 'ethernet', 'access point', 'range extender'],
  'software': ['software', 'os', 'operating system', 'antivirus', 'office', 'microsoft office', 'windows', 'windows 10', 'windows 11', 'license', 'antivirus software']
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
 * Check if a token matches any category pattern
 */
function isCategoryMatch(token, categoryPatterns) {
  // Direct match check
  if (categoryPatterns.includes(token)) {
    return true;
  }
  
  // Regex pattern check for patterns like 'ryzen\s*\\d'
  return categoryPatterns.some(pattern => {
    try {
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(token);
    } catch (e) {
      return false;
    }
  });
}

/**
 * Detect category from query tokens with priority to exact matches
 */
function detectCategory(queryTokens) {
  // First, try to find exact multi-word category matches
  const queryString = queryTokens.join(' ').toLowerCase();
  for (const [canonical, synonyms] of Object.entries(categorySynonyms)) {
    // Check if any synonym is a multi-word phrase in the query
    for (const synonym of synonyms) {
      if (synonym.includes(' ') && queryString.includes(synonym)) {
        return canonical;
      }
    }
  }
  
  // Then check individual tokens
  for (const token of queryTokens) {
    for (const [canonical, synonyms] of Object.entries(categorySynonyms)) {
      if (isCategoryMatch(token, synonyms)) {
        return canonical;
      }
    }
  }
  
  // Special handling for known product models that might be confused as categories
  const modelCategoryMap = {
    // Graphics Cards
    'rtx': 'gpu',
    'gtx': 'gpu',
    'rx': 'gpu',
    'radeon': 'gpu',
    'geforce': 'gpu',
    'rtx\s*\d+': 'gpu',
    'gtx\s*\d+': 'gpu',
    'rx\s*\d+': 'gpu',
    
    // Processors
    'i3': 'cpu',
    'i5': 'cpu',
    'i7': 'cpu',
    'i9': 'cpu',
    'ryzen\s*\d': 'cpu',
    'threadripper': 'cpu',
    'xeon': 'cpu',
    'core\s*i\s*\d': 'cpu',
    
    // Storage
    'ssd': 'storage',
    'hdd': 'storage',
    'nvme': 'storage',
    'm\.2': 'storage',
    'sata': 'storage',
    
    // Monitors
    'monitor': 'monitor',
    'display': 'monitor',
    'screen': 'monitor',
    
    // Laptops
    'laptop': 'laptop',
    'notebook': 'laptop',
    'ultrabook': 'laptop',
    'chromebook': 'laptop'
  };
  
  // Check for model number patterns
  for (const [pattern, category] of Object.entries(modelCategoryMap)) {
    const regex = new RegExp(`^${pattern}$`, 'i');
    if (queryTokens.some(token => regex.test(token))) {
      return category;
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
 * Calculate match score for a product with enhanced matching
 */
function calculateScore(product, queryTokens, detectedCategory, detectedBrand, originalQuery, productIdentifiers = []) {
  let score = 0;
  const lowerQuery = originalQuery.toLowerCase();
  const productName = product.displayName.toLowerCase();
  const productModel = (product.model || '').toLowerCase();
  
  // 1. Exact matches (highest priority)
  // Exact category match
  if (detectedCategory && product.categoryNormalized === detectedCategory) {
    score += 150; // Increased weight for exact category match
  }
  
  // Exact brand match
  if (detectedBrand && product.brandNormalized === detectedBrand) {
    score += 100; // Increased weight for exact brand match
  }
  
  // Exact name or model match
  if (productName === lowerQuery || productModel === lowerQuery) {
    score += 200; // Very high score for exact match
  }
  
  // 2. Product identifier matches (model numbers, etc.)
  if (productIdentifiers.length > 0) {
    const productText = `${productName} ${productModel}`;
    const hasMatchingIdentifier = productIdentifiers.some(id => 
      productText.includes(id.toLowerCase())
    );
    
    if (hasMatchingIdentifier) {
      score += 120; // High score for matching product identifiers
      
      // Extra points if the identifier is in the model
      if (productModel && productIdentifiers.some(id => 
        productModel.includes(id.toLowerCase())
      )) {
        score += 50;
      }
    }
  }
  
  // 3. Partial matches in name and model
  // Name contains the entire query as substring
  if (productName.includes(lowerQuery)) {
    score += 80;
  }
  
  // Model contains the entire query as substring
  if (productModel && productModel.includes(lowerQuery)) {
    score += 90; // Slightly higher weight for model matches
  }
  
  // 4. Token-based matching
  const nameTokens = productName.split(/\s+/);
  const modelTokens = productModel ? productModel.split(/\s+/) : [];
  const allTokens = [...new Set([...nameTokens, ...modelTokens])];
  
  // Count exact token matches
  const exactTokenMatches = queryTokens.filter(token => 
    allTokens.includes(token)
  ).length;
  score += exactTokenMatches * 30;
  
  // 5. Partial token matches (for typos or partial input)
  const partialTokenMatches = queryTokens.reduce((count, queryToken) => {
    if (queryToken.length <= 2) return count; // Skip very short tokens
    
    // Check for tokens that start with the query token
    const startsWithMatches = allTokens.filter(t => 
      t.startsWith(queryToken)
    ).length;
    
    // Check for tokens that contain the query token
    const containsMatches = allTokens.filter(t => 
      t.includes(queryToken) && !t.startsWith(queryToken)
    ).length;
    
    return count + startsWithMatches * 2 + containsMatches;
  }, 0);
  
  score += partialTokenMatches * 10;
  
  // 6. Brand and category matches
  // Brand name appears in query
  if (product.brandNormalized && lowerQuery.includes(product.brandNormalized)) {
    score += 60;
  }
  
  // Category name appears in query
  if (product.categoryNormalized && lowerQuery.includes(product.categoryNormalized)) {
    score += 50;
  }
  
  // 7. Description and other fields (lower weight)
  if (product.description) {
    const descLower = product.description.toLowerCase();
    const descMatches = queryTokens.filter(token => 
      descLower.includes(token)
    ).length;
    score += descMatches * 5;
  }
  
  // 8. Search string match (fallback)
  if (product.searchString && product.searchString.includes(lowerQuery)) {
    score += 20;
  }
  
  // 9. Penalize partial matches in wrong categories
  if (detectedCategory && product.categoryNormalized !== detectedCategory) {
    // Only apply penalty if we have a strong category match
    if (score > 0) {
      score = Math.max(1, score * 0.3); // Reduce score significantly
    }
  }
  
  return Math.round(score);
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
 * Extract model numbers and other product identifiers from query
 */
function extractProductIdentifiers(queryTokens) {
  const modelPatterns = [
    // GPU models
    /^(rtx|gtx|rx|radeon|geforce)\s*\d+/i,
    /^rtx\s*\d+/i,
    /^gtx\s*\d+/i,
    /^rx\s*\d+/i,
    /^radeon\s*(rx|pro)\s*\d+/i,
    
    // CPU models
    /^(i[3579]|ryzen\s*[3579]|ryzen\s*\d+)/i,
    /^core\s*(i[3579]|\d+[th]\s*gen)/i,
    /^(ryzen|athlon|phenom|fx|a[0-9]|e[0-9])\s*\d*/i,
    /^xeon\s*\w*/i,
    /^threadripper\s*\d*/i,
    
    // Other common product identifiers
    /^[a-z]+\s*\d+[a-z]*/i,  // Generic pattern for model numbers
    /^[a-z]\d+/i,            // Single letter followed by numbers (e.g., A12, B450)
    /^[a-z]+\s*[a-z]?\d+[a-z]*/i  // Words followed by numbers (e.g., MacBook Pro 16)
  ];
  
  return queryTokens.filter(token => 
    modelPatterns.some(pattern => pattern.test(token))
  );
}

/**
 * Main search function with enhanced category and product matching
 */
export function searchProducts(products, query, options = {}) {
  const {
    minScore = 5,
    maxResults = 50,
    fuzzyThreshold = 2,
    strictCategory = true  // New option to enforce strict category matching
  } = options;
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const originalQuery = query.trim().toLowerCase();
  const queryTokens = tokenize(originalQuery);
  
  if (queryTokens.length === 0) {
    return [];
  }
  
  // Extract product identifiers and remove them from search tokens
  const productIdentifiers = extractProductIdentifiers(queryTokens);
  const searchTokens = queryTokens.filter(token => !productIdentifiers.includes(token));
  
  // Detect category and brand from query
  const detectedCategory = detectCategory(queryTokens);
  const detectedBrand = detectBrand(queryTokens);
  
  // If we have a detected category, filter products first to improve performance
  let filteredProducts = products;
  if (strictCategory && detectedCategory) {
    filteredProducts = products.filter(
      product => product.categoryNormalized === detectedCategory
    );
  }
  
  // If we have a detected brand, filter by brand
  if (detectedBrand) {
    filteredProducts = filteredProducts.filter(
      product => product.brandNormalized === detectedBrand
    );
  }
  
  // Score all remaining products
  let candidates = filteredProducts.map(product => {
    const score = calculateScore(
      product, 
      searchTokens, 
      detectedCategory, 
      detectedBrand, 
      originalQuery,
      productIdentifiers
    );
    return { product, score };
  });
  
  // Filter by minimum score
  candidates = candidates.filter(({ score }) => score >= minScore);
  
  // If no results with strict category, try without category filter
  if (candidates.length === 0 && strictCategory && detectedCategory) {
    return searchProducts(products, query, { ...options, strictCategory: false });
  }
  
  // If still no results, try fuzzy matching
  if (candidates.length === 0) {
    candidates = products.map(product => {
      let fuzzyScore = 0;
      
      // Check fuzzy match on product name tokens
      for (const queryToken of queryTokens) {
        // Skip very short tokens for fuzzy matching
        if (queryToken.length <= 2) continue;
        
        // Check against product name tokens
        for (const nameToken of product.nameTokens) {
          if (nameToken.length <= 2) continue;
          
          const distance = levenshteinDistance(queryToken, nameToken);
          if (distance <= fuzzyThreshold) {
            // Higher score for closer matches
            fuzzyScore += (fuzzyThreshold - distance + 1) * 15;
            
            // Bonus for matching at the start of words
            if (nameToken.startsWith(queryToken)) {
              fuzzyScore += 10;
            }
          }
        }
        
        // Check against product model if available
        if (product.model) {
          const modelTokens = tokenize(product.model.toLowerCase());
          for (const modelToken of modelTokens) {
            if (modelToken.length <= 2) continue;
            
            const distance = levenshteinDistance(queryToken, modelToken);
            if (distance <= fuzzyThreshold) {
              fuzzyScore += (fuzzyThreshold - distance + 1) * 20; // Higher weight for model matches
            }
          }
        }
      }
      
      // Check fuzzy match on brand
      if (product.brandNormalized) {
        const distance = levenshteinDistance(originalQuery, product.brandNormalized);
        if (distance <= fuzzyThreshold) {
          fuzzyScore += 25; // Slightly higher weight for brand matches
        }
      }
      
      // Check for product identifiers in the product name or model
      if (productIdentifiers.length > 0) {
        const productText = `${product.name} ${product.model || ''}`.toLowerCase();
        if (productIdentifiers.some(id => productText.includes(id.toLowerCase()))) {
          fuzzyScore += 50; // Significant boost for matching product identifiers
        }
      }
      
      return { product, score: fuzzyScore };
    }).filter(({ score }) => score > 0);
    
    // If we have fuzzy matches, apply category filter if detected
    if (detectedCategory) {
      candidates = candidates.filter(({ product }) => 
        !strictCategory || product.categoryNormalized === detectedCategory
      );
    }
  }
  
  // Sort by score (highest first)
  candidates.sort((a, b) => b.score - a.score);
  
  // Group by category if no specific category was requested
  const results = [];
  if (!detectedCategory && candidates.length > 0) {
    const categories = new Map();
    
    for (const { product, score } of candidates) {
      const category = product.categoryNormalized || 'other';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push({ product, score });
    }
    
    // Get top results from each category
    for (const [category, items] of categories.entries()) {
      const topItems = items
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(5, maxResults / 2)) // Limit per category
        .map(({ product }) => product);
      
      results.push(...topItems);
      
      if (results.length >= maxResults) {
        break;
      }
    }
    
    return results.slice(0, maxResults);
  }
  
  // Return top results from the single category
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
