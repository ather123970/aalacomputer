const express = require('express');
const router = express.Router();
const { getPriceForProduct } = require('../utils/priceUtils');
const Product = require('../models/Product');

// Update price for a single product
router.post('/update-price/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const price = await getPriceForProduct(product);
        product.price = {
            amount: price,
            currency: 'PKR',
            marketPrice: Math.round(price * 1.2),
            discount: Math.round(((price * 1.2 - price) / (price * 1.2)) * 100)
        };

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger price update for multiple products
router.post('/update-prices', async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ error: 'Product IDs array is required' });
        }

        const products = await Product.find({ _id: { $in: productIds } });
        const updates = await batchUpdatePrices(products);

        // Update products in database
        for (const update of updates) {
            await Product.findByIdAndUpdate(update.productId, {
                price: update.price
            });
        }

        res.json({ message: 'Prices updated successfully', count: updates.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;