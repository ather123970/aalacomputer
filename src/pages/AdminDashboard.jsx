import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, LogOut, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiCall } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 20;

  useEffect(() => {
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsResp = await apiCall('/api/admin/statistics').catch(() => ({}));
      if (statsResp?.statistics) {
        setStats(statsResp.statistics);
      }
      await loadProducts();
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT, ...(searchTerm && { search: searchTerm }) });
      const data = await apiCall(`/api/admin/products?${params}`);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT));
    } catch (err) {
      console.error('Products load error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aalacomp_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Manage products and inventory</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Products</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">Rs {stats.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-blue-200 p-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No products found</td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id || product._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.img || product.imageUrl ? (
                            <img src={product.img || product.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                              <Package size={16} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{product.Name || product.name}</p>
                            <p className="text-xs text-slate-500">{product.id || product._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">Rs {product.price?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${(product.stock || 0) < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{product.category || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(product.id || product._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-blue-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
