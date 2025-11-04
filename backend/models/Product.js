const mongoose = require('mongoose');

// Simplified Product Schema matching actual database format
const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true },
  brand: { type: String, default: '' },
  Name: { type: String }, // Capital N for compatibility
  name: { type: String },
  title: { type: String },
  
  // Simple price field (direct number)
  price: { type: Number, required: true, default: 0 },

  // Image fields
  img: { type: String, default: '' },
  imageUrl: { type: String, default: '' },

  // Product details
  description: { type: String, default: '' },
  Spec: [{ type: String }], // Array of specs
  category: { type: String, default: '' },
  type: { type: String, default: '' },
  
  // Additional fields from your database
  WARRANTY: { type: String, default: '' },
  link: { type: String, default: '' },

  // Metadata
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: false,
  strict: false, // Allow additional fields from database
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pagination helper method
ProductSchema.statics.paginateProducts = async function(query = {}, page = 1, limit = 32) {
  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
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
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

ProductSchema.statics.getBrands = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.models && mongoose.models.Product ? mongoose.models.Product : mongoose.model('Product', ProductSchema);
