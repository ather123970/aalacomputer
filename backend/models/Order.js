import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  qty: Number,
  price: Number,
  img: String
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [ItemSchema],
  total: Number,
  status: { type: String, default: 'pending' }
}, { timestamps: true })

export default mongoose.model('Order', OrderSchema)
