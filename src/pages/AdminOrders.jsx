import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, Filter, ChevronDown, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AdminOrders.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const statusOptions = [
        { value: 'order_placed', label: 'Order Placed', color: '#3b82f6' },
        { value: 'confirmed', label: 'Confirmed', color: '#f59e0b' },
        { value: 'shipped', label: 'Shipped', color: '#10b981' },
        { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
    ];

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/order-tracking/admin/orders?status=${filter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.ok) {
                setOrders(data.orders || []);
            } else {
                setError(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdating(orderId);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/order-tracking/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: newStatus,
                    adminId: 'admin' // You can get this from user context
                })
            });

            const data = await response.json();

            if (data.ok) {
                // Update the order in the local state
                setOrders(orders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                ));
                alert(`Order status updated to ${newStatus}`);
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Update status error:', err);
            alert('Failed to update order status. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'order_placed':
                return <Package size={18} />;
            case 'confirmed':
                return <CheckCircle size={18} />;
            case 'shipped':
                return <Truck size={18} />;
            case 'cancelled':
                return <XCircle size={18} />;
            default:
                return <Clock size={18} />;
        }
    };

    const filteredOrders = orders.filter(order =>
        order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-orders-page">
            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Order Management</h1>
                        <p className="admin-subtitle">Manage and update order statuses</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-card">
                            <Package size={24} />
                            <div>
                                <div className="stat-value">{orders.length}</div>
                                <div className="stat-label">Total Orders</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by tracking ID or customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-buttons">
                        {[
                            { value: 'all', label: 'All Orders' },
                            { value: 'order_placed', label: 'Order Placed' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <Loader className="spinner-large" size={48} />
                        <p>Loading orders...</p>
                    </div>
                ) : (
                    <>
                        {/* Orders Table */}
                        {filteredOrders.length === 0 ? (
                            <div className="empty-state">
                                <Package size={64} />
                                <h3>No Orders Found</h3>
                                <p>There are no orders matching your criteria</p>
                            </div>
                        ) : (
                            <div className="orders-table-container">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Tracking ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <motion.tr
                                                key={order._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="order-row"
                                            >
                                                <td>
                                                    <span className="tracking-id">{order.trackingId}</span>
                                                </td>
                                                <td>
                                                    <div className="customer-info">
                                                        <div className="customer-name">{order.customer?.name}</div>
                                                        <div className="customer-phone">{order.customer?.phone}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="items-count">{order.items?.length || 0} items</span>
                                                </td>
                                                <td>
                                                    <span className="order-total">Rs. {order.total?.toLocaleString()}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${order.status}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="order-date">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="status-selector">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                            disabled={updating === order._id}
                                                            className="status-select"
                                                        >
                                                            {statusOptions.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {updating === order._id && (
                                                            <Loader className="spinner-small" size={16} />
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
