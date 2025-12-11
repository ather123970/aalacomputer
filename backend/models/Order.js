const mongoose = require('mongoose');
const crypto = require('crypto');

const ItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  qty: Number,
  price: Number,
  img: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'AC-' + crypto.randomBytes(6).toString('hex').toUpperCase()
  },
  items: [ItemSchema],
  total: Number,
  status: {
    type: String,
    enum: ['order_placed', 'confirmed', 'shipped', 'cancelled'],
    default: 'order_placed'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: String
  }],
  customer: {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    address: String,
    city: String
  },
  paymentMethod: String,
  cancellationRequested: { type: Boolean, default: false },
  cancellationReason: String,
  cancelledAt: Date,
  shippedAt: Date,
  scheduledDeletion: Date // Set to 3 days after shipped
}, { timestamps: true });

// Pre-save hook to update status history
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: 'system'
    });

    // Set timestamps for status changes
    if (this.status === 'shipped') {
      this.shippedAt = new Date();
      // Schedule deletion for 3 days later
      this.scheduledDeletion = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
