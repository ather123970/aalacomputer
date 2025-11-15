import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit3, 
  CheckSquare, 
  Square, 
  ArrowLeft,
  Package,
  Zap,
  Users,
  ShoppingCart
} from 'lucide-react';
import { apiCall } from '../config/api';

const BulkProductManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, selected: 0 });
  const [hasPreSelected, setHasPreSelected] = useState(false);

  const PRODUCTS_PER_PAGE = 50;

  // Load products with pagination
  const loadProducts = useCallback(async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PRODUCTS_PER_PAGE)
      });
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const resp = await apiCall(`/api/admin/products?${params.toString()}`);

      let productsList = [];
      let total = 0;

      if (Array.isArray(resp)) {
        productsList = resp;
        total = resp.length;
      } else if (Array.isArray(resp.products)) {
        productsList = resp.products;
        total = resp.total || resp.totalCount || productsList.length;
      } else if (resp.data && Array.isArray(resp.data.products)) {
        productsList = resp.data.products;
        total = resp.data.total || resp.total || productsList.length;
      }

      setProducts(productsList);
      setFilteredProducts(productsList);
      const pages = Math.max(1, Math.ceil((total || productsList.length) / PRODUCTS_PER_PAGE));
      setTotalPages(pages);
      setStats(prev => ({ ...prev, total: total || productsList.length }));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      let data;
      try {
        data = await apiCall('/api/admin/categories');
      } catch {
        data = await apiCall('/api/categories').catch(() => []);
      }

      const list = Array.isArray(data)
        ? data
        : (data.categories || data.data || []);

      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts(currentPage, searchTerm, categoryFilter);
    loadCategories();
    
    // Check if there are pre-selected products from the main admin dashboard
    const preSelectedProducts = localStorage.getItem('preSelectedProducts');
    if (preSelectedProducts) {
      try {
        const productIds = JSON.parse(preSelectedProducts);
        setSelectedProducts(new Set(productIds));
        setStats(prev => ({ ...prev, selected: productIds.length }));
        setHasPreSelected(true);
        localStorage.removeItem('preSelectedProducts'); // Clean up
      } catch (error) {
        console.error('Error loading pre-selected products:', error);
      }
    }
  }, [loadProducts, currentPage, searchTerm, categoryFilter]);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setSelectedProducts(new Set());
  }, []);

  // Handle category filter
  const handleCategoryFilter = useCallback((category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
    setSelectedProducts(new Set());
  }, []);

  // Handle product selection
  const handleProductSelect = useCallback((productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      setStats(prevStats => ({ ...prevStats, selected: newSet.size }));
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
      setStats(prev => ({ ...prev, selected: 0 }));
    } else {
      const allIds = new Set(filteredProducts.map(p => p._id));
      setSelectedProducts(allIds);
      setStats(prev => ({ ...prev, selected: allIds.size }));
    }
  }, [selectedProducts.size, filteredProducts]);

  // Handle bulk edit
  const handleBulkEdit = () => {
    if (selectedProducts.size === 0) return;
    
    const selectedProductsData = filteredProducts.filter(p => selectedProducts.has(p._id));
    localStorage.setItem('bulkEditProducts', JSON.stringify(selectedProductsData));
    navigate('/admin/bulk-edit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Product Manager</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Select and edit multiple products at once
                  {hasPreSelected && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      ✓ Products pre-selected from dashboard
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-500">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                <div className="text-xs text-gray-500">Selected</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, brand, or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Select All on Page ({filteredProducts.length})
              </button>
              {selectedProducts.size > 0 && (
                <button
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setStats(prev => ({ ...prev, selected: 0 }));
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <AnimatePresence>
              {selectedProducts.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleBulkEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit All ({selectedProducts.size})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-2 ${
                  selectedProducts.has(product._id) 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
                onClick={() => handleProductSelect(product._id)}
              >
                {/* Selection Indicator */}
                <div className="absolute top-3 left-3 z-10">
                  {selectedProducts.has(product._id) ? (
                    <CheckSquare className="w-6 h-6 text-blue-600 bg-white rounded shadow-sm" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-400 bg-white rounded shadow-sm" />
                  )}
                </div>

                {/* Product Image */}
                <div className="relative h-48 bg-gray-50">
                  <img
                    src={product.img || product.imageUrl || '/placeholder.svg'}
                    alt={product.name || product.title}
                    className="w-full h-full object-contain p-4"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {product.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-1 text-sm"
                    title={product.name || product.title || 'Unnamed Product'}
                  >
                    {product.name || product.title || 'Unnamed Product'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    {product._id}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      PKR {typeof product.price === 'number' ? product.price.toLocaleString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock || 0}
                    </div>
                  </div>

                  {product.brand && (
                    <div className="mt-2 text-xs text-gray-500">
                      Brand: {product.brand}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkProductManager;
