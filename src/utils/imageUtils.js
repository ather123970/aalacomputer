/**
 * Smart Image URL Handler
 * Supports both local (/images/...) and external (https://...) image URLs
 * 
 * Usage:
 *   const imageUrl = getSmartImageUrl(product.img || product.imageUrl);
 */

/**
 * Converts any image URL to the correct format
 * @param {string} rawUrl - Raw image URL from database
 * @returns {string} - Properly formatted image URL
 * 
 * Examples:
 *   getSmartImageUrl('https://example.com/image.jpg') → 'https://example.com/image.jpg'
 *   getSmartImageUrl('/images/product.jpg') → '/images/product.jpg'
 *   getSmartImageUrl('images/product.jpg') → '/images/product.jpg'
 *   getSmartImageUrl('product.jpg') → '/product.jpg'
 *   getSmartImageUrl(null) → '/placeholder.svg'
 */
export function getSmartImageUrl(rawUrl, fallback = '/placeholder.svg') {
  // Handle null/undefined
  if (!rawUrl || rawUrl === '' || rawUrl === 'undefined' || rawUrl === 'null') {
    return fallback;
  }
  
  // External URLs (http:// or https://) - use directly
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  
  // Already has / prefix (local absolute path) - use directly
  if (rawUrl.startsWith('/')) {
    return rawUrl;
  }
  
  // Relative path - convert to absolute
  return `/${rawUrl}`;
}

/**
 * Get image URL with multiple fallback options
 * @param {object} product - Product object
 * @param {string} fallback - Final fallback image
 * @returns {string} - Image URL
 */
export function getProductImageUrl(product, fallback = '/placeholder.svg') {
  if (!product) return fallback;
  
  // Try multiple image fields in order of preference
  const imageFields = [
    'imageUrl', 'img', 'image', 'image_url', 'thumbnail',
    'imageUrl1', 'image1', 'image1_url',
    'imageUrl2', 'image2', 'image2_url',
    'imageUrl3', 'image3', 'image3_url'
  ];
  
  // Find the first valid image URL
  for (const field of imageFields) {
    const url = product[field];
    // Check if URL exists, is a string, is not empty, and is not the literal "empty" string
    if (url && typeof url === 'string' && url.trim() !== '' && url !== 'empty' && url.toLowerCase() !== 'empty') {
      // Handle base64 encoded images (data:image/...)
      if (url.startsWith('data:image/')) {
        return url;
      }
      // Handle relative paths
      if (url.startsWith('/') || url.startsWith('http')) {
        return url;
      }
      // Handle relative paths without leading slash
      if (!url.startsWith('http')) {
        return `/${url}`;
      }
    }
  }
  
  // Don't try to construct local image paths - use only scraper images
  // If no image found in product data, fall back to category placeholder
  
  // If we have a category, try to use a category-specific placeholder
  if (product.category) {
    const category = product.category.toLowerCase();
    const categoryPlaceholders = {
      'monitor': '/fallback/monitor.svg',
      'display': '/fallback/monitor.svg',
      'gpu': '/fallback/gpu.svg',
      'graphics card': '/fallback/gpu.svg',
      'graphics': '/fallback/gpu.svg',
      'cpu': '/fallback/cpu.svg',
      'processor': '/fallback/cpu.svg',
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
      'laptop': '/fallback/laptop.svg',
      'notebook': '/fallback/laptop.svg',
      'desktop': '/fallback/desktop.svg',
      'prebuilt': '/fallback/desktop.svg',
      'pre-built': '/fallback/desktop.svg',
      'psu': '/fallback/psu.svg',
      'power supply': '/fallback/psu.svg',
      'cooler': '/fallback/cooler.svg',
      'cooling': '/fallback/cooler.svg',
      'fan': '/fallback/fan.svg',
      'fans': '/fallback/fan.svg',
      'cable': '/fallback/cable.svg',
      'cables': '/fallback/cable.svg',
      'accessory': '/fallback/accessory.svg',
      'accessories': '/fallback/accessory.svg',
      'software': '/fallback/software.svg',
      'os': '/fallback/software.svg',
      'operating system': '/fallback/software.svg'
    };
    
    // Check for exact match first
    if (categoryPlaceholders[category]) {
      return categoryPlaceholders[category];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(categoryPlaceholders)) {
      if (category.includes(key)) {
        return value;
      }
    }
  }
  
  // Final fallback
  return fallback;
}

/**
 * Check if URL is external
 * @param {string} url - Image URL
 * @returns {boolean} - True if external URL
 */
export function isExternalImage(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Check if URL is local
 * @param {string} url - Image URL
 * @returns {boolean} - True if local URL
 */
export function isLocalImage(url) {
  if (!url) return false;
  return !isExternalImage(url);
}

/**
 * Get proxy URL for external images (fallback)
 * @param {string} imageUrl - External image URL
 * @param {string} apiBaseUrl - API base URL
 * @returns {string} - Proxied URL
 */
export function getProxyImageUrl(imageUrl, apiBaseUrl = 'http://localhost:10000') {
  if (!imageUrl || !isExternalImage(imageUrl)) {
    return imageUrl;
  }
  return `${apiBaseUrl}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
}

export default {
  getSmartImageUrl,
  getProductImageUrl,
  isExternalImage,
  isLocalImage,
  getProxyImageUrl
};
