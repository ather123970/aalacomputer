const express = require('express');
const Order = require('./models/Order.js');
const { authMiddleware } = require('./middleware.js');

const router = express.Router();

// Public route - Track order by tracking ID
router.get('/track/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;

        if (!trackingId || trackingId.trim() === '') {
            return res.status(400).json({
                ok: false,
                message: 'Please provide a tracking ID'
            });
        }

        const order = await Order.findOne({
            trackingId: trackingId.toUpperCase().trim()
        }).lean();

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'Order not found. Please check your tracking ID.'
            });
        }

        // Calculate if order can be cancelled (within 24 hours)
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        const canCancel = orderAge < 24 * 60 * 60 * 1000 &&
            order.status === 'order_placed' &&
            !order.cancellationRequested;

        return res.json({
            ok: true,
            order: {
                trackingId: order.trackingId,
                items: order.items,
                total: order.total,
                status: order.status,
                statusHistory: order.statusHistory,
                customer: {
                    name: order.customer.name,
                    phone: order.customer.phone,
                    city: order.customer.city
                },
                createdAt: order.createdAt,
                canCancel,
                cancellationRequested: order.cancellationRequested,
                shippedAt: order.shippedAt
            }
        });
    } catch (error) {
        console.error('Track order error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to track order. Please try again.'
        });
    }
});

// Public route - Create new order (from checkout)
router.post('/create', async (req, res) => {
    try {
        const { items, total, customer, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!customer || !customer.name || !customer.phone) {
            return res.status(400).json({
                ok: false,
                message: 'Customer name and phone are required'
            });
        }

        // Create new order
        const order = await Order.create({
            items,
            total,
            customer,
            paymentMethod: paymentMethod || 'cod',
            status: 'order_placed'
        });

        return res.json({
            ok: true,
            order: {
                trackingId: order.trackingId,
                _id: order._id
            },
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to create order. Please try again.'
        });
    }
});

// Public route - Request order cancellation
router.post('/cancel/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({
            trackingId: trackingId.toUpperCase().trim()
        });

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        if (orderAge > 24 * 60 * 60 * 1000) {
            return res.status(400).json({
                ok: false,
                message: 'Cancellation period expired. Orders can only be cancelled within 24 hours.'
            });
        }

        if (order.status !== 'order_placed') {
            return res.status(400).json({
                ok: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        if (order.cancellationRequested) {
            return res.status(400).json({
                ok: false,
                message: 'Cancellation already requested for this order'
            });
        }

        // Mark cancellation request
        order.cancellationRequested = true;
        order.cancellationReason = reason || 'No reason provided';
        await order.save();

        return res.json({
            ok: true,
            message: 'Cancellation request submitted. Our team will process it shortly.'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to cancel order. Please try again.'
        });
    }
});

// Admin route - Get all orders
router.get('/admin/orders', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Order.countDocuments(query);

        return res.json({
            ok: true,
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to fetch orders'
        });
    }
});

// Admin route - Update order status
router.patch('/admin/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminId } = req.body;

        if (!['order_placed', 'confirmed', 'shipped', 'cancelled'].includes(status)) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'Order not found'
            });
        }

        // Update status
        order.status = status;

        // Add to status history with admin info
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            updatedBy: adminId || 'admin'
        });

        await order.save();

        return res.json({
            ok: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to update order status'
        });
    }
});

// Admin route - Process cancellation request
router.patch('/admin/orders/:id/approve-cancellation', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'Order not found'
            });
        }

        if (!order.cancellationRequested) {
            return res.status(400).json({
                ok: false,
                message: 'No cancellation request found'
            });
        }

        order.status = 'cancelled';
        await order.save();

        return res.json({
            ok: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Approve cancellation error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to approve cancellation'
        });
    }
});

// Cleanup job - Delete shipped orders after 3 days
router.post('/admin/cleanup-shipped-orders', authMiddleware, async (req, res) => {
    try {
        const result = await Order.deleteMany({
            status: 'shipped',
            scheduledDeletion: { $lte: new Date() }
        });

        return res.json({
            ok: true,
            message: `Deleted ${result.deletedCount} shipped orders`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to cleanup orders'
        });
    }
});

// Auto-cleanup job (call this from a cron job or scheduled task)
async function autoCleanupShippedOrders() {
    try {
        const result = await Order.deleteMany({
            status: 'shipped',
            scheduledDeletion: { $lte: new Date() }
        });

        if (result.deletedCount > 0) {
            console.log(`[Auto-Cleanup] Deleted ${result.deletedCount} shipped orders`);
        }

        return result.deletedCount;
    } catch (error) {
        console.error('[Auto-Cleanup] Error:', error);
        return 0;
    }
}

// Run cleanup every 6 hours
setInterval(autoCleanupShippedOrders, 6 * 60 * 60 * 1000);

module.exports = router;
