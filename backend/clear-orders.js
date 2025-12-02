// Script to clear all orders from MongoDB
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

// Order Schema
const OrderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    trackingId: String,
    items: Array,
    total: Number,
    status: String,
    statusHistory: Array,
    customer: Object,
    paymentMethod: String,
    cancellationRequested: Boolean,
    cancellationReason: String,
    cancelledAt: Date,
    shippedAt: Date,
    scheduledDeletion: Date
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

async function clearOrders() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await Order.countDocuments();
        console.log(`Found ${count} orders in database`);

        if (count > 0) {
            const result = await Order.deleteMany({});
            console.log(`✅ Successfully deleted ${result.deletedCount} orders`);
        } else {
            console.log('No orders to delete');
        }

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearOrders();
