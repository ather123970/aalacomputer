const mongoose = require('mongoose');
const Product = require('../models/Product');
const { batchUpdatePrices } = require('../utils/priceUtils');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function updateAllProductPrices() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all products without prices
        const products = await Product.find({
            $or: [
                { price: { $exists: false } },
                { price: null },
                { price: 0 },
                { 'price.amount': { $exists: false } },
                { 'price.amount': 0 }
            ]
        });

        console.log(`Found ${products.length} products that need price updates`);

        // Update prices in batches
        const batchSize = 10;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const priceUpdates = await batchUpdatePrices(batch, (progress) => {
                console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${progress.toFixed(1)}%`);
            });

            // Update products in database
            for (const update of priceUpdates) {
                await Product.findByIdAndUpdate(update.productId, {
                    price: update.price
                });
            }

            console.log(`Completed batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(products.length/batchSize)}`);
        }

        console.log('All product prices have been updated');
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
}

// Run the update
updateAllProductPrices();