// Intelligent Image Fallback System
// Automatically detects category and brand to show relevant fallback images

// Category-based fallback images mapping
const CATEGORY_FALLBACKS = {
  // PC Components
  'motherboard': '/fallback/motherboard.svg',
  'cpu': '/fallback/cpu.svg',
  'processor': '/fallback/cpu.svg',
  'gpu': '/fallback/gpu.svg',
  'graphics': '/fallback/gpu.svg',
  'graphics card': '/fallback/gpu.svg',
  'ram': '/fallback/ram.svg',
  'memory': '/fallback/ram.svg',
  'storage': '/fallback/storage.svg',
  'ssd': '/fallback/storage.svg',
  'hdd': '/fallback/storage.svg',
  'nvme': '/fallback/storage.svg',
  'psu': '/fallback/psu.svg',
  'power supply': '/fallback/psu.svg',
  'case': '/fallback/case.svg',
  'cooling': '/fallback/cooling.svg',
  'cooler': '/fallback/cooling.svg',
  'fan': '/fallback/cooling.svg',
  
  // Peripherals
  'monitor': '/fallback/monitor.svg',
  'display': '/fallback/monitor.svg',
  'keyboard': '/fallback/keyboard.svg',
  'mouse': '/fallback/mouse.svg',
  'headset': '/fallback/headset.svg',
  'headphone': '/fallback/headset.svg',
  'speaker': '/fallback/speaker.svg',
  'webcam': '/fallback/webcam.svg',
  
  // Systems
  'laptop': '/fallback/laptop.svg',
  'pc': '/fallback/pc.svg',
  'prebuild': '/fallback/pc.svg',
  'prebuilt': '/fallback/pc.svg',
  'desktop': '/fallback/pc.svg',
  
  // Accessories
  'cable': '/fallback/cable.svg',
  'adapter': '/fallback/adapter.svg',
  'usb': '/fallback/usb.svg',
  'charger': '/fallback/charger.svg',
  
  // Default
  'default': '/placeholder.svg'
};

// Brand-specific color schemes for fallback styling
const BRAND_COLORS = {
  'msi': { primary: '#FF0000', secondary: '#000000' },
  'asus': { primary: '#000000', secondary: '#FF6600' },
  'gigabyte': { primary: '#FF6600', secondary: '#000000' },
  'asrock': { primary: '#0066CC', secondary: '#FFFFFF' },
  'intel': { primary: '#0071C5', secondary: '#FFFFFF' },
  'amd': { primary: '#ED1C24', secondary: '#000000' },
  'nvidia': { primary: '#76B900', secondary: '#000000' },
  'corsair': { primary: '#FFD700', secondary: '#000000' },
  'kingston': { primary: '#E4002B', secondary: '#000000' },
  'samsung': { primary: '#1428A0', secondary: '#FFFFFF' },
  'lg': { primary: '#A50034', secondary: '#FFFFFF' },
  'dell': { primary: '#007DB8', secondary: '#FFFFFF' },
  'hp': { primary: '#0096D6', secondary: '#FFFFFF' },
  'logitech': { primary: '#00B8FC', secondary: '#000000' },
  'razer': { primary: '#00FF00', secondary: '#000000' },
  'cooler master': { primary: '#7B2C8E', secondary: '#FFFFFF' },
  'thermaltake': { primary: '#00A3E0', secondary: '#000000' },
  'nzxt': { primary: '#000000', secondary: '#FFFFFF' },
  'default': { primary: '#3B82F6', secondary: '#FFFFFF' }
};

/**
 * Normalize category string for matching
 * @param {string} category - Category string to normalize
 * @returns {string} Normalized category
 */
const normalizeCategory = (category) => {
  if (!category) return 'default';
  return category.toString().toLowerCase().trim();
};

/**
 * Normalize brand string for matching
 * @param {string} brand - Brand string to normalize
 * @returns {string} Normalized brand
 */
const normalizeBrand = (brand) => {
  if (!brand) return 'default';
  return brand.toString().toLowerCase().trim();
};

/**
 * Get fallback image based on product category
 * @param {string} category - Product category
 * @param {string} productName - Product name (for additional context)
 * @returns {string} Fallback image URL
 */
export const getCategoryFallback = (category, productName = '') => {
  const normalizedCategory = normalizeCategory(category);
  const normalizedName = normalizeCategory(productName);
  
  // Try exact category match first
  if (CATEGORY_FALLBACKS[normalizedCategory]) {
    return CATEGORY_FALLBACKS[normalizedCategory];
  }
  
  // Try partial matches in category name
  for (const [key, value] of Object.entries(CATEGORY_FALLBACKS)) {
    if (normalizedCategory.includes(key) || normalizedName.includes(key)) {
      return value;
    }
  }
  
  // Return default fallback
  return CATEGORY_FALLBACKS.default;
};

/**
 * Get brand color scheme
 * @param {string} brand - Product brand
 * @returns {object} Color scheme with primary and secondary colors
 */
export const getBrandColors = (brand) => {
  const normalizedBrand = normalizeBrand(brand);
  
  // Try exact brand match
  if (BRAND_COLORS[normalizedBrand]) {
    return BRAND_COLORS[normalizedBrand];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(BRAND_COLORS)) {
    if (normalizedBrand.includes(key) || key.includes(normalizedBrand)) {
      return value;
    }
  }
  
  return BRAND_COLORS.default;
};

/**
 * Generate SVG fallback with category icon and brand colors
 * @param {string} category - Product category
 * @param {string} brand - Product brand
 * @param {string} productName - Product name
 * @returns {string} Data URL for SVG fallback image
 */
export const generateSmartFallback = (category, brand, productName) => {
  const colors = getBrandColors(brand);
  const categoryLabel = category || 'Product';
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad)"/>
      <rect x="150" y="150" width="100" height="100" fill="${colors.secondary}" opacity="0.3" rx="10"/>
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${colors.secondary}" text-anchor="middle" dominant-baseline="middle">
        ${categoryLabel.substring(0, 3).toUpperCase()}
      </text>
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="18" fill="${colors.secondary}" text-anchor="middle" opacity="0.9">
        ${categoryLabel}
      </text>
      ${brand ? `<text x="200" y="310" font-family="Arial, sans-serif" font-size="14" fill="${colors.secondary}" text-anchor="middle" opacity="0.7">${brand}</text>` : ''}
    </svg>
  `.trim();
  
  // Use encodeURIComponent instead of btoa to avoid Unicode issues
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Get category icon emoji/symbol
 * @param {string} category - Product category
 * @param {string} productName - Product name
 * @returns {string} Icon character
 */
const getCategoryIcon = (category, productName = '') => {
  const normalized = normalizeCategory(category);
  const normalizedName = normalizeCategory(productName);
  
  const icons = {
    'motherboard': '🔌',
    'cpu': '🖥️',
    'processor': '🖥️',
    'gpu': '🎮',
    'graphics': '🎮',
    'ram': '💾',
    'memory': '💾',
    'storage': '💿',
    'ssd': '💿',
    'hdd': '💿',
    'psu': '⚡',
    'power': '⚡',
    'case': '📦',
    'cooling': '❄️',
    'cooler': '❄️',
    'fan': '🌀',
    'monitor': '🖥️',
    'display': '🖥️',
    'keyboard': '⌨️',
    'mouse': '🖱️',
    'headset': '🎧',
    'headphone': '🎧',
    'speaker': '🔊',
    'webcam': '📷',
    'laptop': '💻',
    'pc': '🖥️',
    'prebuild': '🖥️',
    'desktop': '🖥️',
    'cable': '🔌',
    'adapter': '🔌',
    'usb': '🔌',
    'charger': '🔋',
    'default': '📦'
  };
  
  // Try exact match
  if (icons[normalized]) return icons[normalized];
  
  // Try partial matches
  for (const [key, value] of Object.entries(icons)) {
    if (normalized.includes(key) || normalizedName.includes(key)) {
      return value;
    }
  }
  
  return icons.default;
};

/**
 * Main function to get smart fallback image
 * Tries multiple strategies to find the best fallback
 * @param {object} product - Product object with category, brand, name, etc.
 * @returns {string} Fallback image URL or data URL
 */
export const getSmartFallback = (product) => {
  if (!product) return CATEGORY_FALLBACKS.default;
  
  const category = product.category || product.type || '';
  const brand = product.brand || '';
  const name = product.name || product.Name || product.title || '';
  
  // Generate dynamic SVG fallback with brand colors
  return generateSmartFallback(category, brand, name);
};

// Export all functions
export default {
  getCategoryFallback,
  getBrandColors,
  generateSmartFallback,
  getSmartFallback
};
