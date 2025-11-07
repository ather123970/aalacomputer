// storage.js - CommonJS version
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Get MongoDB URI from environment or use MongoDB Atlas as fallback (no local URI)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

let inited = false;

// Define a generic storage model: key (like filename) + data (any JSON)
const StorageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const Storage = mongoose.models.Storage || mongoose.model('Storage', StorageSchema);

async function initOnce() {
  if (inited || mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  inited = true;
}

/**
 * readJSON(filename, defaultValue)
 * - filename: string used as the key (same as old filename)
 * - defaultValue: returned if no doc found or error
 */
async function readJSON(filename, defaultValue = null) {
  await initOnce();
  try {
    const doc = await Storage.findOne({ key: filename }).lean();
    if (!doc) return defaultValue;
    return doc.data ?? defaultValue;
  } catch (err) {
    console.error('storage.readJSON error:', err);
    return defaultValue;
  }
}

/**
 * writeJSON(filename, data)
 * - upserts the document for filename with given data
 * - returns the saved document (lean)
 */
async function writeJSON(filename, data) {
  await initOnce();
  try {
    const updated = await Storage.findOneAndUpdate(
      { key: filename },
      { $set: { data } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return updated;
  } catch (err) {
    console.error('storage.writeJSON error:', err);
    throw err;
  }
}

/**
 * Optional: close connection (useful in scripts/tests)
 */
async function close() {
  try {
    await mongoose.disconnect();
    inited = false;
  } catch (err) {
    console.error('storage.close error:', err);
  }
}

module.exports = { readJSON, writeJSON, close };
