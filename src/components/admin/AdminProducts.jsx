import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminProducts = ({ showMessage }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const productsEndRef = useRef(null);

  const PRODUCTS_PER_PAGE = 50; // Reduced for faster loading

  // Initial load
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Memoize filtered products
  const filteredProducts = useCallback(() => {
    let filtered = allProducts;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const tags = (p.tags || '').toLowerCase();
        const id = String(p._id || p.id).toLowerCase();
        return name.includes(term) || brand.includes(term) || tags.includes(term) || id.includes(term);
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, searchTerm]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      // Fetch only first 5000 products for faster loading
      const response = await fetch(`${base}/api/products?limit=5000`, {
        cache: 'no-store'
      });
      const data = await response.json();
      const allProds = Array.isArray(data) ? data : data.products || [];
      
      setAllProducts(allProds);
      
      // Extract unique categories (optimized)
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
        const tags = (p.tags || '').toLowerCase();
        const id = String(p._id || p.id).toLowerCase();
        return name.includes(term) || brand.includes(term) || tags.includes(term) || id.includes(term);
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
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, brand, tags, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-3 text-gray-500" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
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
            <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400">
          Showing {products.length} of {getFilteredProducts().length} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, idx) => (
          <motion.div
            key={product._id || product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition group"
          >
            {/* Product Image */}
            <div className="relative h-40 bg-gray-700 overflow-hidden">
              {(product.img || product.imageUrl) ? (
                <img
                  src={product.img || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-bold text-white truncate" title={product.name || product.Name}>
                {product.name || product.Name}
              </h3>
              <p className="text-sm text-gray-400 truncate">{product.brand || 'No Brand'}</p>
              
              <p className="text-lg font-bold text-green-400 mt-2">
                PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
              </p>
              
              <p className="text-xs text-gray-500 mt-1 bg-gray-700 inline-block px-2 py-1 rounded">
                {product.category || 'Uncategorized'}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded text-sm transition font-medium shadow-md"
                >
                  <Edit2 size={16} />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteProduct(product._id || product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded text-sm transition font-medium shadow-md"
                >
                  <Trash2 size={16} />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
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
        <div className="text-center py-8 text-gray-400">
          ✓ All products loaded ({products.length} total)
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          No products found
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
