const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true },
  name: String, // Keep for backward compatibility
  title: String, // New field
  price: mongoose.Schema.Types.Mixed,
  img: String, // Keep for backward compatibility
  imageUrl: String, // New field
  description: String,
  category: String,
  tags: [String],
  specs: [String],
  stock: { type: Number, default: 0 }, // New field
  sold: { type: Number, default: 0 }, // New field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models && mongoose.models.Product ? mongoose.models.Product : mongoose.model('Product', ProductSchema);
