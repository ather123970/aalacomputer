import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Edit2, Trash2, ChevronDown, Save, X } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminProductsTable = ({ showMessage }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const productsEndRef = useRef(null);

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

  const getFilteredProducts = useCallback(() => {
    let filtered = allProducts;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const id = String(p._id || p.id).toLowerCase();
        return name.includes(term) || brand.includes(term) || id.includes(term);
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, searchTerm]);

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

  // Handle search/filter changes
  useEffect(() => {
    loadPage(1);
  }, [searchTerm, selectedCategory]);

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

  const startEdit = (product) => {
    setEditingId(product._id || product.id);
    setEditData({
      name: product.name || product.Name,
      price: product.price,
      stock: product.stock || 0,
      category: product.category,
      brand: product.brand
    });
  };

  const saveEdit = async () => {
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const productId = editingId;
      
      const response = await fetch(`${base}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

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
        
        setEditingId(null);
        setEditData({});
        showMessage('Product updated successfully!', 'success');
      } else {
        showMessage('Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      showMessage('Error updating product', 'error');
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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-blue-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, brand, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Brand</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const isEditing = editingId === (product._id || product.id);
                return (
                  <motion.tr
                    key={product._id || product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-blue-100 hover:bg-blue-50 transition"
                  >
                    {isEditing ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.brand}
                            onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editData.stock}
                            onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveEdit}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                          >
                            <Save size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition"
                          >
                            <X size={16} />
                          </motion.button>
                        </td>
                      </>
                    ) : (
                      <>
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
                            onClick={() => startEdit(product)}
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
                      </>
                    )}
                  </motion.tr>
                );
              })}
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
    </div>
  );
};

export default AdminProductsTable;
