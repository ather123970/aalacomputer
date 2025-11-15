import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB || null;

let mongooseInited = false;
let StorageModel = null;

async function initMongoose() {
  if (!MONGO_URI) return;
  if (mongooseInited) return;
  try {
    // reuse global connection in serverless environments
    if (global.__mongoose && global.__mongoose.connection) {
      StorageModel = global.__mongoose.models?.Storage;
      mongooseInited = true;
      return;
    }
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const StorageSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true, index: true }, data: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true });
    StorageModel = mongoose.models.Storage || mongoose.model('Storage', StorageSchema);
    global.__mongoose = mongoose;
    mongooseInited = true;
  } catch (e) {
    console.warn('initMongoose failed', e && (e.message || e));
    mongooseInited = false;
  }
}

export async function readJSON(name, defaultValue = null) {
  // Prefer MongoDB when configured
  if (MONGO_URI) {
    try {
      await initMongoose();
      if (StorageModel) {
        const doc = await StorageModel.findOne({ key: name }).lean().exec();
        if (!doc) return defaultValue;
        return doc.data ?? defaultValue;
      }
    } catch (e) {
      console.error('readJSON(mongo) error', e && (e.message || e));
    }
  }
  // Fallback to file system
  try {
    const p = path.join(DATA_DIR, name + '.json');
    if (!fs.existsSync(p)) return defaultValue;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || 'null') ?? defaultValue;
  } catch (e) {
    console.error('readJSON(fs) error', e && (e.message || e));
    return defaultValue;
  }
}

export async function writeJSON(name, data) {
  if (MONGO_URI) {
    try {
      await initMongoose();
      if (StorageModel) {
        const updated = await StorageModel.findOneAndUpdate({ key: name }, { $set: { data } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean().exec();
        return !!updated;
      }
    } catch (e) {
      console.error('writeJSON(mongo) error', e && (e.message || e));
    }
  }
  try {
    const p = path.join(DATA_DIR, name + '.json');
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('writeJSON(fs) error', e && (e.message || e));
    return false;
  }
}

export function hasMongo() {
  return !!MONGO_URI;
}
