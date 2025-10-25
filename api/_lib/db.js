import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB || null;

let connected = false;

async function connect() {
  if (connected) return mongoose;
  if (!MONGO_URI) throw new Error('MONGO_URI not configured');
  // reuse global mongoose in serverless to avoid new connections on each invocation
  if (global.__mongoose && global.__mongoose.connection && global.__mongoose.connection.readyState === 1) {
    connected = true;
    return global.__mongoose;
  }
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  global.__mongoose = mongoose;
  connected = true;
  return mongoose;
}

function models() {
  // Cart: sessionId or userId, items
  const CartSchema = new mongoose.Schema({
    sessionId: { type: String, index: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    items: [{ id: String, name: String, price: Number, img: String, qty: Number }]
  }, { timestamps: true });

  const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    sessionId: { type: String, index: true, sparse: true },
    items: [{ id: String, name: String, price: Number, img: String, qty: Number }],
    total: { type: Number, default: 0 }
  }, { timestamps: true });

  const UserSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    phone: { type: String }
  }, { timestamps: true });

  const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
  const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  return { Cart, Order, User };
}

export async function getDbModels() {
  await connect();
  return models();
}

export function hasMongo() {
  return !!MONGO_URI;
}
