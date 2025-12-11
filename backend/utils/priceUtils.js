const axios = require('axios');
const cheerio = require('cheerio');

// Price ranges for different categories (in PKR)
const categoryPriceRanges = {
    'Gaming Keyboards': {
        min: 3000,
        max: 35000,
        markup: 1.2
    },
    'Mechanical Keyboards': {
        min: 5000,
        max: 45000,
        markup: 1.25
    },
    'Gaming Mouse': {
        min: 2000,
        max: 25000,
        markup: 1.3
    },
    'Gaming Monitors': {
        min: 25000,
        max: 150000,
        markup: 1.15
    },
    // Add more categories as needed
};

// Default price range if category not found
const defaultPriceRange = {
    min: 2000,
    max: 50000,
    markup: 1.2
};

// Sites to check for prices
const priceSources = [
    {
        name: 'daraz',
        baseUrl: 'https://www.daraz.pk/catalog/?q=',
        priceSelector: '.price'
    },
    {
        name: 'olx',
        baseUrl: 'https://www.olx.com.pk/items?query=',
        priceSelector: '.price'
    },
    // Add more sources as needed
];

// Cache for storing fetched prices
const priceCache = new Map();

async function fetchPriceFromSource(productName, source) {
    try {
        const searchUrl = `${source.baseUrl}${encodeURIComponent(productName)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const prices = $(source.priceSelector)
            .map((_, el) => {
                const priceText = $(el).text().trim();
                return extractPriceValue(priceText);
            })
            .get()
            .filter(price => price > 0);

        if (prices.length > 0) {
            // Return median price
            prices.sort((a, b) => a - b);
            return prices[Math.floor(prices.length / 2)];
        }
        return null;
    } catch (error) {
        console.error(`Error fetching price from ${source.name}:`, error.message);
        return null;
    }
}

function extractPriceValue(priceText) {
    // Extract numeric value from price text (e.g., "Rs. 1,234" -> 1234)
    const matches = priceText.match(/[\d,]+/);
    if (matches) {
        return parseInt(matches[0].replace(/,/g, ''));
    }
    return 0;
}

function estimatePriceFromSpecs(product) {
    const category = product.category?.main || 'default';
    const range = categoryPriceRanges[category] || defaultPriceRange;
    
    // Basic price estimation based on product features
    let basePrice = (range.min + range.max) / 2;
    
    // Adjust price based on brand tier
    const brandTiers = {
        'Razer': 1.4,
        'Logitech': 1.3,
        'Corsair': 1.25,
        'Mchose': 0.9,
        'default': 1.0
    };
    
    const brandMultiplier = brandTiers[product.brand] || brandTiers.default;
    basePrice *= brandMultiplier;

    // Adjust for features mentioned in description
    const features = {
        'wireless': 1.2,
        'mechanical': 1.3,
        'rgb': 1.1,
        'gaming': 1.15
    };

    for (const [feature, multiplier] of Object.entries(features)) {
        if (product.description?.toLowerCase().includes(feature)) {
            basePrice *= multiplier;
        }
    }

    // Apply markup
    basePrice *= range.markup;

    // Round to nearest 100
    return Math.round(basePrice / 100) * 100;
}

async function getPriceForProduct(product) {
    const cacheKey = `${product.brand}_${product.name}`;
    
    // Check cache first
    if (priceCache.has(cacheKey)) {
        return priceCache.get(cacheKey);
    }

    // Try to fetch price from online sources
    for (const source of priceSources) {
        const price = await fetchPriceFromSource(product.name, source);
        if (price) {
            priceCache.set(cacheKey, price);
            return price;
        }
    }

    // If no price found, estimate based on specs
    const estimatedPrice = estimatePriceFromSpecs(product);
    priceCache.set(cacheKey, estimatedPrice);
    return estimatedPrice;
}

// Batch update prices for multiple products
async function batchUpdatePrices(products, progressCallback = null) {
    const results = [];
    const total = products.length;

    for (let i = 0; i < total; i++) {
        const product = products[i];
        const price = await getPriceForProduct(product);
        
        results.push({
            productId: product._id || product.id,
            price: {
                amount: price,
                currency: 'PKR',
                marketPrice: Math.round(price * 1.2), // 20% higher for market price
                discount: Math.round(((price * 1.2 - price) / (price * 1.2)) * 100)
            }
        });

        if (progressCallback) {
            progressCallback((i + 1) / total * 100);
        }
    }

    return results;
}

module.exports = {
    getPriceForProduct,
    batchUpdatePrices,
    estimatePriceFromSpecs
};