// models/User.js
import mongoose from 'mongoose';

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

export default mongoose.model('User', Schema);
