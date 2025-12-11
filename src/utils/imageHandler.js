/**
 * Image Handler Utility
 * Handles both base64 and external image links with proper validation and processing
 */

/**
 * Validate if an image URL is valid and accessible
 * @param {string} url - Image URL to validate
 * @returns {boolean} - True if URL is valid
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Check for invalid values
  if (url === 'undefined' || url === 'null' || url === '' || url === ' ' || url.toLowerCase() === 'empty') {
    return false;
  }
  
  // Base64 images are valid
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // External URLs must start with http/https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // Local paths starting with / are valid
  if (url.startsWith('/')) {
    return true;
  }
  
  return false;
}

/**
 * Determine image source type
 * @param {string} url - Image URL
 * @returns {string} - Type: 'base64', 'external', 'local', or 'invalid'
 */
export function getImageSourceType(url) {
  if (!isValidImageUrl(url)) return 'invalid';
  
  if (url.startsWith('data:image/')) return 'base64';
  if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
  if (url.startsWith('/')) return 'local';
  
  return 'invalid';
}

/**
 * Process image URL for display
 * Converts external URLs to use proxy endpoint
 * @param {string} url - Original image URL
 * @param {boolean} useProxy - Whether to use proxy for external images (default: true)
 * @returns {string} - Processed URL ready for display
 */
export function processImageUrl(url, useProxy = true) {
  if (!isValidImageUrl(url)) {
    return null;
  }
  
  const sourceType = getImageSourceType(url);
  
  switch (sourceType) {
    case 'base64':
      // Base64 images are used directly
      return url;
      
    case 'external':
      // External URLs can be proxied for reliability
      if (useProxy) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
      }
      return url;
      
    case 'local':
      // Local paths are used as-is
      return url;
      
    default:
      return null;
  }
}

/**
 * Get fallback image based on category
 * @param {string} category - Product category
 * @returns {string} - Fallback image path
 */
export function getFallbackImage(category) {
  const categoryFallbacks = {
    'cpu': '/fallback/cpu.svg',
    'processor': '/fallback/cpu.svg',
    'gpu': '/fallback/gpu.svg',
    'graphics card': '/fallback/gpu.svg',
    'graphics': '/fallback/gpu.svg',
    'monitor': '/fallback/monitor.svg',
    'display': '/fallback/monitor.svg',
    'motherboard': '/fallback/motherboard.svg',
    'mobo': '/fallback/motherboard.svg',
    'ram': '/fallback/ram.svg',
    'memory': '/fallback/ram.svg',
    'storage': '/fallback/storage.svg',
    'ssd': '/fallback/storage.svg',
    'hdd': '/fallback/storage.svg',
    'nvme': '/fallback/storage.svg',
    'mouse': '/fallback/mouse.svg',
    'keyboard': '/fallback/keyboard.svg',
    'headset': '/fallback/headset.svg',
    'headphone': '/fallback/headset.svg',
    'case': '/fallback/pc.svg',
    'casing': '/fallback/pc.svg',
    'pc case': '/fallback/pc.svg',
    'cabinet': '/fallback/pc.svg',
    'tower': '/fallback/pc.svg',
    'psu': '/fallback/pc.svg',
    'power supply': '/fallback/pc.svg',
    'cooling': '/fallback/pc.svg',
    'cooler': '/fallback/pc.svg',
    'fan': '/fallback/pc.svg',
    'prebuild': '/fallback/pc.svg',
    'prebuild pc': '/fallback/pc.svg',
    'prebuilt': '/fallback/pc.svg',
    'desktop': '/fallback/pc.svg',
    'pc': '/fallback/pc.svg',
    'laptop': '/fallback/pc.svg',
  };
  
  if (!category) return '/placeholder.svg';
  
  const categoryLower = category.toLowerCase();
  
  // Try exact match first
  if (categoryFallbacks[categoryLower]) {
    return categoryFallbacks[categoryLower];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(categoryFallbacks)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }
  
  return '/placeholder.svg';
}

/**
 * Create a product object for SmartImage component
 * @param {Object} product - Product data
 * @returns {Object} - Formatted product object
 */
export function formatProductForImage(product) {
  if (!product) return null;
  
  return {
    id: product._id || product.id,
    name: product.Name || product.name || product.title || 'Product',
    category: product.category || 'unknown',
    brand: product.brand || 'Unknown',
    img: product.img || product.imageUrl || product.image || null
  };
}

/**
 * Validate and prepare image data for display
 * @param {Object} imageData - Image data object
 * @returns {Object} - Validated image data with processed URL
 */
export function validateImageData(imageData) {
  if (!imageData) {
    return {
      isValid: false,
      url: null,
      processedUrl: null,
      sourceType: 'invalid',
      fallback: '/placeholder.svg'
    };
  }
  
  const url = imageData.url || imageData.img || imageData.imageUrl;
  const isValid = isValidImageUrl(url);
  const sourceType = getImageSourceType(url);
  const processedUrl = isValid ? processImageUrl(url) : null;
  const fallback = getFallbackImage(imageData.category);
  
  return {
    isValid,
    url,
    processedUrl,
    sourceType,
    fallback
  };
}

/**
 * Log image loading information (for debugging)
 * @param {string} productName - Product name
 * @param {string} url - Image URL
 * @param {string} sourceType - Source type
 */
export function logImageLoading(productName, url, sourceType) {
  const icons = {
    'base64': '📸',
    'external': '🌐',
    'local': '📁',
    'invalid': '❌'
  };
  
  const icon = icons[sourceType] || '❓';
  console.log(`[ImageHandler] ${icon} ${productName}: ${sourceType} - ${url?.substring(0, 60)}...`);
}

export default {
  isValidImageUrl,
  getImageSourceType,
  processImageUrl,
  getFallbackImage,
  formatProductForImage,
  validateImageData,
  logImageLoading
};
