/**
 * AdminDashboardV2 - Ultra-Fast Product Management
 * 
 * Features:
 * - Inline editing (no modal needed)
 * - Auto-save on blur
 * - Bulk operations (select multiple, update all)
 * - Fast search & filter
 * - Keyboard shortcuts
 * - No full page refresh
 * - Optimized for 5000+ products
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  X, 
  Check, 
  AlertCircle, 
  Package,
  LogOut,
  Edit3,
  Plus, Edit2, Trash2, Copy, Download, Upload, Settings,
  Zap, CheckCircle, Clock, Eye, EyeOff
} from 'lucide-react';
import { apiCall } from '../config/api';

const PAGE_LIMIT = 100; // Show more products per page for efficiency

const AdminDashboardV2 = () => {
  const navigate = useNavigate();

  // Core state
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name'); // name, price, stock, date
  const [sortOrder, setSortOrder] = useState('asc');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [savingIds, setSavingIds] = useState(new Set());

  // Bulk operations
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditField, setBulkEditField] = useState('price');
  const [bulkEditValue, setBulkEditValue] = useState('');

  // View options
  const [viewMode, setViewMode] = useState('table'); // table, grid, missing-images
  const [showFilters, setShowFilters] = useState(false);

  // Missing images view state (loads from all products in DB)
  const [missingProductsSource, setMissingProductsSource] = useState([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [missingEdits, setMissingEdits] = useState({}); // { [productId]: url }
  const [missingBulkSaving, setMissingBulkSaving] = useState(false);
  const [copiedMissingId, setCopiedMissingId] = useState(null);

  const debounceRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadInitialData();
  }, [navigate]);

  // Load products when filters change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, selectedCategory, page, sortBy, sortOrder]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [catsResp] = await Promise.all([
        apiCall('/api/admin/categories').catch(() => apiCall('/api/categories').catch(() => ({ categories: [] })))
      ]);
      
      const catsList = Array.isArray(catsResp) ? catsResp : (catsResp.categories || []);
      setCategories(catsList.map(c => typeof c === 'string' ? c : c.name).filter(Boolean));
      
      await loadProducts();
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_LIMIT,
        page,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const data = await apiCall(`/api/admin/products?${params}`);
      const productsList = Array.isArray(data.products) ? data.products : [];
      
      // Sort products
      const sorted = [...productsList].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortBy) {
          case 'price':
            aVal = a.price || 0;
            bVal = b.price || 0;
            break;
          case 'stock':
            aVal = a.stock || 0;
            bVal = b.stock || 0;
            break;
          case 'name':
          default:
            aVal = (a.name || a.title || '').toLowerCase();
            bVal = (b.name || b.title || '').toLowerCase();
        }
        
        return sortOrder === 'asc' 
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1;
      });

      setProducts(sorted);
      setTotalCount(data.total || productsList.length);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    }
  };

  // Load all products (single big page) for Missing Images view
  const loadMissingProducts = async () => {
    try {
      setMissingLoading(true);

      const params = new URLSearchParams({
        limit: 5000,
        page: 1
      });

      const data = await apiCall(`/api/admin/products?${params.toString()}`);

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.products)) {
        list = data.products;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setMissingProductsSource(list);
    } catch (err) {
      console.error('Failed to load products for Missing Images view', err);
    } finally {
      setMissingLoading(false);
    }
  };

  // Save image URL (img + imageUrl + imageUrlPrimary) for a single product
  const saveProductImages = async (productId, url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return;

    if (savingIds.has(productId)) return;
    setSavingIds(prev => new Set([...prev, productId]));

    try {
      const baseProduct =
        products.find(p => p._id === productId || p.id === productId) ||
        missingProductsSource.find(p => p._id === productId || p.id === productId);

      if (!baseProduct) return;

      const updateData = {
        ...baseProduct,
        img: trimmed,
        imageUrl: trimmed,
        imageUrlPrimary: trimmed
      };

      await apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      // Update main table state
      setProducts(prev => prev.map(p =>
        (p._id === productId || p.id === productId)
          ? { ...p, img: trimmed, imageUrl: trimmed, imageUrlPrimary: trimmed }
          : p
      ));

      // Update missing-products source state
      setMissingProductsSource(prev => prev.map(p =>
        (p._id === productId || p.id === productId)
          ? { ...p, img: trimmed, imageUrl: trimmed, imageUrlPrimary: trimmed }
          : p
      ));

      // Clear local edit value for this product
      setMissingEdits(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });

      // Clear image caches so frontend reloads images
      try {
        window.dispatchEvent(new Event('clear-image-cache'));
      } catch (e) {
        // ignore if window is not available
      }

      setSuccess('Image updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Failed to save product images', err);
      setError('Failed to save image URL');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Auto-save edited product
  const saveProduct = useCallback(async (productId, field, value) => {
    if (savingIds.has(productId)) return;

    setSavingIds(prev => new Set([...prev, productId]));

    try {
      const product = products.find(p => p._id === productId || p.id === productId);
      if (!product) return;

      const updateData = {
        ...product,
        [field]: field === 'price' || field === 'stock' ? Number(value) : value
      };

      await apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      // Update local state
      setProducts(prev => prev.map(p => 
        (p._id === productId || p.id === productId) 
          ? { ...p, [field]: updateData[field] }
          : p
      ));

      setSuccess(`${field} updated!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(`Failed to save ${field}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [products]);

  // Bulk update
  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0 || !bulkEditValue) return;

    const updatePromises = Array.from(selectedProducts).map(productId =>
      saveProduct(productId, bulkEditField, bulkEditValue)
    );

    await Promise.all(updatePromises);
    setSelectedProducts(new Set());
    setBulkEditMode(false);
    setBulkEditValue('');
  };

  // Delete product
  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await apiCall(`/api/admin/products/${productId}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p._id !== productId && p.id !== productId));
      setSuccess('Product deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Select all on page
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p._id || p.id)));
    }
  };

  const pagesCount = Math.ceil(totalCount / PAGE_LIMIT);

  // Source list for missing images view: use dedicated source if loaded, else current page
  const missingSource =
    viewMode === 'missing-images' && missingProductsSource.length > 0
      ? missingProductsSource
      : products;

  // Filter products without real images (empty or only placeholder/fallback)
  const productsWithoutImages = missingSource.filter((p) => {
    const primaryUrl =
      (p.imageUrlPrimary ||
        p.imageUrl ||
        p.img ||
        p.image ||
        (Array.isArray(p.images) && p.images[0] && p.images[0].url)) || '';

    const url = String(primaryUrl).trim();

    // No URL or clearly invalid values
    if (!url || url === 'undefined' || url === 'null') return true;

    // Placeholder or generic fallback paths
    if (url === '/placeholder.svg') return true;
    if (url.startsWith('/fallback/')) return true;
    if (url.startsWith('data:image/svg+xml')) return true;

    // Otherwise treat it as having some image
    return false;
  });

  const hasPendingMissingEdits = productsWithoutImages.some((p) => {
    const pid = p._id || p.id;
    const value = (missingEdits[pid] || '').trim();
    return !!value;
  });

  const handleSaveAllMissingImages = async () => {
    if (!hasPendingMissingEdits || missingBulkSaving) return;

    setMissingBulkSaving(true);
    try {
      for (const p of productsWithoutImages) {
        const pid = p._id || p.id;
        const value = (missingEdits[pid] || '').trim();
        if (value) {
          // eslint-disable-next-line no-await-in-loop
          await saveProductImages(pid, value);
        }
      }
    } finally {
      setMissingBulkSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Manager V2</h1>
            <p className="text-sm text-gray-500 mt-1">Fast bulk editing • Auto-save • {totalCount} products</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProducts.size > 0 && (
              <button
                onClick={() => {
                  const selectedProductsData = products.filter(p => selectedProducts.has(p._id || p.id));
                  localStorage.setItem('bulkEditProducts', JSON.stringify(selectedProductsData));
                  navigate('/admin/bulk-edit');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Selected ({selectedProducts.size})
              </button>
            )}
            <button
              onClick={() => {
                if (selectedProducts.size > 0) {
                  // Transfer selected product IDs to bulk manager
                  const selectedIds = Array.from(selectedProducts);
                  localStorage.setItem('preSelectedProducts', JSON.stringify(selectedIds));
                }
                navigate('/admin/bulk-manager');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Bulk Manager
            </button>
            <button
              onClick={() => {
                const nextMode = viewMode === 'missing-images' ? 'table' : 'missing-images';
                setViewMode(nextMode);
                if (nextMode === 'missing-images') {
                  loadMissingProducts();
                }
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'missing-images'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              Missing Images ({productsWithoutImages.length})
            </button>
            <button
              onClick={() => navigate('/admin/overview')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Overview
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('aalacomp_admin_token');
                navigate('/admin/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 z-50"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort: Name</option>
                <option value="price">Sort: Price</option>
                <option value="stock">Sort: Stock</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="text-sm font-medium text-blue-900">
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-3">
                {!bulkEditMode ? (
                  <>
                    <button
                      onClick={() => setBulkEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Bulk Edit
                    </button>
                    <button
                      onClick={() => setSelectedProducts(new Set())}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={bulkEditField}
                      onChange={(e) => setBulkEditField(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="price">Update Price</option>
                      <option value="stock">Update Stock</option>
                      <option value="category">Update Category</option>
                    </select>
                    <input
                      type="text"
                      placeholder="New value..."
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg flex-1 max-w-xs"
                    />
                    <button
                      onClick={handleBulkUpdate}
                      disabled={!bulkEditValue}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setBulkEditMode(false);
                        setBulkEditValue('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Missing Images Section */}
        {viewMode === 'missing-images' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">Products Missing Images</h3>
                <p className="text-sm text-orange-700 mt-1">
                  {productsWithoutImages.length} product{productsWithoutImages.length !== 1 ? 's' : ''} without images • Paste image URLs below
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAllMissingImages}
                  disabled={!hasPendingMissingEdits || missingBulkSaving}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                    !hasPendingMissingEdits || missingBulkSaving
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {missingBulkSaving ? 'Saving All...' : 'Save All Updated Images'}
                </button>
              </div>
            </div>

            {missingLoading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Loading products without images...</p>
                <p className="text-gray-500 text-sm mt-2">Scanning the database for products that need image URLs</p>
              </div>
            ) : productsWithoutImages.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">All products have images!</p>
                <p className="text-gray-500 text-sm mt-2">Great job keeping your catalog complete</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image URL</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productsWithoutImages.map((product) => {
                      const productId = product._id || product.id;
                      const isSaving = savingIds.has(productId);
                      const name = product.name || product.title || 'Unnamed';
                      const currentUrl = missingEdits[productId] || '';

                      return (
                        <motion.tr
                          key={productId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-orange-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate" title={name}>
                                  {name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!name) return;
                                    if (navigator.clipboard) {
                                      navigator.clipboard.writeText(name).catch(() => {});
                                    }
                                    setCopiedMissingId(productId);
                                    setTimeout(() => setCopiedMissingId(null), 1200);
                                  }}
                                  className={`p-1 rounded-full border text-xs flex items-center justify-center transition-colors ${
                                    copiedMissingId === productId
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-gray-200 bg-white hover:bg-gray-50'
                                  }`}
                                  title="Copy product name"
                                >
                                  {copiedMissingId === productId ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-600" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{productId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {product.category || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            PKR {Number(product.price || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <input
                              type="url"
                              value={currentUrl}
                              onChange={(e) => {
                                const value = e.target.value;
                                setMissingEdits(prev => ({ ...prev, [productId]: value }));
                              }}
                              onBlur={() => {
                                if (currentUrl && currentUrl.trim()) {
                                  saveProductImages(productId, currentUrl);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (currentUrl && currentUrl.trim()) {
                                    saveProductImages(productId, currentUrl);
                                  }
                                }
                              }}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-blue-500 rounded text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                const value = (missingEdits[productId] || '').trim();
                                if (value) {
                                  saveProductImages(productId, value);
                                }
                              }}
                              disabled={isSaving}
                              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 text-xs"
                            >
                              <Save className="w-4 h-4" />
                              Save Image
                              {isSaving && <Clock className="w-4 h-4 animate-spin" />}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Table */}
        {viewMode !== 'missing-images' && loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : viewMode !== 'missing-images' && products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No products found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : viewMode !== 'missing-images' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, idx) => {
                    const productId = product._id || product.id;
                    const isSaving = savingIds.has(productId);
                    const isSelected = selectedProducts.has(productId);

                    return (
                      <motion.tr
                        key={productId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(productId)}
                            className="w-5 h-5 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.img || product.imageUrl ? (
                                <img
                                  src={product.img || product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400 m-2" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name || product.title || 'Unnamed'}
                              </p>
                              <p className="text-xs text-gray-500">{productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {editingId === productId && editingField === 'category' ? (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                saveProduct(productId, 'category', editingValue);
                                setEditingId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProduct(productId, 'category', editingValue);
                                  setEditingId(null);
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingId(productId);
                                setEditingField('category');
                                setEditingValue(product.category || '');
                              }}
                              className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-100"
                            >
                              {product.category || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {editingId === productId && editingField === 'price' ? (
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                saveProduct(productId, 'price', editingValue);
                                setEditingId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProduct(productId, 'price', editingValue);
                                  setEditingId(null);
                                }
                              }}
                              autoFocus
                              className="w-24 px-2 py-1 border border-blue-500 rounded"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingId(productId);
                                setEditingField('price');
                                setEditingValue(product.price || '');
                              }}
                              className="cursor-pointer hover:text-blue-600 hover:underline"
                            >
                              PKR {Number(product.price || 0).toLocaleString()}
                              {isSaving && <Clock className="w-4 h-4 inline ml-2 animate-spin" />}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {editingId === productId && editingField === 'stock' ? (
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                saveProduct(productId, 'stock', editingValue);
                                setEditingId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProduct(productId, 'stock', editingValue);
                                  setEditingId(null);
                                }
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 border border-blue-500 rounded"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingId(productId);
                                setEditingField('stock');
                                setEditingValue(product.stock || '');
                              }}
                              className={`inline-block px-2 py-1 rounded cursor-pointer ${
                                (product.stock || 0) < 5
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {product.stock ?? 0}
                              {isSaving && <Clock className="w-4 h-4 inline ml-2 animate-spin" />}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDelete(productId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {pagesCount} • {totalCount} total products
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, pagesCount) }).map((_, i) => {
                  const start = Math.max(1, Math.min(page - 2, pagesCount - 4));
                  const pNum = start + i;
                  if (pNum > pagesCount) return null;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`px-3 py-2 rounded-lg ${
                        pNum === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={page === pagesCount}
                  onClick={() => setPage(p => Math.min(pagesCount, p + 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
        <p className="font-semibold mb-2">💡 Pro Tips:</p>
        <ul className="space-y-1 text-gray-600">
          <li>• Click any price/stock to edit inline</li>
          <li>• Press Enter to save, Esc to cancel</li>
          <li>• Select multiple products for bulk edit</li>
          <li>• Changes auto-save instantly</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardV2;
