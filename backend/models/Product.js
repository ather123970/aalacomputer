const mongoose = require('mongoose');

// Helper function to normalize URLs
function normalizeUrl(url) {
  if (!url) return '/placeholder.svg';
  
  try {
    // If it's already a full URL, return it
    new URL(url);
    return url;
  } catch (e) {
    // If it's a relative URL, make it absolute using env var or default
    if (url.startsWith('/')) {
      const baseUrl = process.env.API_BASE_URL || process.env.FRONTEND_ORIGIN || '';
      return baseUrl ? `${baseUrl}${url}` : url;
    }
  }
  return url;
}

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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure both img and imageUrl are always synced
ProductSchema.pre('save', function(next) {
  // If only one field is set, copy it to the other
  if (this.img && !this.imageUrl) this.imageUrl = this.img;
  if (this.imageUrl && !this.img) this.img = this.imageUrl;
  
  // Normalize URLs
  if (this.img) this.img = normalizeUrl(this.img);
  if (this.imageUrl) this.imageUrl = normalizeUrl(this.imageUrl);
  
  next();
});

// Handle updates to keep fields in sync
ProductSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (!update.$set) update.$set = {};
  
  // Sync img and imageUrl in updates
  if (update.$set.img && !update.$set.imageUrl) {
    update.$set.imageUrl = update.$set.img;
  } else if (update.$set.imageUrl && !update.$set.img) {
    update.$set.img = update.$set.imageUrl;
  }

  // Normalize URLs in updates
  if (update.$set.img) update.$set.img = normalizeUrl(update.$set.img);
  if (update.$set.imageUrl) update.$set.imageUrl = normalizeUrl(update.$set.imageUrl);
  
  // Always update the updatedAt timestamp
  update.$set.updatedAt = new Date();
  
  next();
});

module.exports = mongoose.models && mongoose.models.Product ? mongoose.models.Product : mongoose.model('Product', ProductSchema);
