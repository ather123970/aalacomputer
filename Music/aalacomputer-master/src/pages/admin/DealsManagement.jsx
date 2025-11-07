import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Tag, AlertCircle, CheckCircle, Save, Percent, DollarSign, Calendar
} from 'lucide-react';
import { apiCall } from '../../config/api';

const DealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsData, productsData, categoriesData] = await Promise.all([
        apiCall('/api/admin/deals').catch(() => ({ deals: [] })),
        apiCall('/api/products?limit=100').catch(() => ({ products: [] })),
        apiCall('/api/admin/categories').catch(() => ({ categories: [] }))
      ]);
      
      setDeals(dealsData.deals || []);
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dealData) => {
    try {
      const endpoint = editingDeal 
        ? `/api/admin/deals/${editingDeal._id}`
        : '/api/admin/deals';
      
      await apiCall(endpoint, {
        method: editingDeal ? 'PUT' : 'POST',
        body: JSON.stringify(dealData)
      });

      setSuccess(editingDeal ? 'Deal updated!' : 'Deal created!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      setEditingDeal(null);
      loadData();
    } catch (error) {
      setError(error.message || 'Failed to save deal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await apiCall(`/api/admin/deals/${id}`, { method: 'DELETE' });
      setSuccess('Deal deleted!');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (error) {
      setError('Failed to delete');
    }
  };

  const filteredDeals = deals.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-blue-600" />
            Deals & Promotions
          </h2>
          <p className="text-gray-600 mt-1">Manage discounts and special offers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingDeal(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Deal</span>
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search deals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const now = new Date();
          const start = deal.startDate ? new Date(deal.startDate) : null;
          const end = deal.endDate ? new Date(deal.endDate) : null;
          const isActive = deal.active && (!start || start <= now) && (!end || end >= now);

          return (
            <motion.div
              key={deal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{deal.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-2xl font-bold text-red-600">
                  {deal.discountType === 'percentage' ? (
                    <>
                      <Percent className="w-5 h-5" />
                      <span>{deal.discountValue}% OFF</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      <span>Rs. {deal.discountValue} OFF</span>
                    </>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {deal.targetType === 'product' && (
                    <div>Target: {deal.targetProducts?.length || 0} products</div>
                  )}
                  {deal.targetType === 'category' && (
                    <div>Target: {deal.targetCategories?.length || 0} categories</div>
                  )}
                </div>

                {deal.startDate && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(deal.startDate).toLocaleDateString()} - {deal.endDate ? new Date(deal.endDate).toLocaleDateString() : 'No end'}
                  </div>
                )}

                {deal.maxRedemptions && (
                  <div className="text-xs text-gray-500">
                    Max uses: {deal.redemptionCount || 0} / {deal.maxRedemptions}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setEditingDeal(deal);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(deal._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No deals found</h3>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <DealModal
            deal={editingDeal}
            products={products}
            categories={categories}
            onClose={() => {
              setShowModal(false);
              setEditingDeal(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DealModal = ({ deal, products, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    targetType: 'product',
    targetProducts: [],
    targetCategories: [],
    startDate: '',
    endDate: '',
    maxRedemptions: null,
    active: true,
    showBadge: true,
    priority: 0,
    ...deal
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">{deal ? 'Edit Deal' : 'Create Deal'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Deal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Summer Sale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SUMMER2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder={formData.discountType === 'percentage' ? '10' : '1000'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target *</label>
            <select
              value={formData.targetType}
              onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="product">Specific Products</option>
              <option value="category">Entire Categories</option>
              <option value="all">All Products (Site-wide)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Max Redemptions</label>
              <input
                type="number"
                min="0"
                value={formData.maxRedemptions || ''}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority deals apply first</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">Active (deal is enabled)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.showBadge}
                onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">Show badge on product cards</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{deal ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DealsManagement;
