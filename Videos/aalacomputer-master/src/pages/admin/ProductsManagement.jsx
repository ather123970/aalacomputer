import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Edit, Trash2, Search, X, Save, Upload,
  DollarSign, Tag, Folder, Image as ImageIcon, AlertCircle,
  CheckCircle, Loader, Eye, Filter, ChevronDown, Zap, Sparkles
} from 'lucide-react';
import { apiCall } from '../../config/api';
import { debounce } from '../../utils/performance';
import { 
  autoDetectCategory, 
  autoDetectBrand, 
  autoFillProductDetails,
  getSuggestedCategories,
  getSuggestedBrands,
  getAllBrands
} from '../../data/categoriesData';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Debounced search to avoid too many API calls
  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        searchProducts(searchTerm);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      loadData(); // Reset to paginated view when search cleared
    }
  }, [searchTerm]);

  const loadData = async (fetchAll = false) => {
    setLoading(true);
    try {
      const url = fetchAll 
        ? '/api/admin/products?fetchAll=true' 
        : '/api/admin/products?limit=50&page=1';
      
      const [productsData, categoriesData] = await Promise.all([
        apiCall(url).catch(() => ({ products: [], total: 0 })),
        apiCall('/api/categories').catch(() => [])
      ]);
      
      const productsList = Array.isArray(productsData.products) 
        ? productsData.products 
        : (Array.isArray(productsData) ? productsData : []);
      
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
      
      setProducts(productsList);
      setCategories(categoriesList);
      setTotalProducts(productsData.total || productsList.length);
      setAllLoaded(fetchAll);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      loadData();
      return;
    }
    
    setLoading(true);
    try {
      // Search fetches ALL matching products from DB
      const data = await apiCall(`/api/admin/products?search=${encodeURIComponent(query)}`);
      const productsList = Array.isArray(data.products) ? data.products : [];
      
      setProducts(productsList);
      setTotalProducts(data.total || productsList.length);
      setAllLoaded(true); // Search returns all matches
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = () => {
    loadData(true);
  };

  const handleSave = async (productData) => {
    setLoading(true);
    setError('');
    try {
      if (editingProduct) {
        // Update existing product
        const id = editingProduct._id || editingProduct.id;
        await apiCall(`/api/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(productData)
        });
        setSuccess('Product updated successfully!');
      } else {
        // Create new product
        await apiCall('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        setSuccess('Product created successfully!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save product');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone!')) return;
    
    setLoading(true);
    try {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE' });
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadData();
    } catch (err) {
      setError('Failed to delete product');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        (product.title || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || 
        (product.category || '').toLowerCase() === filterCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Products Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your store inventory
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </motion.button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of <span className="font-semibold text-gray-900">{totalProducts}</span> total products
            {!allLoaded && (
              <span className="ml-2 text-blue-600">(Loaded first 50)</span>
            )}
          </div>
          
          {!allLoaded && !searchTerm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadAllProducts}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium shadow disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Load All Products</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading && !products.length ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(product._id || product.id)}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No products found</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Add your first product to get started'}
          </p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  const productImage = product.img || product.imageUrl || product.image;
  const productPrice = product.price || 0;
  const productStock = product.stock || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {productImage ? (
          <img
            src={productImage}
            alt={product.title || product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: productImage ? 'none' : 'flex' }}>
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Stock Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
          productStock > 10 ? 'bg-green-100 text-green-700' :
          productStock > 0 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {productStock > 0 ? `${productStock} in stock` : 'Out of stock'}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {product.title || product.name || 'Untitled Product'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || 'No description'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-blue-600">
            Rs. {Number(productPrice).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {product.category || 'Uncategorized'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    img: '',
    imageUrl: '',
    specs: [],
    tags: [],
    ...product
  });

  const [suggestions, setSuggestions] = useState({
    categories: [],
    brands: []
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-detect category and brand when title/name changes
  useEffect(() => {
    const productText = formData.title || formData.name;
    if (productText && productText.length > 3) {
      const categorySuggestions = getSuggestedCategories(productText, 3);
      const brandSuggestions = getSuggestedBrands(productText, 3);
      
      setSuggestions({
        categories: categorySuggestions,
        brands: brandSuggestions
      });

      if (categorySuggestions.length > 0 || brandSuggestions.length > 0) {
        setShowSuggestions(true);
      }
    }
  }, [formData.title, formData.name]);

  const handleAutoDetect = () => {
    const detectedCategory = autoDetectCategory(formData);
    const detectedBrand = autoDetectBrand(formData);

    setFormData({
      ...formData,
      category: detectedCategory ? detectedCategory.name : formData.category,
      brand: detectedBrand || formData.brand
    });

    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      title: formData.title || formData.name,
      name: formData.name || formData.title,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Auto-detect banner */}
          {showSuggestions && (suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Smart Suggestions</h4>
                  </div>
                  
                  {suggestions.categories.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-700 mb-1">Detected Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.category })}
                            className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                          >
                            {cat.category} <span className="text-xs text-gray-500">({cat.confidence})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.brands.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Detected Brands:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.brands.map((brand, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, brand })}
                            className="px-3 py-1 bg-white border border-purple-300 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Title *</label>
              <input
                type="text"
                required
                value={formData.title || formData.name}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Intel Core i9-14900K"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Brand</label>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-detect</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Intel"
                list="brand-suggestions"
              />
              <datalist id="brand-suggestions">
                {getAllBrands().map((brand, idx) => (
                  <option key={idx} value={brand} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed product description..."
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Category *</label>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-detect</span>
                </button>
              </div>
              <select
                required
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.img || formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, img: e.target.value, imageUrl: e.target.value })}
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {(formData.img || formData.imageUrl) && (
              <div className="mt-3 border rounded-xl p-2 inline-block">
                <img
                  src={formData.img || formData.imageUrl}
                  alt="Preview"
                  className="h-20 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="gaming, high-performance, rgb"
            />
          </div>

          {/* Actions */}
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{product ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductsManagement;
