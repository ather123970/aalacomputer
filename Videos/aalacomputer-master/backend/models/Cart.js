const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  specs: [String],
  type: { type: String, default: 'product' },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);