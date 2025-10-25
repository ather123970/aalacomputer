import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true },
  name: String,
  price: mongoose.Schema.Types.Mixed,
  img: String,
  description: String,
  tags: [String],
  specs: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
