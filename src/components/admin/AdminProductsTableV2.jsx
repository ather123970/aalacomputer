import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Edit2, Trash2, ChevronDown, X, Save, AlertCircle, Upload, Eye, EyeOff } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminProductsTableV2 = ({ showMessage }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const productsEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const PRODUCTS_PER_PAGE = 50;

  // Initial load
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/products?limit=5000`, {
        cache: 'no-store'
      });
      const data = await response.json();
      const allProds = Array.isArray(data) ? data : data.products || [];
      
      setAllProducts(allProds);
      
      // Extract unique categories
      const uniqueCats = [...new Set(allProds.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats.sort());
      
      // Load first page
      loadPage(1, allProds);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showMessage('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Direct database search
  const searchDatabase = async (query) => {
    if (!query.trim()) {
      fetchAllProducts();
      return;
    }

    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      // Search directly from database
      const response = await fetch(
        `${base}/api/products?search=${encodeURIComponent(query)}&limit=5000`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      const searchResults = Array.isArray(data) ? data : data.products || [];
      
      setAllProducts(searchResults);
      loadPage(1, searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to client-side search
      const term = query.toLowerCase();
      const filtered = allProducts.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const id = String(p._id || p.id).toLowerCase();
        return name.includes(term) || brand.includes(term) || id.includes(term);
      });
      setAllProducts(filtered);
      loadPage(1, filtered);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchDatabase(value);
    }, 300);
  };

  const getFilteredProducts = useCallback(() => {
    let filtered = allProducts;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered;
  }, [allProducts, selectedCategory]);

  const loadPage = (pageNum, sourceProducts = null) => {
    const filtered = sourceProducts ? sourceProducts : getFilteredProducts();
    const start = (pageNum - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageProducts = filtered.slice(start, end);

    if (pageNum === 1) {
      setProducts(pageProducts);
    } else {
      setProducts(prev => [...prev, ...pageProducts]);
    }

    setPage(pageNum);
    setHasMore(end < filtered.length);
  };

  // Handle category filter
  useEffect(() => {
    loadPage(1);
  }, [selectedCategory]);

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPage(page + 1);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (productsEndRef.current) {
      observer.observe(productsEndRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      setImagePreview(base64);
      setEditData({ ...editData, img: base64, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageLink = (url) => {
    if (!url.trim()) return;
    setImagePreview(url);
    setEditData({ ...editData, img: url, imageUrl: url });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const imgUrl = product.img || product.imageUrl || product.image || '';
    setImagePreview(imgUrl);
    setEditData({
      name: product.name || product.Name || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      tags: product.tags || '',
      prebuild: product.prebuild || false,
      img: imgUrl,
      imageUrl: imgUrl
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editData.name.trim()) {
      showMessage('Product name is required', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const productId = editingProduct._id || editingProduct.id;
      
      // Try different API endpoints
      let response = null;
      let endpoint = `${base}/api/products/${productId}`;
      
      response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
        cache: 'no-store'
      });

      // If 404, try alternative endpoint
      if (response.status === 404) {
        endpoint = `${base}/api/product/${productId}`;
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
          cache: 'no-store'
        });
      }

      if (response.ok) {
        // Update local state
        setProducts(products.map(p => 
          (p._id || p.id) === productId 
            ? { ...p, ...editData }
            : p
        ));
        setAllProducts(allProducts.map(p => 
          (p._id || p.id) === productId 
            ? { ...p, ...editData }
            : p
        ));
        
        closeEditModal();
        showMessage('Product updated successfully!', 'success');
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        showMessage(`Failed to update product: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      showMessage('Error updating product: ' + error.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(products.filter(p => (p._id || p.id) !== id));
        setAllProducts(allProducts.filter(p => (p._id || p.id) !== id));
        showMessage('Product deleted successfully', 'success');
      } else {
        showMessage('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      showMessage('Error deleting product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search - Direct DB Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-blue-500" size={20} />
            <input
              type="text"
              placeholder="Search database by name, brand, or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-3 text-blue-500" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
            >
              <option value="">All Categories ({getFilteredProducts().length})</option>
              {categories.map(cat => {
                const count = allProducts.filter(p => p.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-blue-500 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600">
          Showing {products.length} of {getFilteredProducts().length} products
        </p>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-blue-200 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Brand</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <motion.tr
                  key={product._id || product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-blue-100 hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={product.img || product.imageUrl || product.image || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {product.name || product.Name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.brand || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                    PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      (product.stock || 0) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.category || '-'}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteProduct(product._id || product.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={productsEndRef} className="py-4" />

      {/* End message */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-600">
          ✓ All products loaded ({products.length} total)
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-600">
          No products found
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeEditModal}
                  className="p-2 hover:bg-blue-700 rounded transition"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900">Product Image</h3>
                  
                  {/* Image Preview - Small Box */}
                  {imagePreview && (
                    <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden mx-auto">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setImagePreview(null);
                          setEditData({ ...editData, img: '', imageUrl: '' });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                      >
                        <X size={14} />
                      </motion.button>
                    </div>
                  )}

                  {/* Upload from Device */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload from Device
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Click to Upload Image
                    </motion.button>
                  </div>

                  {/* External Link */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or Paste External Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        defaultValue={editData.imageUrl}
                        onChange={(e) => handleImageLink(e.target.value)}
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleImageLink(e.currentTarget.previousElementSibling.value)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                      >
                        Load
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Brand & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editData.brand}
                      onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Enter brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editData.stock}
                      onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editData.tags}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="gaming, pc, hardware"
                  />
                </div>

                {/* Prebuild Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prebuild"
                    checked={editData.prebuild}
                    onChange={(e) => setEditData({ ...editData, prebuild: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="prebuild" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    This is a Prebuild Product
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-4 justify-end sticky bottom-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeEditModal}
                  className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition font-medium flex items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsTableV2;
