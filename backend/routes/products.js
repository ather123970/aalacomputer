const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const processProductImages = require('../middleware/imageProcessor');

// Get products with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 32;
        const category = req.query.category;
        const brand = req.query.brand;
        const search = req.query.search;

        const query = {};
        
        // Category filter - support both simple string and nested object
        if (category && category !== 'All') {
            query.$or = [
                { category: { $regex: category, $options: 'i' } },
                { 'category.main': { $regex: category, $options: 'i' } }
            ];
        }
        
        // Brand filter
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }
        
        // Search filter - search in Name, title, category, brand, and specs
        if (search) {
            query.$or = [
                { Name: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { 'category.main': { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { Spec: { $regex: search, $options: 'i' } }
            ];
        }

        const result = await Product.paginateProducts(query, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product brands
router.get('/brands', async (req, res) => {
    try {
        const brands = await Product.getBrands();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new product with image processing
router.post('/', processProductImages, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update product with image processing
router.put('/:id', processProductImages, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;