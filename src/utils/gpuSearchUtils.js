/**
 * GPU Search Utilities
 * Specialized search for GPU/Graphics Card products
 */

/**
 * Check if a query is GPU-related
 */
export function isGPUQuery(query) {
  if (!query) return false;
  
  const lowerQuery = query.toLowerCase().trim();
  
  // GPU-related keywords
  const gpuKeywords = [
    'gpu',
    'graphics card',
    'graphics cards',
    'video card',
    'video cards',
    'graphics',
    'rtx',
    'gtx',
    'radeon',
    'rx',
    'geforce',
    'amd',
    'nvidia',
    'nvidia gpu',
    'amd gpu',
    'aalacomputer gpu',
    'aala gpu',
    'graphics processor',
    'discrete graphics',
    'dedicated graphics',
    'vram',
    'cuda',
    'tensor',
    'ray tracing',
    'dlss',
    'fsr',
    '4090',
    '4080',
    '4070',
    '4060',
    '3090',
    '3080',
    '3070',
    '3060',
    '7900',
    '7800',
    '7700',
    '6900',
    '6800',
    '6700'
  ];
  
  return gpuKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Check if a product is a GPU/Graphics Card
 */
export function isGPUProduct(product) {
  if (!product) return false;
  
  const name = (product.name || product.title || product.Name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  
  // Check category first (most reliable)
  if (category.includes('graphics card') || 
      category.includes('graphics cards') ||
      category.includes('gpu') ||
      category.includes('video card') ||
      category.includes('video cards')) {
    return true;
  }
  
  // GPU brand indicators
  const gpuBrands = ['nvidia', 'amd', 'asus', 'msi', 'gigabyte', 'zotac', 'pny', 'xfx', 'sapphire', 'powercolor', 'palit', 'galax'];
  const hasGPUBrand = gpuBrands.some(brand => brand.includes(brand));
  
  // GPU model patterns
  const gpuPatterns = [
    /rtx\s*\d+/i,
    /gtx\s*\d+/i,
    /rx\s*\d+/i,
    /radeon\s*rx/i,
    /geforce\s*rtx/i,
    /geforce\s*gtx/i,
    /tesla\s*\w+/i,
    /quadro\s*\w+/i,
    /arc\s*\w+/i,
    /graphics\s*card/i,
    /video\s*card/i,
    /gpu\s*\d+/i
  ];
  
  const hasGPUPattern = gpuPatterns.some(pattern => pattern.test(name));
  
  // GPU-specific keywords in name or description
  const gpuKeywords = ['graphics', 'gpu', 'rtx', 'gtx', 'radeon', 'geforce', 'vram', 'cuda', 'tensor'];
  const hasGPUKeyword = gpuKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
  
  return hasGPUPattern || (hasGPUBrand && hasGPUKeyword);
}

/**
 * Calculate GPU relevance score
 */
export function calculateGPURelevanceScore(product, query) {
  let score = 0;
  
  const name = (product.name || product.title || product.Name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  
  // Category match (highest priority)
  if (category.includes('graphics card') || category.includes('gpu')) {
    score += 100;
  }
  
  // Exact model match in name (e.g., "RTX 4090")
  const modelMatch = name.match(/rtx\s*\d+|gtx\s*\d+|rx\s*\d+/i);
  if (modelMatch) {
    if (lowerQuery.includes(modelMatch[0].toLowerCase())) {
      score += 80;
    } else {
      score += 40;
    }
  }
  
  // Query contains specific model number
  if (lowerQuery.match(/\d+/)) {
    const queryNumbers = lowerQuery.match(/\d+/g);
    const nameNumbers = name.match(/\d+/g) || [];
    
    if (queryNumbers && nameNumbers.length > 0) {
      const matches = queryNumbers.filter(num => nameNumbers.includes(num)).length;
      score += matches * 30;
    }
  }
  
  // Brand match
  if (brand && lowerQuery.includes(brand)) {
    score += 50;
  }
  
  // Name contains query
  if (name.includes(lowerQuery)) {
    score += 60;
  }
  
  // Partial name match
  const queryWords = lowerQuery.split(/\s+/);
  const nameWords = name.split(/\s+/);
  const matchingWords = queryWords.filter(word => nameWords.some(nw => nw.includes(word)));
  score += matchingWords.length * 20;
  
  // Description match
  if (description.includes(lowerQuery)) {
    score += 15;
  }
  
  // GPU-specific features in description
  const gpuFeatures = ['vram', 'cuda', 'tensor', 'ray tracing', 'dlss', 'fsr', 'memory', 'boost clock', 'base clock'];
  const featureMatches = gpuFeatures.filter(feature => description.includes(feature)).length;
  score += featureMatches * 10;
  
  return score;
}

/**
 * Filter and sort GPU products by relevance
 */
export function searchGPUProducts(products, query, options = {}) {
  const {
    maxResults = 20,
    minScore = 0
  } = options;
  
  if (!isGPUQuery(query)) {
    return [];
  }
  
  // Filter GPU products only
  const gpuProducts = products.filter(p => isGPUProduct(p));
  
  // Score and sort
  const scored = gpuProducts.map(product => ({
    ...product,
    gpuScore: calculateGPURelevanceScore(product, query)
  }))
  .filter(p => p.gpuScore >= minScore)
  .sort((a, b) => b.gpuScore - a.gpuScore)
  .slice(0, maxResults);
  
  return scored;
}

/**
 * Get GPU product details for search result display
 */
export function getGPUProductDisplay(product) {
  return {
    id: product.id || product._id,
    name: product.name || product.title || product.Name || 'Unnamed GPU',
    brand: product.brand || 'Unknown Brand',
    price: product.price || 0,
    image: product.img || product.imageUrl || product.image || '/placeholder.svg',
    category: product.category || 'Graphics Card',
    description: product.description || '',
    specs: product.specs || product.Spec || [],
    url: `/product/${product.id || product._id}`
  };
}

/**
 * Get GPU suggestions based on partial query
 */
export function getGPUSuggestions(products, query) {
  if (!query || query.length < 2) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  // Get all GPU products
  const gpuProducts = products.filter(p => isGPUProduct(p));
  
  // Find products matching the query
  const suggestions = gpuProducts
    .filter(p => {
      const name = (p.name || p.title || p.Name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      return name.includes(lowerQuery) || brand.includes(lowerQuery);
    })
    .slice(0, 5)
    .map(p => ({
      value: p.name || p.title || p.Name || 'GPU Product',
      label: `${p.brand || 'GPU'} - ${p.name || p.title || p.Name || 'Product'}`,
      isGPU: true
    }));
  
  return suggestions;
}

/**
 * Format GPU search results for display
 */
export function formatGPUSearchResults(products, query) {
  const results = searchGPUProducts(products, query, {
    maxResults: 20,
    minScore: 5
  });
  
  return {
    query,
    isGPUSearch: isGPUQuery(query),
    totalResults: results.length,
    results: results.map(p => getGPUProductDisplay(p)),
    message: results.length === 0 
      ? `No GPUs found matching "${query}". Try searching for specific models like "RTX 4090" or "RX 7900"` 
      : `Found ${results.length} GPU${results.length !== 1 ? 's' : ''} matching "${query}"`
  };
}
