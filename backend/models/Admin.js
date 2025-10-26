const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  email: { type: String, index: true, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.models && mongoose.models.Admin ? mongoose.models.Admin : mongoose.model('Admin', AdminSchema);
