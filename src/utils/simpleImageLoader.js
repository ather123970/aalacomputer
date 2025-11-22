/**
 * Simple Image Loader - Supports ANY image type/URL
 * No complex logic, no proxy, just direct URL loading
 */

/**
 * Get image URL from product - supports ANY field name
 * @param {object} product - Product object from database
 * @returns {string|null} - Image URL or null
 */
export function getImageFromProduct(product) {
  if (!product) return null;

  // Check ALL possible image fields in order
  const imageFields = [
    'img',
    'imageUrl',
    'image',
    'image_url',
    'imageLink',
    'image_link',
    'photo',
    'photoUrl',
    'photo_url',
    'picture',
    'pictureUrl',
    'picture_url',
    'thumbnail',
    'thumbnailUrl',
    'thumbnail_url',
    'src',
    'url',
    'imageUrl1',
    'image1',
    'image1_url',
  ];

  // Find first valid image URL
  for (const field of imageFields) {
    const value = product[field];
    
    // Check if value exists and is a valid string
    if (value && typeof value === 'string') {
      const trimmed = value.trim();
      
      // Skip empty strings and placeholder values
      if (trimmed === '' || trimmed === 'empty' || trimmed === 'null' || trimmed === 'undefined') {
        continue;
      }
      
      // Return any valid URL (http, https, data:image, or relative path)
      if (trimmed.startsWith('http://') || 
          trimmed.startsWith('https://') || 
          trimmed.startsWith('data:image/') ||
          trimmed.startsWith('/')) {
        return trimmed;
      }
      
      // If it's a relative path without /, add it
      if (trimmed.length > 0) {
        return `/${trimmed}`;
      }
    }
  }

  return null;
}

/**
 * Validate if image URL is accessible
 * @param {string} url - Image URL
 * @returns {boolean} - True if URL is valid
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'empty') return false;
  
  // Valid if it's a URL or data URI
  return trimmed.startsWith('http://') || 
         trimmed.startsWith('https://') || 
         trimmed.startsWith('data:image/') ||
         trimmed.startsWith('/');
}

/**
 * Get fallback image based on category
 * @param {string} category - Product category
 * @returns {string} - Fallback image path
 */
export function getFallbackImage(category) {
  if (!category) return '/placeholder.svg';
  
  const cat = category.toLowerCase();
  
  const fallbacks = {
    'gpu': '/fallback/gpu.svg',
    'graphics': '/fallback/gpu.svg',
    'graphics card': '/fallback/gpu.svg',
    'video card': '/fallback/gpu.svg',
    'cpu': '/fallback/cpu.svg',
    'processor': '/fallback/cpu.svg',
    'intel': '/fallback/cpu.svg',
    'amd': '/fallback/cpu.svg',
    'motherboard': '/fallback/motherboard.svg',
    'mobo': '/fallback/motherboard.svg',
    'ram': '/fallback/ram.svg',
    'memory': '/fallback/ram.svg',
    'storage': '/fallback/storage.svg',
    'ssd': '/fallback/storage.svg',
    'hdd': '/fallback/storage.svg',
    'nvme': '/fallback/storage.svg',
    'monitor': '/fallback/monitor.svg',
    'display': '/fallback/monitor.svg',
    'keyboard': '/fallback/keyboard.svg',
    'mouse': '/fallback/mouse.svg',
    'headset': '/fallback/headset.svg',
    'headphone': '/fallback/headset.svg',
    'case': '/fallback/pc.svg',
    'pc case': '/fallback/pc.svg',
    'psu': '/fallback/pc.svg',
    'power supply': '/fallback/pc.svg',
    'cooler': '/fallback/pc.svg',
    'cooling': '/fallback/pc.svg',
    'fan': '/fallback/pc.svg',
    'laptop': '/fallback/pc.svg',
    'notebook': '/fallback/pc.svg',
    'desktop': '/fallback/pc.svg',
    'prebuilt': '/fallback/pc.svg',
    'prebuild': '/fallback/pc.svg',
  };

  // Try exact match
  if (fallbacks[cat]) return fallbacks[cat];
  
  // Try partial match
  for (const [key, value] of Object.entries(fallbacks)) {
    if (cat.includes(key)) return value;
  }
  
  return '/placeholder.svg';
}

export default {
  getImageFromProduct,
  isValidImageUrl,
  getFallbackImage,
};
