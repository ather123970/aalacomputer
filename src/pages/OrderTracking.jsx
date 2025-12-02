import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle, Truck, XCircle, Clock, AlertCircle, Phone, MapPin, Home, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/OrderTracking.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);

    // Auto-search if tracking ID is in URL
    useEffect(() => {
        const urlTrackingId = searchParams.get('id');
        if (urlTrackingId && urlTrackingId.trim()) {
            setTrackingId(urlTrackingId.trim());
            // Auto-trigger search
            handleTrackOrder(urlTrackingId.trim());
        }
    }, [searchParams]);

    const handleTrackOrder = async (id) => {
        const searchId = id || trackingId;

        if (!searchId.trim()) {
            setError('Please enter a tracking ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await fetch(`${API_URL}/api/order-tracking/track/${searchId.trim()}`);
            const data = await response.json();

            if (data.ok) {
                setOrder(data.order);
                setError('');
            } else {
                setError(data.message || 'Order not found');
                setOrder(null);
            }
        } catch (err) {
            console.error('Track error:', err);
            setError('Failed to track order. Please try again.');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const trackOrder = async (e) => {
        e.preventDefault();
        handleTrackOrder();
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        setCancelling(true);
        try {
            const response = await fetch(`${API_URL}/api/order-tracking/cancel/${order.trackingId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: cancelReason })
            });

            const data = await response.json();

            if (data.ok) {
                alert(data.message);
                setShowCancelForm(false);
                setCancelReason('');
                // Refresh order data
                handleTrackOrder(order.trackingId);
            } else {
                alert(data.message || 'Failed to cancel order');
            }
        } catch (err) {
            console.error('Cancel error:', err);
            alert('Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'order_placed':
                return <Package className="status-icon" />;
            case 'confirmed':
                return <CheckCircle className="status-icon" />;
            case 'shipped':
                return <Truck className="status-icon" />;
            case 'cancelled':
                return <XCircle className="status-icon" />;
            default:
                return <Clock className="status-icon" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'order_placed':
                return 'Order Placed';
            case 'confirmed':
                return 'Confirmed';
            case 'shipped':
                return 'Shipped';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const statusSteps = [
        { key: 'order_placed', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'shipped', label: 'Shipped', icon: Truck }
    ];

    const getStatusIndex = (status) => {
        if (status === 'cancelled') return -1;
        return statusSteps.findIndex(s => s.key === status);
    };

    return (
        <div className="order-tracking-page">
            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                className="back-home-btn"
            >
                <ArrowLeft size={20} />
                Back to Home
            </button>

            {/* Hero Section */}
            <motion.div
                className="tracking-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="hero-content">
                    <h1 className="hero-title">
                        Track Your Order
                    </h1>
                    <p className="hero-subtitle">
                        Enter your tracking ID to see real-time order status
                    </p>
                </div>

                {/* Search Form */}
                <motion.form
                    className="tracking-search-form"
                    onSubmit={trackOrder}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="search-input-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter your tracking ID (e.g., AC-1A2B3C4D5E6F)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="search-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" />
                                Tracking...
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                Track Order
                            </>
                        )}
                    </button>
                </motion.form>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AlertCircle size={20} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Order Details */}
            <AnimatePresence>
                {order && (
                    <motion.div
                        className="order-details-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Order Header */}
                        <div className="order-header">
                            <div className="order-id-section">
                                <h2 className="order-id">Order #{order.trackingId}</h2>
                                <p className="order-date">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className={`status-badge status-${order.status}`}>
                                {getStatusIcon(order.status)}
                                {getStatusLabel(order.status)}
                            </div>
                        </div>

                        {/* Status Timeline */}
                        {order.status !== 'cancelled' && (
                            <div className="status-timeline">
                                <h3 className="timeline-title">Order Progress</h3>
                                <div className="timeline-steps">
                                    {statusSteps.map((step, index) => {
                                        const currentIndex = getStatusIndex(order.status);
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;

                                        return (
                                            <div key={step.key} className="timeline-step">
                                                <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                                                <motion.div
                                                    className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: index * 0.1, type: 'spring' }}
                                                >
                                                    <step.icon size={24} />
                                                </motion.div>
                                                <div className="step-label">{step.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Customer Info & Items Grid */}
                        <div className="order-content-grid">
                            {/* Customer Information */}
                            <div className="info-card">
                                <h3 className="card-title">Customer Information</h3>
                                <div className="info-list">
                                    <div className="info-item">
                                        <div className="info-label">Name</div>
                                        <div className="info-value">{order.customer.name}</div>
                                    </div>
                                    <div className="info-item">
                                        <Phone size={16} />
                                        <div className="info-label">Phone</div>
                                        <div className="info-value">{order.customer.phone}</div>
                                    </div>
                                    {order.customer.city && (
                                        <div className="info-item">
                                            <MapPin size={16} />
                                            <div className="info-label">City</div>
                                            <div className="info-value">{order.customer.city}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="info-card">
                                <h3 className="card-title">Order Items ({order.items?.length || 0})</h3>
                                <div className="items-list">
                                    {order.items?.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="item-row"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            {item.img && (
                                                <img src={item.img} alt={item.name} className="item-image" />
                                            )}
                                            <div className="item-details">
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-meta">
                                                    Qty: {item.qty} × Rs. {item.price?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="item-total">
                                                Rs. {(item.qty * item.price)?.toLocaleString()}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="order-total">
                                    <span>Total Amount</span>
                                    <span className="total-amount">Rs. {order.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Section - AT BOTTOM */}
                        {order.canCancel && !showCancelForm && !order.cancellationRequested && (
                            <motion.div
                                className="cancel-section"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <button
                                    className="cancel-button"
                                    onClick={() => setShowCancelForm(true)}
                                >
                                    <XCircle size={20} />
                                    Cancel Order
                                </button>
                                <p className="cancel-note">
                                    You can cancel this order within 24 hours of placement
                                </p>
                            </motion.div>
                        )}

                        {/* Cancellation Requested Message */}
                        {order.cancellationRequested && (
                            <motion.div
                                className="cancellation-pending"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertCircle size={24} />
                                <div>
                                    <h4>Cancellation Request Pending</h4>
                                    <p>Your cancellation request is being processed by our team.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Cancellation Form */}
                        <AnimatePresence>
                            {showCancelForm && (
                                <motion.div
                                    className="cancel-form"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <h3>Request Order Cancellation</h3>
                                    <textarea
                                        className="cancel-reason-input"
                                        placeholder="Please provide a reason for cancellation..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        rows={4}
                                    />
                                    <div className="cancel-form-buttons">
                                        <button
                                            className="submit-cancel-button"
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? 'Submitting...' : 'Submit Cancellation'}
                                        </button>
                                        <button
                                            className="cancel-cancel-button"
                                            onClick={() => {
                                                setShowCancelForm(false);
                                                setCancelReason('');
                                            }}
                                            disabled={cancelling}
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Status History */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                            <div className="status-history">
                                <h3 className="history-title">Status History</h3>
                                <div className="history-timeline">
                                    {order.statusHistory.slice().reverse().map((history, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="history-item"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className="history-icon">
                                                {getStatusIcon(history.status)}
                                            </div>
                                            <div className="history-content">
                                                <div className="history-status">{getStatusLabel(history.status)}</div>
                                                <div className="history-time">
                                                    {new Date(history.timestamp).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            {!order && !loading && (
                <motion.div
                    className="instructions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>How to track your order:</h3>
                    <ol>
                        <li>Find your tracking ID in the order confirmation email or SMS</li>
                        <li>Enter the tracking ID in the search box above</li>
                        <li>View your order status, details, and delivery timeline</li>
                        <li>Cancel within 24 hours if needed</li>
                    </ol>
                </motion.div>
            )}
        </div>
    );
};

export default OrderTracking;
