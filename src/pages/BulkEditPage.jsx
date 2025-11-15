import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Upload, 
  Check,
  AlertCircle,
  Zap,
  Package,
  Copy,
  CheckCircle
} from 'lucide-react';
import { apiCall } from '../config/api';

const BulkEditPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [updatedCount, setUpdatedCount] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Load data on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('bulkEditProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      navigate('/admin/bulk-manager');
    }
    loadCategories();
  }, [navigate]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await apiCall('/api/admin/categories');
      const list = Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData.categories || categoriesData.data || []);
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Handle product field update
  const updateProduct = useCallback((productId, field, value) => {
    setProducts(prev => prev.map(product => 
      product._id === productId 
        ? { ...product, [field]: value }
        : product
    ));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((productId, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      updateProduct(productId, 'imageUrl', e.target.result);
      updateProduct(productId, 'img', e.target.result);
    };
    reader.readAsDataURL(file);
  }, [updateProduct]);

  const copyToClipboard = (productId, text) => {
    if (!text) return;
    const fallbackCopy = () => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
      }
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Create new category
  const createCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const payload = {
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        published: true
      };

      await apiCall('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      await loadCategories();
      setNewCategoryName('');
      setShowCreateCategory(false);
      setMessage({ type: 'success', text: `Category "${newCategoryName}" created successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error creating category:', error);
      setMessage({ type: 'error', text: 'Failed to create category' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  }, [newCategoryName, loadCategories]);

  // Save all products
  const saveAllProducts = useCallback(async () => {
    setSaving(true);
    setUpdatedCount(0);
    
    try {
      let successCount = 0;
      
      for (const product of products) {
        try {
          const updateData = {
            name: product.name || product.title,
            title: product.title || product.name,
            price: Number(product.price) || 0,
            category: product.category,
            imageUrl: product.imageUrl || product.img,
            img: product.img || product.imageUrl
          };
          
          await apiCall(`/api/admin/products/${product._id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          });
          
          successCount++;
          setUpdatedCount(successCount);
        } catch (error) {
          console.error(`Error updating product ${product._id}:`, error);
        }
      }
      
      setMessage({ 
        type: 'success', 
        text: `Successfully updated ${successCount} out of ${products.length} products!` 
      });
      
      // Clear localStorage and redirect after success
      setTimeout(() => {
        localStorage.removeItem('bulkEditProducts');
        navigate('/admin/bulk-manager');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving products:', error);
      setMessage({ type: 'error', text: 'Failed to save products' });
    } finally {
      setSaving(false);
    }
  }, [products, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/bulk-manager')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Edit Products</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Editing {products.length} products • {updatedCount > 0 && `${updatedCount} updated`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {saving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Saving... {updatedCount}/{products.length}</span>
                </div>
              )}
              
              <button
                onClick={saveAllProducts}
                disabled={saving || products.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Update All ({products.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg ${
              message.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Category Modal */}
      <AnimatePresence>
        {showCreateCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Create New Category</h3>
                <button
                  onClick={() => setShowCreateCategory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && createCategory()}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateCategory(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products selected</h3>
            <p className="text-gray-500 mb-4">Go back and select products to edit</p>
            <button
              onClick={() => navigate('/admin/bulk-manager')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Select Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Horizontal Layout */}
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                  {/* Product Image */}
                  <div className="relative w-full lg:w-48 h-48 bg-gray-50 group rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={product.imageUrl || product.img || '/placeholder.svg'}
                      alt={product.name || product.title}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    
                    {/* Image Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white/90 p-3 rounded-full hover:bg-white transition-colors">
                        <Upload className="w-6 h-6 text-gray-700" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(product._id, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Product Fields - Horizontal Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={product.name || product.title || ''}
                        onChange={(e) => updateProduct(product._id, 'name', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const text = product.name || product.title || '';
                          copyToClipboard(product._id, text);
                        }}
                        className={`px-3 py-2 border rounded-xl flex items-center justify-center transition-all ${
                          copiedId === product._id
                            ? 'bg-green-100 border-green-300'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        title="Copy name to clipboard"
                      >
                        {copiedId === product._id ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={product.price || ''}
                      onChange={(e) => updateProduct(product._id, 'price', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={product.imageUrl || product.img || ''}
                      onChange={(e) => {
                        updateProduct(product._id, 'imageUrl', e.target.value);
                        updateProduct(product._id, 'img', e.target.value);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={product.category || ''}
                        onChange={(e) => updateProduct(product._id, 'category', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => setShowCreateCategory(true)}
                        className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        title="Create New Category"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEditPage;
