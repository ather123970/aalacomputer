import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingBag, TrendingUp, LogOut,
  Plus, Search, MoreVertical, Edit, Trash2, Eye, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { apiCall } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import SmartImage from '../../components/SmartImage';

const ModernDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCount: 0,
    lowStock: 0,
    topSellers: 0
  });
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const itemsPerPage = 32;
  const [totalPages, setTotalPages] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', brand: '', imageUrl: '', description: '', stock: 10,
    WARRANTY: '1 Year', addToPrebuild: false, addToDeals: false, discount: 0
  });
  const [categories] = useState(['Processors', 'Motherboards', 'Graphics Cards', 'RAM', 'Storage', 'Power Supply', 'CPU Coolers', 'PC Cases', 'Peripherals', 'Monitors', 'Laptops']);
  const [brands] = useState(['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Kingston', 'Samsung', 'WD', 'Logitech', 'Razer']);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData(currentPage, searchTerm, selectedCategory, selectedBrand);
  }, [currentPage, selectedCategory, selectedBrand]);

  // Debounced search effect
  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadData(1, searchTerm, selectedCategory, selectedBrand);
    }, 500);
    
    setSearchDebounce(timeout);
    
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadData = async (page = 1, search = '', category = '', brand = '') => {
    setLoading(true);
    try {
      // Build query params for pagination and filters
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...(category && { category }),
        ...(brand && { brand })
      });
      
      // Fetch products with pagination from database
      const response = await apiCall(`/api/v1/products?${params}`).catch(() => ({ products: [], total: 0 }));
      const productsList = response.products || [];
      const totalCount = response.total || 0;
      
      setProducts(productsList);
      setTotalPages(response.totalPages || 1);
      
      // Fetch top products for dashboard
      const topData = await apiCall('/api/v1/products?limit=5&sort=popular').catch(() => ({ products: [] }));
      setTopProducts(topData.products || []);
      
      // Fetch actual stats from database
      const statsResponse = await apiCall('/api/admin/stats').catch(() => null);
      
      setStats({
        totalProducts: productsList.length,
        totalCount: totalCount,
        lowStock: statsResponse?.lowStock || 0,
        topSellers: topData.products?.length || 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aalacomp_admin_token');
    navigate('/admin/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const productData = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) };
      if (editingProduct) {
        await apiCall(`/api/admin/products/${editingProduct._id}`, { method: 'PUT', body: JSON.stringify(productData) });
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await apiCall('/api/admin/products', { method: 'POST', body: JSON.stringify(productData) });
        if (formData.addToPrebuild) await apiCall('/api/admin/prebuilds', { method: 'POST', body: JSON.stringify(productData) });
        if (formData.addToDeals) await apiCall('/api/admin/deals', { method: 'POST', body: JSON.stringify({ ...productData, originalPrice: productData.price, discount: formData.discount }) });
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save product' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name || product.Name, price: product.price, category: product.category, brand: product.brand, imageUrl: product.imageUrl || product.img, description: product.description, stock: product.stock || 10, WARRANTY: product.WARRANTY || '1 Year', addToPrebuild: false, addToDeals: false, discount: 0 });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Product deleted!' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', brand: '', imageUrl: '', description: '', stock: 10, WARRANTY: '1 Year', addToPrebuild: false, addToDeals: false, discount: 0 });
    setEditingProduct(null);
  };

  const StatCard = ({ icon: Icon, label, value, subtext, color, alert }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {alert && (
          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Alert
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-gray-400 text-sm mt-1">{subtext}</p>}
      </div>
    </motion.div>
  );

  const ProductRow = ({ product, index }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
        index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-300' : 'bg-gray-300'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{product.name || product.Name}</p>
        <p className="text-sm text-gray-500">Product ID</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">0 sold</p>
        <p className="text-sm text-blue-600">units</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your store and products with premium tools</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalCount}
            subtext={`${stats.lowStock} low in stock`}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Low Stock Alert"
            value={stats.lowStock}
            subtext="Products needing restock"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            alert={stats.lowStock > 0}
          />
          <StatCard
            icon={ShoppingBag}
            label="Top Sellers"
            value={stats.topSellers}
            subtext="Most sold products"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Hot
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <ProductRow key={product._id || product.id} product={product} index={index} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* All Products Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Products</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-4">
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Brands</option>
                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <p className="text-sm text-gray-600">Showing: <span className="font-bold text-gray-900">{products.length}</span> of <span className="font-bold text-gray-900">{stats.totalCount}</span> products</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                    <tr key={product._id || product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <SmartImage 
                              src={product.imageUrl || product.img} 
                              alt={product.name || product.Name}
                              product={product}
                              className="w-full h-full"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name || product.Name}</p>
                            <p className="text-sm text-gray-500 truncate">{product.brand || 'No brand'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">PKR {(product.price || 0).toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (product.stock || 0) < 10 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {product.stock || 0} units
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => handleEdit(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => handleDelete(product._id || product.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} className="px-6 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || loading} className="px-6 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            {message.text && (
              <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Product Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-2">Price (PKR) *</label><input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-2">Stock</label><input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-2">Category *</label><select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select category</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">Brand</label><select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select brand</option>{brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}</select></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Image URL</label><input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-2">Warranty</label><input type="text" value={formData.WARRANTY} onChange={(e) => setFormData({...formData, WARRANTY: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              {!editingProduct && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Additional Options</h4>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={formData.addToPrebuild} onChange={(e) => setFormData({...formData, addToPrebuild: e.target.checked})} className="w-5 h-5 rounded" /><span>Add to Prebuilds</span></label>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={formData.addToDeals} onChange={(e) => setFormData({...formData, addToDeals: e.target.checked})} className="w-5 h-5 rounded" /><span>Add to Deals</span></label>
                  {formData.addToDeals && (
                    <div><label className="block text-sm font-medium mb-2">Discount %</label><input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}</button>
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;
