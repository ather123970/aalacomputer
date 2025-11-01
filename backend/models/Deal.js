const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true },
  name: String,
  title: String,
  price: mongoose.Schema.Types.Mixed,
  img: String,
  imageUrl: String,
  description: String,
  category: String,
  tags: [String],
  specs: [String],
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  target: String, // For deals: target audience
  tag: String, // For deals: display tag (Budget, Value, Premium)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models && mongoose.models.Deal ? mongoose.models.Deal : mongoose.model('Deal', DealSchema);
