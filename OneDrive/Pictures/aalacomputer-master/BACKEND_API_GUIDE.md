# Backend API Implementation Guide

## 🎯 Overview
This guide helps you implement the required backend APIs for the PC hardware eCommerce admin system. All endpoints should connect to your **real database** (MongoDB/PostgreSQL/etc).

---

## 📦 Required Backend Routes

### 1. Categories API

#### GET `/api/admin/categories`
**Purpose:** Get all categories (admin view)

**Response:**
```json
{
  "ok": true,
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Processor",
      "slug": "processor",
      "description": "High-performance processors",
      "brands": ["Intel", "AMD"],
      "published": true,
      "sortOrder": 1,
      "productCount": 45,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/categories`
**Purpose:** Create new category

**Request Body:**
```json
{
  "name": "Graphics Card",
  "slug": "graphics-card",
  "description": "High-end graphics cards",
  "brands": ["ASUS", "MSI", "Gigabyte"],
  "published": true,
  "sortOrder": 3
}
```

**Response:**
```json
{
  "ok": true,
  "category": { /* created category object */ }
}
```

#### PUT `/api/admin/categories/:id`
**Purpose:** Update existing category

**Request Body:** Same as POST

#### DELETE `/api/admin/categories/:id`
**Purpose:** Delete category

**Response:**
```json
{
  "ok": true,
  "message": "Category deleted successfully"
}
```

#### GET `/api/categories` (PUBLIC)
**Purpose:** Get published categories for frontend

**Query Params:**
- `published=true` (default)

**Response:**
```json
{
  "ok": true,
  "categories": [/* published categories only */]
}
```

---

### 2. Brands API

#### GET `/api/admin/brands`
**Purpose:** Get all brands

**Response:**
```json
{
  "ok": true,
  "brands": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "ASUS",
      "description": "ASUS products",
      "website": "https://asus.com",
      "country": "Pakistan",
      "productCount": 120,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/brands`
**Purpose:** Create brand

**Request Body:**
```json
{
  "name": "Intel",
  "description": "Intel processors",
  "website": "https://intel.com",
  "country": "Pakistan"
}
```

#### PUT `/api/admin/brands/:id`
**Purpose:** Update brand

#### DELETE `/api/admin/brands/:id`
**Purpose:** Delete brand

---

### 3. Products API (IMPORTANT: Sort by createdAt)

#### GET `/api/admin/products`
**Purpose:** Get all products for admin

**Database Query:**
```javascript
// MongoDB Example
const products = await Product.find({})
  .sort({ createdAt: -1 }) // ⚠️ IMPORTANT: Sort newest first
  .populate('category')
  .populate('brand');

// SQL Example
SELECT * FROM products 
ORDER BY created_at DESC; -- ⚠️ IMPORTANT: Sort newest first
```

**Response:**
```json
{
  "ok": true,
  "products": [
    {
      "id": "prod123",
      "name": "RTX 4060",
      "category": "Graphics Card",
      "brand": "ASUS",
      "price": 45000,
      "stock": 10,
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/products`
**Purpose:** Create product

**Request Body:**
```json
{
  "name": "Intel Core i5-13400F",
  "category": "Processor",
  "brand": "Intel",
  "price": 28000,
  "stock": 15,
  "description": "10-core processor",
  "imageUrl": "https://..."
}
```

**⚠️ Auto-set createdAt:**
```javascript
// MongoDB
const product = new Product({
  ...req.body,
  createdAt: new Date(), // Auto timestamp
  updatedAt: new Date()
});

// SQL
INSERT INTO products (name, category, created_at, updated_at)
VALUES (?, ?, NOW(), NOW());
```

#### PUT `/api/admin/products/:id`
**Purpose:** Update product

**⚠️ Auto-update updatedAt:**
```javascript
// MongoDB
await Product.findByIdAndUpdate(id, {
  ...req.body,
  updatedAt: new Date()
});

// SQL
UPDATE products SET ..., updated_at = NOW() WHERE id = ?;
```

#### DELETE `/api/admin/products/:id`
**Purpose:** Delete product

---

### 4. Prebuilds API

#### GET `/api/prebuilds` (PUBLIC - Already exists)
**Purpose:** Get published prebuilds

**⚠️ IMPORTANT - Sort by createdAt:**
```javascript
// MongoDB
const prebuilds = await Prebuild.find({ status: 'published' })
  .sort({ createdAt: -1 }); // Newest first

// SQL
SELECT * FROM prebuilds 
WHERE status = 'published'
ORDER BY created_at DESC;
```

#### GET `/api/admin/prebuilds`
**Purpose:** Get all prebuilds (admin)

**Response:**
```json
{
  "ok": true,
  "prebuilds": [
    {
      "_id": "prebuild123",
      "title": "Gaming Beast Pro",
      "description": "Ultimate gaming PC",
      "price": 250000,
      "category": "Gaming",
      "components": [
        {
          "type": "CPU",
          "productId": "prod123",
          "name": "Intel i9-13900K"
        }
      ],
      "featured": true,
      "status": "published",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/prebuilds`
**Purpose:** Create prebuild

#### PUT `/api/admin/prebuilds/:id`
**Purpose:** Update prebuild

#### DELETE `/api/admin/prebuilds/:id`
**Purpose:** Delete prebuild

---

### 5. Deals API

#### GET `/api/admin/deals`
**Purpose:** Get all deals (admin)

**Response:**
```json
{
  "ok": true,
  "deals": [
    {
      "_id": "deal123",
      "name": "Summer Sale",
      "code": "SUMMER2024",
      "discountType": "percentage",
      "discountValue": 15,
      "targetType": "category",
      "targetCategories": ["Graphics Card"],
      "startDate": "2024-06-01T00:00:00Z",
      "endDate": "2024-06-30T23:59:59Z",
      "maxRedemptions": 100,
      "redemptionCount": 0,
      "active": true,
      "showBadge": true,
      "priority": 1,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/deals`
**Purpose:** Create deal

#### PUT `/api/admin/deals/:id`
**Purpose:** Update deal

#### DELETE `/api/admin/deals/:id`
**Purpose:** Delete deal

#### GET `/api/deals/active` (PUBLIC)
**Purpose:** Get active deals only

**Logic:**
```javascript
const now = new Date();
const activeDeals = await Deal.find({
  active: true,
  $or: [
    { startDate: { $lte: now }, endDate: { $gte: now } },
    { startDate: { $lte: now }, endDate: null }
  ]
}).sort({ priority: -1 });
```

---

## 🗃️ Database Schemas

### Category Schema
```javascript
{
  name: String (required, unique),
  slug: String (required, unique),
  description: String,
  alternativeNames: [String], // e.g., ['CPU', 'Processor']
  brands: [String],
  parent: ObjectId (ref: 'Category'),
  published: Boolean (default: true),
  sortOrder: Number (default: 0),
  productCount: Number (virtual or computed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Brand Schema
```javascript
{
  name: String (required, unique),
  description: String,
  website: String,
  country: String,
  productCount: Number (virtual or computed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Product Schema
```javascript
{
  name: String (required),
  category: String (required), // Match category.name
  brand: String,
  price: Number (required),
  stock: Number (default: 0),
  description: String,
  imageUrl: String,
  specifications: Object,
  featured: Boolean (default: false),
  createdAt: Date (auto), // ⚠️ IMPORTANT for sorting
  updatedAt: Date (auto)
}
```

**⚠️ CRITICAL: Index on createdAt for sorting performance**
```javascript
// MongoDB
productSchema.index({ createdAt: -1 });

// SQL
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

---

## 🔄 Category-Product Filtering

### How Products Match Categories:

**Products saved in database:**
```json
{ "name": "RTX 4060", "category": "Graphics Card" }
{ "name": "RTX 4070", "category": "GPU" }
{ "name": "i5-13400F", "category": "Processor" }
{ "name": "i9-13900K", "category": "CPU" }
```

**Category alternative names:**
```javascript
{
  "name": "Graphics Card",
  "alternativeNames": ["GPU", "Video Card"]
}
{
  "name": "Processor",
  "alternativeNames": ["CPU"]
}
```

**Query Logic:**
```javascript
// Get products for "Graphics Card" category
const category = await Category.findOne({ slug: 'graphics-card' });
const categoryMatches = [
  category.name, // "Graphics Card"
  ...category.alternativeNames // ["GPU", "Video Card"]
];

const products = await Product.find({
  category: { $in: categoryMatches }
}).sort({ createdAt: -1 });
```

---

## 📊 Product Counting

**Update productCount for categories:**
```javascript
// When product is created/updated/deleted
const updateCategoryCount = async (categoryName) => {
  const count = await Product.countDocuments({ category: categoryName });
  await Category.updateOne(
    { name: categoryName },
    { productCount: count }
  );
};
```

**Update productCount for brands:**
```javascript
const updateBrandCount = async (brandName) => {
  const count = await Product.countDocuments({ brand: brandName });
  await Brand.updateOne(
    { name: brandName },
    { productCount: count }
  );
};
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T:
```javascript
// Missing sort
const products = await Product.find({});

// Wrong sort direction
const products = await Product.find({}).sort({ createdAt: 1 });

// Hardcoded data
const categories = [
  { name: 'Graphics Card' },
  { name: 'Processor' }
];
```

### ✅ DO:
```javascript
// Correct sort (newest first)
const products = await Product.find({})
  .sort({ createdAt: -1 });

// Load from database
const categories = await Category.find({ published: true })
  .sort({ sortOrder: 1 });
```

---

## 🚀 Quick Setup Example (Node.js + Express + MongoDB)

```javascript
// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories (admin)
router.get('/admin/categories', async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ sortOrder: 1 });
    
    res.json({ ok: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create category
router.post('/admin/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    
    res.json({ ok: true, category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update category
router.put('/admin/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({ ok: true, category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE category
router.delete('/admin/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET public categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ published: true })
      .sort({ sortOrder: 1 });
    
    res.json({ ok: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## ✅ Testing Checklist

- [ ] Categories seed correctly from frontend
- [ ] Brands seed correctly (60+ brands)
- [ ] Products sort by `createdAt DESC` (newest first)
- [ ] Category filtering shows correct products
- [ ] Product counts update automatically
- [ ] Prebuilds load from real database
- [ ] Deals activate based on schedule
- [ ] Alternative category names work (e.g., GPU → Graphics Card)

---

## 📝 Summary

**Key Points:**
1. ✅ All data from **real database** (no fake/hardcoded data)
2. ✅ Products sorted by `createdAt DESC` (newest first)
3. ✅ Categories auto-display products based on `category` field
4. ✅ Support alternative category names (GPU/Graphics Card)
5. ✅ Product counts auto-update
6. ✅ Published/draft filtering
7. ✅ Admin authentication required

**Frontend is 100% ready and waiting for these APIs!**
