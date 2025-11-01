const mongoose = require('mongoose');

const PrebuildSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models && mongoose.models.Prebuild ? mongoose.models.Prebuild : mongoose.model('Prebuild', PrebuildSchema);
