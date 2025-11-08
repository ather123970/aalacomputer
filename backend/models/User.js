// models/User.js - CommonJS version
const mongoose = require('mongoose');

const Schema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // optional for google users
    googleId: { type: String, index: true, sparse: true },
    avatar: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', Schema);
