const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const { getPriceForProduct } = require('../utils/priceUtils');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function processProduct(rawProduct) {
    // Extract category from product name/description
    const categoryMap = {
        'keyboard': 'Keyboards',
        'mouse': 'Mice',
        'monitor': 'Monitors',
        'laptop': 'Laptops',
        'desktop': 'Desktops',
        'gpu': 'Graphics Cards',
        'cpu': 'Processors',
        'ram': 'Memory',
        'ssd': 'Storage',
        'hdd': 'Storage',
        'power supply': 'Power Supplies',
        'case': 'Cases',
        'motherboard': 'Motherboards',
        'cooler': 'CPU Coolers',
        'fan': 'Case Fans',
    };

    let mainCategory = 'Other';
    let subCategory = '';

    // Determine category based on product name and description
    const productText = (rawProduct.name + ' ' + (rawProduct.description || '')).toLowerCase();
    for (const [key, category] of Object.entries(categoryMap)) {
        if (productText.includes(key)) {
            mainCategory = category;
            // Determine sub-category
            if (productText.includes('gaming')) {
                subCategory = `Gaming ${category}`;
            } else if (productText.includes('wireless')) {
                subCategory = `Wireless ${category}`;
            } else if (productText.includes('mechanical')) {
                subCategory = `Mechanical ${category}`;
            }
            break;
        }
    }

    // Process images
    const images = [];
    if (rawProduct.img || rawProduct.imageUrl) {
        images.push({
            url: rawProduct.img || rawProduct.imageUrl,
            alt: rawProduct.name,
            isPrimary: true
        });
    }

    // Extract specs from description
    const specs = rawProduct.description
        ? rawProduct.description.split('\n').map(spec => spec.trim()).filter(Boolean)
        : [];

    // Create processed product object
    return {
        id: rawProduct.id,
        brand: rawProduct.brand || 'Unknown',
        name: rawProduct.name,
        title: rawProduct.title || rawProduct.name,
        price: {
            amount: rawProduct.price || 0,
            currency: 'PKR',
            marketPrice: 0,
            discount: 0
        },
        images,
        description: rawProduct.description || '',
        category: {
            main: mainCategory,
            sub: subCategory,
            tags: []
        },
        specs: specs.map(spec => ({ key: 'spec', value: spec })),
        styles: {},
        stock: {
            quantity: 0,
            status: 'out_of_stock',
            threshold: 5
        },
        warranty: rawProduct.WRANTY || '',
        link: rawProduct.link || '',
        isVisible: true,
        isFeatured: false
    };
}

async function importProducts() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read the products file
        console.log('Reading products file...');
        const productsFile = path.join(__dirname, '../../zah_products_all.json');
        const rawProducts = JSON.parse(await fs.readFile(productsFile, 'utf8'));
        console.log(`Found ${rawProducts.length} products to import`);

        // Process products in batches
        const batchSize = 50;
        let imported = 0;
        let updated = 0;

        for (let i = 0; i < rawProducts.length; i += batchSize) {
            const batch = rawProducts.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(rawProducts.length/batchSize)}`);

            await Promise.all(batch.map(async (rawProduct) => {
                try {
                    const processedProduct = await processProduct(rawProduct);
                    
                    // Get price
                    const price = await getPriceForProduct(processedProduct);
                    processedProduct.price = {
                        amount: price,
                        currency: 'PKR',
                        marketPrice: Math.round(price * 1.2),
                        discount: Math.round(((price * 1.2 - price) / (price * 1.2)) * 100)
                    };

                    // Try to update existing product or create new one
                    const result = await Product.findOneAndUpdate(
                        { id: processedProduct.id },
                        processedProduct,
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    if (result.isNew) {
                        imported++;
                    } else {
                        updated++;
                    }
                } catch (error) {
                    console.error(`Error processing product ${rawProduct.id}:`, error.message);
                }
            }));

            console.log(`Progress: ${Math.min(i + batchSize, rawProducts.length)}/${rawProducts.length}`);
        }

        console.log('\nImport completed!');
        console.log(`Imported ${imported} new products`);
        console.log(`Updated ${updated} existing products`);
        
        // Create indexes
        console.log('Creating indexes...');
        await Product.collection.createIndex({ 'category.main': 1 });
        await Product.collection.createIndex({ brand: 1 });
        await Product.collection.createIndex({ 'price.amount': 1 });
        
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

// Run the import
importProducts();