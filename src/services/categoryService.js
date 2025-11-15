// Enhanced Category Service with Caching and Performance Optimizations
import { API_CONFIG } from '../config/api';

// In-memory cache with separate TTLs for different types of data
const cache = {
  categories: { data: null, timestamp: 0 },
  categoryProducts: {},
  categoryBrands: {},
  TTL: {
    categories: 15 * 60 * 1000, // 15 minutes for categories
    products: 2 * 60 * 1000,    // 2 minutes for product lists
    brands: 30 * 60 * 1000      // 30 minutes for brand lists
  },
  maxCacheSize: 50, // Maximum number of items to cache
  currentCacheSize: 0
};

// Helper function to clean up old cache entries
const cleanCache = (cacheKey) => {
  if (cache.currentCacheSize >= cache.maxCacheSize) {
    // Find the oldest entry
    let oldestKey = null;
    let oldestTime = Date.now();
    
    Object.keys(cache[cacheKey]).forEach(key => {
      if (cache[cacheKey][key].timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = cache[cacheKey][key].timestamp;
      }
    });
    
    // Remove the oldest entry
    if (oldestKey) {
      delete cache[cacheKey][oldestKey];
      cache.currentCacheSize--;
    }
  }
};

/**
 * Fetch dynamic categories from database with intelligent caching
 * Falls back to static categories if API fails
 */
export async function fetchDynamicCategories() {
  try {
    const now = Date.now();
    const cacheKey = 'categories';
    
    // Check cache first
    if (cache[cacheKey]?.data && (now - cache[cacheKey].timestamp) < cache.TTL.categories) {
      console.log('[CategoryService] Using cached categories');
      return cache[cacheKey].data;
    }

    console.log('[CategoryService] Fetching dynamic categories from API');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/dynamic`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const categories = await response.json();
        
        // Cache the result
        cache[cacheKey] = {
          data: categories,
          timestamp: now
        };
        
        return categories;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[CategoryService] Error fetching dynamic categories:', error);
      }
      // Continue to fallback
    }
    
    // Fallback to static categories if dynamic fetch fails
    try {
      const fallbackResponse = await fetch(`${API_CONFIG.BASE_URL}/api/categories`);
      if (fallbackResponse.ok) {
        const fallbackCategories = await fallbackResponse.json();
        
        // Cache the fallback result
        if (fallbackCategories.length > 0) {
          cache[cacheKey] = {
            data: fallbackCategories,
            timestamp: now
          };
        }
        
        return fallbackCategories;
      }
    } catch (fallbackError) {
      console.error('[CategoryService] Error fetching fallback categories:', fallbackError);
    }
    
    // Return empty array as last resort
    return [];
  } catch (error) {
    console.error('[CategoryService] Unexpected error in fetchDynamicCategories:', error);
    return [];
  }
}

/**
 * Fetch products for a specific category with intelligent caching and performance optimizations
 */
export async function fetchCategoryProducts(slug, options = {}) {
  try {
    const { 
      limit = 24, 
      page = 1, 
      forceRefresh = false, 
      brand = null, 
      minPrice = 0, 
      maxPrice = Number.MAX_SAFE_INTEGER,
      sortBy = 'featured'
    } = options;
    
    const cacheKey = `${slug}_${page}_${limit}_${brand || 'all'}_${minPrice}_${maxPrice}_${sortBy}`;
    const now = Date.now();
    
    // Check cache first
    if (!forceRefresh && 
        cache.categoryProducts[cacheKey] && 
        (now - cache.categoryProducts[cacheKey].timestamp) < cache.TTL.products) {
      console.log(`[CategoryService] Using cached products for ${cacheKey}`);
      return cache.categoryProducts[cacheKey].data;
    }
    
    // Clean up cache if needed
    if (Object.keys(cache.categoryProducts).length >= cache.maxCacheSize) {
      cleanCache('categoryProducts');
    }
    
    console.log(`[CategoryService] Fetching products for category: ${slug}, page ${page}`);
    
    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      sortBy,
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString()
    });
    
    if (brand) {
      params.append('brand', brand);
    }
    
    const url = `${API_CONFIG.BASE_URL}/api/categories/${slug}/products?${params.toString()}`;
    
    // Add timeout and abort controller for better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      cache.categoryProducts[cacheKey] = {
        data,
        timestamp: now
      };
      cache.currentCacheSize++;
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`[CategoryService] Request timed out for ${slug}`);
      } else {
        console.error(`[CategoryService] Error fetching products for ${slug}:`, error);
      }
      
      // Return empty result on error
      return { 
        products: [], 
        total: 0, 
        page, 
        limit, 
        hasMore: false 
      };
    }
  } catch (error) {
    console.error(`[CategoryService] Unexpected error in fetchCategoryProducts:`, error);
    return { 
      products: [], 
      total: 0, 
      page: options.page || 1, 
      limit: options.limit || 24, 
      hasMore: false 
    };
  }
}

/**
 * Fetch brands for a specific category with caching
 */
export async function fetchCategoryBrands(categoryId) {
  try {
    const cacheKey = `brands_${categoryId}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.categoryBrands[cacheKey] && 
        (now - cache.categoryBrands[cacheKey].timestamp) < cache.TTL.brands) {
      return cache.categoryBrands[cacheKey].data;
    }
    
    console.log(`[CategoryService] Fetching brands for category ID: ${categoryId}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/category/${categoryId}/brands`);
    
    if (response.ok) {
      const data = await response.json();
      const brands = data.actual_brands?.map(b => b.brand) || [];
      
      // Cache the result
      cache.categoryBrands[cacheKey] = {
        data: brands,
        timestamp: now
      };
      
      return brands;
    }
    
    throw new Error(`Failed to fetch brands: ${response.status}`);
  } catch (error) {
    console.error(`[CategoryService] Error fetching brands for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Get category by slug or ID with caching
 */
export async function getCategoryByIdentifier(identifier) {
  try {
    const categories = await fetchDynamicCategories();
    
    // Try to find by ID first
    const id = parseInt(identifier);
    if (!isNaN(id)) {
      const byId = categories.find(cat => cat.id === id);
      if (byId) return byId;
    }
    
    // Try to find by slug
    const bySlug = categories.find(cat => 
      cat.slug === identifier || 
      cat.slug === identifier.toLowerCase()
    );
    
    if (bySlug) return bySlug;
    
    // Try to find by name (case insensitive)
    const byName = categories.find(cat => 
      cat.name.toLowerCase() === identifier.toLowerCase() ||
      (cat.alternativeNames || []).some(alt => 
        alt.toLowerCase() === identifier.toLowerCase()
      )
    );
    
    return byName || null;
  } catch (error) {
    console.error('[CategoryService] Error in getCategoryByIdentifier:', error);
    return null;
  }
}

/**
 * Clear cache (useful for admin updates)
 */
export function clearCache() {
  cache.categories = { data: null, timestamp: 0 };
  cache.categoryProducts = {};
  cache.categoryBrands = {};
  cache.currentCacheSize = 0;
  console.log('[CategoryService] Cache cleared');
}

/**
 * Preload categories (call this on app startup)
 */
export async function preloadCategories() {
  try {
    await fetchDynamicCategories();
    console.log('[CategoryService] Preloaded categories');
  } catch (error) {
    console.error('[CategoryService] Error preloading categories:', error);
  }
}
