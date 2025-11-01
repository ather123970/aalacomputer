const mongoose = require('mongoose');
const { normalizeImageUrl } = require('../utils/imageHelper');

const ProductSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    title: String,
    price: mongoose.Schema.Types.Mixed,
    img: {
        type: String,
        set: function(v) {
            return normalizeImageUrl(v);
        }
    },
    imageUrl: {
        type: String,
        set: function(v) {
            return normalizeImageUrl(v);
        }
    },
    description: String,
    category: String,
    tags: [String],
    specs: [String],
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            // Ensure both img and imageUrl are always present
            ret.img = ret.img || ret.imageUrl || '/placeholder.svg';
            ret.imageUrl = ret.imageUrl || ret.img || '/placeholder.svg';
            return ret;
        }
    }
});

// Pre-save middleware to sync image fields
ProductSchema.pre('save', function(next) {
    if (this.img && !this.imageUrl) this.imageUrl = this.img;
    if (this.imageUrl && !this.img) this.img = this.imageUrl;
    next();
});

module.exports = mongoose.models && mongoose.models.Product 
    ? mongoose.models.Product 
    : mongoose.model('Product', ProductSchema);