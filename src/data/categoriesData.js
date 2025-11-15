// PC Hardware Categories with Brands - Pakistan Market
// Each category automatically displays products from database based on category field

export const PC_HARDWARE_CATEGORIES = [
  // 1. PROCESSORS (CPUs)
  {
    name: 'Processors',
    slug: 'processors',
    alternativeNames: ['CPU', 'Processor', 'CPUs'],
    description: 'High-performance processors for gaming, productivity, and workstations',
    brands: ['Intel', 'AMD'],
    subcategories: [
      'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9',
      'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
      'AMD Threadripper', 'Intel Xeon'
    ],
    keywords: ['10th Gen', '11th Gen', '12th Gen', '13th Gen', '14th Gen', '3000 Series', '5000 Series', '7000 Series', '9000 Series'],
    sortOrder: 1,
    published: true
  },

  // 2. MOTHERBOARDS
  {
    name: 'Motherboards',
    slug: 'motherboards',
    alternativeNames: ['Motherboard', 'Mobo', 'Mainboard'],
    description: 'Premium motherboards for Intel and AMD builds',
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar'],
    subcategories: ['ATX', 'Micro ATX', 'Mini ITX'],
    keywords: ['LGA1200', 'LGA1700', 'AM4', 'AM5', 'B450', 'B550', 'B650', 'X570', 'Z490', 'Z690', 'Z790'],
    sortOrder: 2,
    published: true
  },

  // 3. RAM (MEMORY)
  {
    name: 'RAM',
    slug: 'ram',
    alternativeNames: ['Memory', 'RAM Memory', 'DDR4', 'DDR5'],
    description: 'High-speed RAM modules for optimal system performance',
    brands: ['Corsair', 'XPG', 'G.Skill', 'Kingston', 'TeamGroup', 'T-Force', 'Crucial'],
    subcategories: ['DDR4', 'DDR5', '8GB', '16GB', '32GB', '64GB', 'RGB', 'Non-RGB'],
    keywords: ['3200MHz', '3600MHz', '6000MHz', 'Vengeance', 'Trident Z', 'Ripjaws'],
    sortOrder: 3,
    published: true
  },

  // 4. GRAPHICS CARDS (GPUs)
  {
    name: 'Graphics Cards',
    slug: 'graphics-cards',
    alternativeNames: ['GPU', 'Graphics Card', 'Video Card', 'VGA'],
    description: 'High-end graphics cards for gaming and content creation',
    brands: ['ASUS', 'MSI', 'Gigabyte', 'Zotac', 'PNY', 'XFX', 'Sapphire', 'PowerColor'],
    subcategories: [
      'NVIDIA GeForce RTX 4060', 'RTX 4060 Ti', 'RTX 4070', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090',
      'AMD Radeon RX 6600', 'RX 6650 XT', 'RX 6700 XT', 'RX 6800', 'RX 6900 XT',
      'RX 7600', 'RX 7700 XT', 'RX 7800 XT', 'RX 7900 XT', 'RX 7900 XTX'
    ],
    keywords: ['RTX', 'GTX', 'RX', 'Ti', 'Super', 'XT', 'XTX'],
    sortOrder: 4,
    published: true
  },

  // 5. POWER SUPPLIES (PSU)
  {
    name: 'Power Supplies',
    slug: 'power-supplies',
    alternativeNames: ['PSU', 'Power Supply', 'SMPS'],
    description: 'Reliable and efficient power supplies for stable system performance',
    brands: ['Cooler Master', 'Corsair', 'Thermaltake', 'DeepCool', 'Gigabyte', 'MSI'],
    subcategories: ['550W', '650W', '750W', '850W', '1000W', '1200W'],
    keywords: ['80+ Bronze', '80+ Gold', '80+ Platinum', 'Modular', 'Semi-Modular', 'Non-Modular'],
    sortOrder: 5,
    published: true
  },

  // 6. CPU COOLERS
  {
    name: 'CPU Coolers',
    slug: 'cpu-coolers',
    alternativeNames: ['Cooler', 'Cooling', 'Liquid Cooler', 'AIO', 'Air Cooler'],
    description: 'Efficient cooling solutions for processors - Air and Liquid',
    brands: ['Cooler Master', 'DeepCool', 'NZXT', 'Thermalright', 'ID-COOLING', 'Arctic'],
    subcategories: ['Air Cooler', 'Liquid Cooler', 'AIO', 'Thermal Paste'],
    keywords: ['120mm', '240mm', '360mm', 'RGB', 'Tower Cooler'],
    sortOrder: 6,
    published: true
  },

  // 7. PC CASES
  {
    name: 'PC Cases',
    slug: 'cases',
    alternativeNames: ['Case', 'Casing', 'Cabinet', 'Chassis'],
    description: 'Premium PC cases with excellent airflow and aesthetics',
    brands: ['Lian Li', 'Cooler Master', 'DeepCool', 'NZXT', 'Cougar', 'Thermaltake'],
    subcategories: ['Mid Tower', 'Full Tower', 'Mini ITX'],
    keywords: ['RGB', 'Tempered Glass', 'Mesh', 'ATX', 'Micro ATX'],
    sortOrder: 7,
    published: true
  },

  // 8. STORAGE
  {
    name: 'Storage',
    slug: 'storage',
    alternativeNames: ['SSD', 'HDD', 'NVMe', 'Hard Drive', 'M.2'],
    description: 'Fast and reliable storage solutions - SSD, HDD, and NVMe drives',
    brands: ['Samsung', 'Kingston', 'WD', 'Western Digital', 'Seagate', 'Crucial', 'XPG'],
    subcategories: ['SSD SATA', 'SSD NVMe', 'M.2 NVMe', 'HDD', 'External Drive'],
    keywords: ['1TB', '2TB', '4TB', '10TB', 'Gen3', 'Gen4', '500GB', '512GB', '256GB'],
    sortOrder: 8,
    published: true
  },

  // 9. CABLES & ACCESSORIES
  {
    name: 'Cables & Accessories',
    slug: 'cables-accessories',
    alternativeNames: ['Accessories', 'Cables', 'RGB Hub', 'Extension'],
    description: 'Essential cables and PC building accessories',
    brands: ['Universal', 'CableMod', 'Generic'],
    subcategories: ['SATA Cable', 'Power Cable', 'Extension Cord', 'Thermal Paste', 'RGB Hub', 'Cable Ties', 'Splitters'],
    keywords: ['SATA', 'RGB', 'Extension', 'Thermal', 'Cable Management'],
    sortOrder: 9,
    published: true
  },

  // 10. PERIPHERALS - KEYBOARDS
  {
    name: 'Keyboards',
    slug: 'keyboards',
    alternativeNames: ['Keyboard', 'Gaming Keyboard', 'Mechanical Keyboard'],
    description: 'Mechanical and gaming keyboards for ultimate typing experience',
    brands: ['Logitech', 'Redragon', 'Razer', 'Bloody', 'A4Tech', 'HP', 'Fantech', 'Corsair', 'Cooler Master', 'ASUS ROG', 'SteelSeries', 'Dell'],
    types: ['Wired Keyboard', 'Wireless Keyboard', 'Mechanical Keyboard', 'Membrane Keyboard', 'Gaming Keyboard', 'RGB Keyboard', 'TKL Keyboard', '60% Keyboard', 'Office Keyboard'],
    subcategories: ['Mechanical', 'Wireless', 'Gaming', 'Office', 'TKL', '60% Compact'],
    keywords: ['RGB', 'Blue Switch', 'Red Switch', 'Brown Switch', 'TKL', 'Tenkeyless', '60%', 'Compact', 'Full Size', 'Mechanical', 'Membrane', 'Gaming', 'Wireless'],
    sortOrder: 10,
    published: true
  },

  // 11. PERIPHERALS - MOUSE
  {
    name: 'Mice',
    slug: 'mice',
    alternativeNames: ['Mouse', 'Gaming Mouse', 'Wireless Mouse'],
    description: 'Precision gaming and office mice for every need',
    brands: ['Logitech', 'Razer', 'Redragon', 'Bloody', 'A4Tech', 'HP', 'Dell', 'Cooler Master', 'Corsair', 'Fantech', 'ASUS ROG', 'SteelSeries'],
    types: ['Wired Mouse', 'Wireless Mouse', 'Gaming Mouse', 'Ergonomic Mouse', 'Lightweight Mouse', 'Office Mouse', 'RGB Mouse'],
    subcategories: ['Gaming Mouse', 'Office Mouse', 'Wireless', 'Wired', 'RGB', 'Ergonomic'],
    keywords: ['RGB', 'DPI', 'Wireless', 'Wired', 'Optical', 'Laser', 'Gaming', 'Ergonomic', 'Lightweight'],
    sortOrder: 11,
    published: true
  },

  // 12. PERIPHERALS - HEADSETS
  {
    name: 'Headsets',
    slug: 'headsets',
    alternativeNames: ['Headset', 'Gaming Headset', 'Headphones'],
    description: 'Gaming and professional headsets with premium audio',
    brands: ['HyperX', 'Razer', 'Redragon', 'Fantech', 'Logitech', 'Corsair'],
    subcategories: ['Gaming Headset', 'Wireless Headset', '7.1 Surround'],
    keywords: ['RGB', '7.1', 'Wireless', 'USB', '3.5mm'],
    sortOrder: 12,
    published: true
  },

  // 13. PERIPHERALS - OTHER
  {
    name: 'Peripherals',
    slug: 'peripherals',
    alternativeNames: ['Mousepad', 'Webcam', 'Speakers'],
    description: 'Gaming mousepads, webcams, and speakers',
    brands: ['Logitech', 'Razer', 'Fantech', 'Redragon', 'HyperX'],
    subcategories: ['Mousepad', 'Webcam', 'Speakers'],
    keywords: ['RGB', 'Extended', 'XXL', 'HD', '1080p'],
    sortOrder: 13,
    published: true
  },

  // 14. MONITORS
  {
    name: 'Monitors',
    slug: 'monitors',
    alternativeNames: ['Monitor', 'Display', 'Screen', 'Gaming Monitor'],
    description: 'Gaming and professional monitors with high refresh rates',
    brands: ['ASUS', 'MSI', 'Samsung', 'Dell', 'Gigabyte', 'ViewSonic', 'AOC'],
    subcategories: ['60Hz', '75Hz', '144Hz', '165Hz', '240Hz', 'FHD', 'QHD', '4K', 'Curved', 'Flat'],
    keywords: ['1080p', '1440p', '2K', '4K', 'Gaming', 'IPS', 'VA', 'TN', 'G-Sync', 'FreeSync'],
    sortOrder: 14,
    published: true
  },

  // 15. PREBUILT PCs
  {
    name: 'Prebuilt PCs',
    slug: 'prebuilt-pcs',
    alternativeNames: ['Prebuild PC', 'Gaming PC', 'Custom Build', 'Desktop PC'],
    description: 'Pre-built gaming, office, and workstation PCs',
    brands: ['Custom Build', 'ASUS', 'MSI', 'Dell', 'HP'],
    subcategories: ['Budget PC', 'Midrange PC', 'High-End PC', 'Gaming PC', 'Office PC', 'Workstation'],
    keywords: ['Intel Build', 'AMD Build', 'RTX', 'Custom', 'Ready to Ship'],
    sortOrder: 15,
    published: true
  },

  // 16. GAMING CHAIRS
  {
    name: 'Gaming Chairs',
    slug: 'gaming-chairs',
    alternativeNames: ['Gaming Chair', 'Chair', 'Office Chair', 'Gaming Seat'],
    description: 'Ergonomic gaming chairs for comfort during long gaming sessions',
    brands: ['Cougar', 'ThunderX3', 'Fantech', 'MSI', 'Cooler Master', 'Xigmatek', 'Anda Seat', 'Razer Iskur', 'Arozzi'],
    types: ['Standard Gaming Chair', 'Ergonomic Gaming Chair', 'Reclining Gaming Chair', 'Footrest Gaming Chair', 'Fabric Gaming Chair', 'Leather Gaming Chair', 'RGB Gaming Chair'],
    subcategories: ['Standard', 'Ergonomic', 'Reclining', 'Footrest', 'Fabric', 'Leather', 'RGB'],
    keywords: ['Gaming Chair', 'Ergonomic', 'Reclining', 'Footrest', 'Fabric', 'Leather', 'RGB', 'Office Chair', 'Gaming Seat', 'Adjustable'],
    sortOrder: 16,
    published: true
  },

  // 17. CONTROLLERS
  {
    name: 'Controllers',
    slug: 'controllers',
    alternativeNames: ['Controller', 'Game Controller', 'Gamepad', 'Gaming Controller'],
    description: 'Gaming controllers, gamepads, and accessories for console and PC gaming',
    brands: ['Sony', 'Microsoft', 'Nintendo', 'Logitech', 'Razer', '8BitDo', 'PowerA', 'SCUF', 'Nacon', 'Thrustmaster', 'Xbox', 'PlayStation', 'DualSense', 'DualShock'],
    types: ['Wireless Controller', 'Wired Controller', 'Pro Controller', 'Elite Controller', 'Racing Wheel', 'Flight Stick', 'Arcade Stick'],
    subcategories: ['Wireless', 'Wired', 'Pro Controller', 'Elite', 'Racing Wheel', 'Flight Stick', 'Arcade Stick'],
    keywords: ['Controller', 'Gamepad', 'Joystick', 'Game Controller', 'Xbox Controller', 'PS5 Controller', 'PS4 Controller', 'DualSense', 'DualShock', 'Wireless', 'Wired'],
    sortOrder: 17,
    published: true
  },

  // 18. LAPTOPS
  {
    name: 'Laptops',
    slug: 'laptops',
    alternativeNames: ['Laptop', 'Notebook', 'Gaming Laptop'],
    description: 'Gaming, productivity, and ultrabook laptops',
    brands: ['ASUS', 'MSI', 'Lenovo', 'Dell', 'HP', 'Acer'],
    subcategories: ['Gaming Laptop', 'Productivity Laptop', 'Ultrabook', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'],
    keywords: ['RTX', 'GTX', 'Dedicated GPU', 'Integrated GPU', '15.6"', '17.3"', '144Hz'],
    sortOrder: 18,
    published: true
  },

  // 19. DEALS & SPECIALS
  {
    name: 'Deals',
    slug: 'deals',
    alternativeNames: ['Deals & Discounts', 'Special Offers', 'Promotions', 'Best Sellers'],
    description: 'Limited-time offers, bundle deals, and best sellers',
    brands: ['All Brands'],
    subcategories: ['Limited Time', 'Bundle Deals', 'Best Sellers', 'New Arrivals'],
    keywords: ['Discount', 'Sale', 'Offer', 'Bundle', 'Deal'],
    sortOrder: 19,
    published: true
  }
];

// Extract all unique brands from categories
export const getAllBrands = () => {
  const brandsSet = new Set();
  PC_HARDWARE_CATEGORIES.forEach(category => {
    category.brands.forEach(brand => brandsSet.add(brand));
  });
  return Array.from(brandsSet).sort();
};

// Get category by name or slug
export const getCategoryByIdentifier = (identifier) => {
  if (!identifier) return null;
  const normalized = identifier.toLowerCase().trim();
  
  return PC_HARDWARE_CATEGORIES.find(cat => 
    cat.slug === normalized ||
    cat.name.toLowerCase() === normalized ||
    cat.alternativeNames?.some(alt => alt.toLowerCase() === normalized)
  );
};

// Get brands for a specific category
export const getBrandsForCategory = (categoryIdentifier) => {
  const category = getCategoryByIdentifier(categoryIdentifier);
  return category ? category.brands : [];
};

// Check if a product matches a category
export const productMatchesCategory = (product, categoryIdentifier) => {
  if (!product || !categoryIdentifier) return false;
  
  const category = getCategoryByIdentifier(categoryIdentifier);
  if (!category) return false;
  
  const productCategory = (product.category || '').toLowerCase().trim();
  
  // Check if product category matches main name or alternative names
  return category.slug === productCategory ||
         category.name.toLowerCase() === productCategory ||
         category.alternativeNames?.some(alt => alt.toLowerCase() === productCategory);
};

// Get category display name
export const getCategoryDisplayName = (categoryIdentifier) => {
  const category = getCategoryByIdentifier(categoryIdentifier);
  return category ? category.name : categoryIdentifier;
};

// AUTO-DETECTION FUNCTIONS

/**
 * Automatically detect category from product name, title, or description
 * @param {Object|string} product - Product object or product name string
 * @returns {Object|null} - Detected category object or null
 */
export const autoDetectCategory = (product) => {
  const searchText = typeof product === 'string' 
    ? product 
    : `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  
  const normalizedText = searchText.toLowerCase();
  
  let bestMatch = null;
  let highestScore = 0;

  for (const category of PC_HARDWARE_CATEGORIES) {
    let score = 0;

    // Check category name and slug
    if (normalizedText.includes(category.name.toLowerCase())) score += 10;
    if (normalizedText.includes(category.slug)) score += 10;

    // Check alternative names
    category.alternativeNames?.forEach(altName => {
      if (normalizedText.includes(altName.toLowerCase())) score += 8;
    });

    // Check keywords
    category.keywords?.forEach(keyword => {
      if (normalizedText.includes(keyword.toLowerCase())) score += 3;
    });

    // Check subcategories
    category.subcategories?.forEach(sub => {
      if (normalizedText.includes(sub.toLowerCase())) score += 5;
    });

    // Check brands (weaker signal)
    category.brands?.forEach(brand => {
      if (normalizedText.includes(brand.toLowerCase())) score += 2;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  }

  return highestScore >= 5 ? bestMatch : null;
};

/**
 * Automatically detect brand from product name, title, or description
 * @param {Object|string} product - Product object or product name string
 * @returns {string|null} - Detected brand name or null
 */
export const autoDetectBrand = (product) => {
  const searchText = typeof product === 'string' 
    ? product 
    : `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  
  const normalizedText = searchText.toLowerCase();
  const allBrands = getAllBrands();

  // Sort brands by length (longest first) to match more specific brands first
  const sortedBrands = allBrands.sort((a, b) => b.length - a.length);

  for (const brand of sortedBrands) {
    // Check for exact word match (with word boundaries)
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return brand;
    }
  }

  // Fallback: check for contains (less strict)
  for (const brand of sortedBrands) {
    if (normalizedText.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return null;
};

/**
 * Auto-fill product category and brand fields
 * @param {Object} product - Product object
 * @returns {Object} - Product with auto-filled category and brand
 */
export const autoFillProductDetails = (product) => {
  const result = { ...product };

  // Auto-detect category if not provided
  if (!result.category || result.category.trim() === '') {
    const detectedCategory = autoDetectCategory(product);
    if (detectedCategory) {
      result.category = detectedCategory.name;
      result.detectedCategory = true; // Flag to indicate auto-detection
    }
  }

  // Auto-detect brand if not provided
  if (!result.brand || result.brand.trim() === '') {
    const detectedBrand = autoDetectBrand(product);
    if (detectedBrand) {
      result.brand = detectedBrand;
      result.detectedBrand = true; // Flag to indicate auto-detection
    }
  }

  return result;
};

/**
 * Get suggested categories for a product based on name/description
 * @param {Object|string} product - Product object or product name string
 * @param {number} limit - Maximum number of suggestions (default: 5)
 * @returns {Array} - Array of category suggestions with scores
 */
export const getSuggestedCategories = (product, limit = 5) => {
  const searchText = typeof product === 'string' 
    ? product 
    : `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  
  const normalizedText = searchText.toLowerCase();
  const suggestions = [];

  for (const category of PC_HARDWARE_CATEGORIES) {
    let score = 0;

    // Check category name and slug
    if (normalizedText.includes(category.name.toLowerCase())) score += 10;
    if (normalizedText.includes(category.slug)) score += 10;

    // Check alternative names
    category.alternativeNames?.forEach(altName => {
      if (normalizedText.includes(altName.toLowerCase())) score += 8;
    });

    // Check keywords
    category.keywords?.forEach(keyword => {
      if (normalizedText.includes(keyword.toLowerCase())) score += 3;
    });

    // Check subcategories
    category.subcategories?.forEach(sub => {
      if (normalizedText.includes(sub.toLowerCase())) score += 5;
    });

    if (score > 0) {
      suggestions.push({
        category: category.name,
        slug: category.slug,
        score,
        confidence: score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low'
      });
    }
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Get suggested brands for a product based on name/description
 * @param {Object|string} product - Product object or product name string
 * @param {number} limit - Maximum number of suggestions (default: 5)
 * @returns {Array} - Array of brand suggestions
 */
export const getSuggestedBrands = (product, limit = 5) => {
  const searchText = typeof product === 'string' 
    ? product 
    : `${product.name || ''} ${product.title || ''} ${product.description || ''}`.toLowerCase();
  
  const normalizedText = searchText.toLowerCase();
  const allBrands = getAllBrands();
  const suggestions = [];

  for (const brand of allBrands) {
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`, 'i');
    if (regex.test(normalizedText)) {
      suggestions.push(brand);
    }
  }

  return suggestions.slice(0, limit);
};

export default PC_HARDWARE_CATEGORIES;
