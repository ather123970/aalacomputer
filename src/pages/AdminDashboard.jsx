import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Star,
  Zap,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { apiCall, getApiUrl } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    topSelling: []
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load stats and products in parallel
      await Promise.all([
        loadStats(),
        loadProducts()
      ]);
      
      // Load categories after products are loaded
      loadCategories();
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiCall('/api/products/stats/summary');
      if (data) {
        setStats({
          totalProducts: data.total || 0,
          topSelling: data.top || [],
          totalOrders: 0,
          totalSales: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to empty stats
      setStats({
        totalProducts: 0,
        topSelling: [],
        totalOrders: 0,
        totalSales: 0
      });
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiCall('/api/admin/products');
      if (data && data.ok && data.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadCategories = () => {
    // Extract categories from current products state
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setCategories(uniqueCategories);
  };

  // Update categories when products change
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      setError('Please login again to perform this action');
      navigate('/admin/login');
      return;
    }
    
    try {
      const response = await apiCall(`/api/admin/products/${productId}`, { 
        method: 'DELETE'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Remove from local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalProducts: Math.max(0, (prev.totalProducts || 0) - 1),
      }));

      // Show success message
      setError('Product deleted successfully');
      setTimeout(() => setError(''), 3000); // Clear message after 3 seconds
      // Notify other parts of the app that products were updated
      try {
        localStorage.setItem('products_last_updated', String(Date.now()));
      } catch (e) { /* ignore */ }
      try { window.dispatchEvent(new Event('products-updated')); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Failed to delete product: ${error.message}`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend = null, subtitle = null, badge = null }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-xl transition-all duration-200`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full text-blue-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-blue-50`}>
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            {badge && <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">{badge}</span>}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your store and products with premium tools</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem('aalacomp_admin_token');
              navigate('/admin/login');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Logout</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Product</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          subtitle={`${products.filter(p => (p.stock || 0) < 5).length} low in stock`}
        />
        <StatCard
          title="Low Stock Alert"
          value={products.filter(p => (p.stock || 0) < 5).length}
          icon={Activity}
          color="red"
          badge="⚠️"
          subtitle="Products needing restock"
        />
        <StatCard
          title="Top Sellers"
          value={stats.topSelling.length}
          icon={TrendingUp}
          subtitle="Most sold products"
        />
      </motion.div>

      {/* Top Selling Products */}
      {stats.topSelling.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Top Selling Products
            </h3>
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-700 text-sm font-medium">Hot</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.topSelling.slice(0, 5).map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900' :
                    'bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">{item.id}</span>
                    <p className="text-gray-600 text-sm">Product ID</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-semibold">{item.sold} sold</span>
                  <p className="text-gray-600 text-sm">units</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Products Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Products Management
            </h3>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Sold
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {product.img ? (
                            <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name || product.Name || 'Unnamed Product'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      PKR {product.price?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (product.stock || 0) < 5 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden lg:table-cell">
                      {product.sold || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first product'
                }
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Product Modal */}
      <AnimatePresence>
        {(showCreateModal || editingProduct) && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
              setShowCreateModal(false);
              setEditingProduct(null);
            }}
            onSave={loadData}
          />
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    price: '',
    category: '',
    img: '',
    imageUrl: '',
    description: '',
    specs: product ? (Array.isArray(product.specs) ? product.specs.join(', ') : product.specs || '') : '',
    tags: '',
    stock: 0,
    sold: 0,
    ...(product || {}),
  });
  const [isDeal, setIsDeal] = useState(false);
  const [isPrebuild, setIsPrebuild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title && !formData.name) {
      setError('Product title is required');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price) || 0;
    if (price <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    const stock = parseInt(formData.stock) || 0;
    if (stock < 0) {
      setError('Stock cannot be negative');
      setLoading(false);
      return;
    }

    const sold = parseInt(formData.sold) || 0;
    if (sold < 0) {
      setError('Sold quantity cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price,
        stock,
        sold,
        title: formData.title || formData.name,
        name: formData.name || formData.title,
        imageUrl: formData.imageUrl || formData.img,
        img: formData.img || formData.imageUrl,
        specs: typeof formData.specs === 'string' 
          ? formData.specs.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(formData.specs) 
            ? formData.specs
            : [],
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(formData.tags)
            ? formData.tags
            : []
      };

      const endpoint = product 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const result = await apiCall(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      // Ensure backend acknowledged the change
      if (!result || (typeof result === 'object' && !result.ok && !result.product && !Array.isArray(result))) {
        throw new Error((result && result.error) ? result.error : 'Failed to save product');
      }

      // Save to Deals collection if checkbox is checked
      if (isDeal) {
        try {
          await apiCall('/api/admin/deals', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (dealErr) {
          console.warn('Failed to save to deals:', dealErr);
        }
      }

      // Save to Prebuilds collection if checkbox is checked
      if (isPrebuild) {
        try {
          await apiCall('/api/admin/prebuilds', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (prebuildErr) {
          console.warn('Failed to save to prebuilds:', prebuildErr);
        }
      }

      // Notify backend-driven UI to reload lists (only after success)
      try {
        localStorage.setItem('products_last_updated', String(Date.now()));
      } catch (e) { /* ignore */ }
      try { window.dispatchEvent(new Event('products-updated')); } catch (e) { /* ignore */ }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Create New Product'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title || formData.name || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock (Quantity) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sold (Quantity)
              </label>
              <input
                type="number"
                min="0"
                value={formData.sold}
                onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Gaming PC, Laptop, Accessories"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.img}
                onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications (comma-separated)
              </label>
              <input
                type="text"
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                placeholder="e.g., Intel i7, 16GB RAM, RTX 3080"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., gaming, budget, premium"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Additional Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isDeal}
                  onChange={(e) => setIsDeal(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  <span className="font-medium">Deals Product</span>
                  <span className="text-sm text-gray-500 block">Also add this product to the Deals section</span>
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isPrebuild}
                  onChange={(e) => setIsPrebuild(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  <span className="font-medium">Prebuild Product</span>
                  <span className="text-sm text-gray-500 block">Also add this product to the Prebuilds section</span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;