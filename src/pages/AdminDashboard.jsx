// AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { apiCall, getApiUrl } from '../config/api';

// Configuration
const PAGE_LIMIT = 32;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  // Stats & Data
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalSales: 0, topSelling: [] });
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // UI State
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);

  // Debounce search
  const searchTimeout = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    // Auth check
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    loadAll(true);

    // listen for external triggers (other tabs)
    const onProductsUpdated = () => loadProducts(page, searchTerm, selectedCategory);
    window.addEventListener('products-updated', onProductsUpdated);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('products-updated', onProductsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Re-load products if page/category/search change
  useEffect(() => {
    // Debounce quick inputs
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadProducts(page, searchTerm, selectedCategory);
    }, 250);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, searchTerm]);

  const loadAll = async (initial = false) => {
    setLoading(true);
    setError('');
    try {
      // Fetch stats, categories and products in parallel
      const [statsResp, categoriesResp] = await Promise.all([
        apiCall('/api/products/stats/summary').catch(() => null),
        apiCall('/api/admin/categories').catch(() => apiCall('/api/categories').catch(() => null))
      ]);

      if (statsResp) {
        setStats({
          totalProducts: statsResp.total || statsResp.totalProducts || 0,
          topSelling: statsResp.top || statsResp.topSelling || [],
          totalOrders: statsResp.orders || 0,
          totalSales: statsResp.sales || 0
        });
      }

      // Categories handling
      if (categoriesResp && Array.isArray(categoriesResp.categories)) {
        const cats = categoriesResp.categories.filter(c => c.published !== false).map(c => c.name);
        setCategories(cats);
      } else if (Array.isArray(categoriesResp)) {
        const cats = categoriesResp.filter(c => c.published !== false).map(c => c.name);
        setCategories(cats);
      } else {
        // fallback - will be filled after first product load
        setCategories([]);
      }

      // Load first page of products
      await loadProducts(1, '', '');
      if (initial) setPage(1);
    } catch (err) {
      console.error('[AdminDashboard] loadAll error', err);
      setError('Failed to load dashboard. Check your connection.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const resolveImageUrl = (imgField) => {
    if (!imgField) return null;
    // if it's already absolute (http/https) use as is
    if (typeof imgField === 'string' && /^(https?:)?\/\//i.test(imgField)) {
      return imgField;
    }
    // otherwise try to prepend API URL or site origin
    try {
      const base = getApiUrl ? getApiUrl() : '';
      return `${base.replace(/\/$/, '')}/${imgField.replace(/^\//, '')}`;
    } catch {
      return imgField;
    }
  };

  const loadProducts = useCallback(async (pageNum = 1, q = '', category = '') => {
    setLoadingProducts(true);
    setError('');
    try {
      const query = new URLSearchParams();
      query.set('page', pageNum);
      query.set('limit', PAGE_LIMIT);
      if (q) query.set('q', q); // assume backend supports search param 'q'
      if (category) query.set('category', category);

      // prefer admin products endpoint
      const resp = await apiCall(`/api/admin/products?${query.toString()}`).catch(() =>
        apiCall(`/api/products?${query.toString()}`).catch(() => null)
      );

      let list = [];
      let count = 0;
      if (!resp) {
        throw new Error('No response from products API');
      }

      // Different backends return different shapes
      if (Array.isArray(resp)) {
        list = resp;
        count = resp.length;
      } else if (resp.products && Array.isArray(resp.products)) {
        list = resp.products;
        count = resp.totalCount || resp.total || resp.count || list.length;
      } else if (resp.data && Array.isArray(resp.data)) {
        list = resp.data;
        count = resp.total || resp.totalCount || resp.count || list.length;
      } else if (resp.ok && resp.data) {
        list = resp.data;
        count = resp.totalCount || resp.total || list.length;
      } else {
        // attempt to detect array-like root
        const arr = Object.values(resp).find(v => Array.isArray(v));
        if (arr) {
          list = arr;
          count = resp.totalCount || resp.total || list.length;
        } else {
          // fallback - wrap resp as single item
          list = Array.isArray(resp) ? resp : [resp];
          count = list.length;
        }
      }

      // Sort newest-first if createdAt present
      list.sort((a, b) => {
        const dA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dB - dA;
      });

      // Resolve image paths to be absolute
      const normalized = list.map(p => ({
        ...p,
        img: resolveImageUrl(p.img || p.imageUrl || p.image || ''),
      }));

      if (mountedRef.current) {
        setProducts(normalized);
        setTotalCount(Number(count || 0));
        const pc = Math.max(1, Math.ceil(Number(count || normalized.length) / PAGE_LIMIT));
        setPagesCount(pc);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('[AdminDashboard] loadProducts error', err);
      if (mountedRef.current) setError('Failed to load products.');
    } finally {
      if (mountedRef.current) setLoadingProducts(false);
    }
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      setError('Please login again to perform this action');
      navigate('/admin/login');
      return;
    }

    try {
      setLoadingProducts(true);
      const res = await apiCall(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (!res || res.error) {
        throw new Error(res?.error || 'Failed to delete product');
      }

      // optimistic update: refresh current page
      await loadProducts(page, searchTerm, selectedCategory);

      // notify others
      try { localStorage.setItem('products_last_updated', String(Date.now())); } catch {}
      try { window.dispatchEvent(new Event('products-updated')); } catch {}

      // refresh stats
      await loadAll();
    } catch (err) {
      console.error('Delete error', err);
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagesCount) return;
    setPage(newPage);
    // loadProducts will be triggered by useEffect
  };

  const filteredProducts = products.filter(product => {
    // backend already filtered; keep client-side filter for extra safety
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const hay = `${product.name || product.title || product.id || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (selectedCategory && product.category) {
      if (product.category !== selectedCategory) return false;
    } else if (selectedCategory && !product.category) {
      return false;
    }
    return true;
  });

  // Small presentational components
  const StatCard = ({ title, value, icon: Icon, subtitle, badge, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow border border-gray-200 p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      {badge && <div className="absolute top-3 right-3 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{badge}</div>}
      {trend != null && (
        <div className={`mt-3 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="inline-block w-3 h-3 mr-1" /> : <ArrowDownRight className="inline-block w-3 h-3 mr-1" />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </motion.div>
  );

  // Loading skeleton for product rows
  const ProductSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded mt-2" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4" />
    </tr>
  );

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage store, inventory and orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('aalacomp_admin_token');
                navigate('/admin/login');
              }}
              className="px-4 py-2 rounded-xl bg-red-500 text-white flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Products" value={totalCount} icon={Package} subtitle={`${products.filter(p => (p.stock || 0) < 5).length} low in stock`} />
          <StatCard title="Low Stock" value={products.filter(p => (p.stock || 0) < 5).length} icon={Activity} subtitle="Products to restock" />
          <StatCard title="Top Sellers" value={stats.topSelling?.length || 0} icon={TrendingUp} subtitle="Top performing products" />
        </div>

        {/* Top Sellers */}
        {stats.topSelling && stats.topSelling.length > 0 && (
          <div className="bg-white rounded-2xl shadow border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full text-yellow-700">
                <Zap className="w-4 h-4" /> Hot
              </div>
            </div>
            <div className="space-y-2">
              {stats.topSelling.slice(0, 5).map((it, idx) => (
                <div key={it.id || idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{it.name || it.title || it.id}</div>
                      <div className="text-xs text-gray-500">ID: {it.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{it.sold || it.sales || 0} sold</div>
                    <div className="text-xs text-gray-500">units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Management */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Products Management
              </h3>
              <p className="text-sm text-gray-500">{totalCount} total products</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl w-56"
                >
                  <option value="">All Categories</option>
                  {categories.length === 0 && <option value="">No categories loaded</option>}
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase hidden lg:table-cell">Stock</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase hidden lg:table-cell">Sold</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {loadingProducts ? (
                    // show skeleton rows
                    Array.from({ length: PAGE_LIMIT }).map((_, i) => <ProductSkeleton key={i} />)
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package className="w-14 h-14 text-gray-300 mb-4" />
                          <div className="text-lg font-medium">No products found</div>
                          <div className="text-sm text-gray-400 mt-2">
                            Try changing search or filters, or add a new product.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, idx) => (
                      <motion.tr
                        key={product.id || product._id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                              {product.img ? (
                                // use resolved image
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                <img src={product.img} alt={`image-${product.id}`} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name || product.title || 'Unnamed Product'}</div>
                              <div className="text-xs text-gray-400">ID: {product.id || product._id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">PKR {Number(product.price || 0).toLocaleString()}</td>

                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${((product.stock || 0) < 5) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {product.stock ?? 0}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">{product.sold ?? 0}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingProduct(product)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id || product._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">Showing page {page} of {pagesCount} — {totalCount} products total</div>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>
                Prev
              </button>
              {/* quick pages (show bounded range) */}
              {Array.from({ length: Math.min(7, pagesCount) }).map((_, i) => {
                // center current page
                const start = Math.max(1, Math.min(page - 3, pagesCount - 6));
                const pNum = start + i;
                if (pNum > pagesCount) return null;
                return (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`px-3 py-1 rounded-md ${pNum === page ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button disabled={page === pagesCount} onClick={() => handlePageChange(page + 1)} className={`px-3 py-1 rounded-md ${page === pagesCount ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingProduct) && (
          <ProductModal
            product={editingProduct}
            onClose={() => { setShowCreateModal(false); setEditingProduct(null); }}
            onSave={() => { loadProducts(page, searchTerm, selectedCategory); loadAll(); }}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

/* ---------------------------
   ProductModal Component
   (keeps using your endpoints exactly)
   --------------------------- */

const ProductModal = ({ product, onClose, onSave, categories = [] }) => {
  const [formData, setFormData] = useState(() => ({
    title: '',
    name: '',
    price: '',
    category: '',
    img: '',
    imageUrl: '',
    description: '',
    specs: '',
    tags: '',
    stock: 0,
    sold: 0,
    ...(product || {})
  }));
  const [isDeal, setIsDeal] = useState(false);
  const [isPrebuild, setIsPrebuild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // initialize when product changes
  useEffect(() => {
    setFormData(prev => ({
      title: product?.title || product?.name || prev.title || '',
      name: product?.name || product?.title || prev.name || '',
      price: product?.price ?? prev.price,
      category: product?.category ?? prev.category,
      img: product?.img || product?.imageUrl || prev.img,
      imageUrl: product?.imageUrl || product?.img || prev.imageUrl,
      description: product?.description || prev.description,
      specs: Array.isArray(product?.specs) ? product.specs.join(', ') : (product?.specs || prev.specs || ''),
      tags: Array.isArray(product?.tags) ? product.tags.join(', ') : (product?.tags || prev.tags || ''),
      stock: product?.stock ?? prev.stock ?? 0,
      sold: product?.sold ?? prev.sold ?? 0,
      ...product
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    const title = (formData.title || formData.name || '').trim();
    const price = parseFloat(formData.price || 0);
    const stock = parseInt(formData.stock || 0);
    const sold = parseInt(formData.sold || 0);

    if (!title) {
      setError('Product title is required');
      setLoading(false);
      return;
    }
    if (!(price > 0)) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }
    if (stock < 0 || sold < 0) {
      setError('Stock and sold cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        title,
        name: formData.name || title,
        price,
        stock,
        sold,
        imageUrl: formData.imageUrl || formData.img,
        img: formData.img || formData.imageUrl,
        specs: typeof formData.specs === 'string' ? formData.specs.split(',').map(s => s.trim()).filter(Boolean) : formData.specs || [],
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : formData.tags || []
      };

      const endpoint = product ? `/api/admin/products/${product.id || product._id}` : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const result = await apiCall(endpoint, { method, body: JSON.stringify(payload) });

      // Expect backend to return success flag or created object
      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to save product');
      }

      // Optionally save to deals/prebuilds
      if (isDeal) {
        try {
          await apiCall('/api/admin/deals', { method: 'POST', body: JSON.stringify(payload) });
        } catch (err) {
          console.warn('Failed saving deal:', err);
        }
      }
      if (isPrebuild) {
        try {
          await apiCall('/api/admin/prebuilds', { method: 'POST', body: JSON.stringify(payload) });
        } catch (err) {
          console.warn('Failed saving prebuild:', err);
        }
      }

      // Notify other parts of app
      try { localStorage.setItem('products_last_updated', String(Date.now())); } catch {}
      try { window.dispatchEvent(new Event('products-updated')); } catch {}

      // Clear image cache to force reload of updated images
      if (result.timestamp) {
        console.log('🔄 Product updated, clearing image cache...');
        // Dispatch event to clear image caches
        try { window.dispatchEvent(new CustomEvent('clear-image-cache', { detail: { timestamp: result.timestamp } })); } catch {}
        // Also reload the page after a short delay to ensure fresh images
        setTimeout(() => {
          if (onSave) onSave();
          onClose();
          // Force a hard reload of images
          window.location.reload();
        }, 500);
        return;
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error('Save error', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{product ? 'Edit Product' : 'Create Product'}</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Title *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Price (PKR) *</label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Stock *</label>
              <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Sold</label>
              <input type="number" min="0" value={formData.sold} onChange={e => setFormData({...formData, sold: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <input list="cats" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="e.g., Graphics Card" />
              <datalist id="cats">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="text-sm text-gray-600">Image URL</label>
              <input type="url" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Specifications (comma-separated)</label>
              <input value={formData.specs} onChange={e => setFormData({...formData, specs: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Tags (comma-separated)</label>
              <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isDeal} onChange={e => setIsDeal(e.target.checked)} />
              <span className="text-sm">Add to Deals</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isPrebuild} onChange={e => setIsPrebuild(e.target.checked)} />
              <span className="text-sm">Add to Prebuilds</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
