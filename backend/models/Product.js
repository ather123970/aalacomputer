const mongoose = require('mongoose');

// Simplified Product Schema matching actual database format
const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true },
  
  // Category & Brand (with IDs for strict filtering)
  category_id: { type: Number, index: true }, // NEW: Numeric category ID
  category: { type: String, default: '', index: true }, // Legacy string category
  categorySlug: { type: String, index: true }, // Category slug for URL routing
  
  brand_id: { type: Number }, // NEW: Numeric brand ID (optional)
  brand: { type: String, default: '', index: true }, // Brand name
  
  // Product names (multiple formats for compatibility)
  Name: { type: String }, // Capital N for compatibility
  name: { type: String },
  title: { type: String },
  
  // Simple price field (direct number)
  price: { type: Number, required: true, default: 0 },

  // Image fields
  img: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  image: { type: String, default: '' }, // Additional image field

  // Product details
  description: { type: String, default: '' },
  Spec: [{ type: String }], // Array of specs
  type: { type: String, default: '' },
  
  // Status flags
  is_active: { type: Boolean, default: true, index: true }, // NEW: Active status
  inStock: { type: Boolean, default: true }, // Stock status
  
  // Additional fields from your database
  WARRANTY: { type: String, default: '' },
  link: { type: String, default: '' },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: false,
  strict: false, // Allow additional fields from database
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for optimal query performance
ProductSchema.index({ category: 1, is_active: 1, brand: 1 }); // Category + active + brand filtering
ProductSchema.index({ category: 1, is_active: 1, price: 1 }); // Category + active + price sorting
ProductSchema.index({ category_id: 1, is_active: 1 }); // Category ID filtering
ProductSchema.index({ brand: 1, is_active: 1 }); // Brand filtering
ProductSchema.index({ name: 'text', Name: 'text', title: 'text' }); // Text search on names

// Pagination helper method
ProductSchema.statics.paginateProducts = async function(query = {}, page = 1, limit = 32) {
  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // Use lean() for faster reads
    this.countDocuments(query)
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + products.length < total
  };
};

// Category and brand aggregation helper
ProductSchema.statics.getCategories = async function() {
  return this.aggregate([
    { $match: { is_active: { $ne: false } } }, // Only active products
    {
      $group: {
        _id: { category: '$category', category_id: '$category_id' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.category': 1 } }
  ]);
};

ProductSchema.statics.getBrands = async function(categoryId = null) {
  const match = { is_active: { $ne: false } };
  if (categoryId) {
    match.category_id = categoryId;
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// NEW: Get products by category ID (strict filtering)
ProductSchema.statics.getByCategoryId = async function(categoryId, page = 1, limit = 32) {
  const query = { 
    category_id: parseInt(categoryId),
    is_active: { $ne: false }
  };
  return this.paginateProducts(query, page, limit);
};

// NEW: Get single product by ID (optimized)
ProductSchema.statics.getById = async function(productId) {
  return this.findOne({
    $or: [
      { _id: productId },
      { id: productId }
    ]
  }).lean(); // Use lean() for faster reads
};

module.exports = mongoose.models && mongoose.models.Product ? mongoose.models.Product : mongoose.model('Product', ProductSchema);