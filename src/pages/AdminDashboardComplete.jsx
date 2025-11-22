import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, LogOut, Search, Trash2, ChevronLeft, ChevronRight, Edit, Plus, X, Upload } from 'lucide-react';
import { apiCall } from '../config/api';

const AdminDashboardComplete = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products'); // products, deals, prebuilds
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [prebuilds, setPrebuilds] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalDeals: 0, totalPrebuilds: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Edit modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  
  const PAGE_LIMIT = 15;

  useEffect(() => {
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadAll();
  }, [navigate]);

  useEffect(() => {
    if (tab === 'products') loadProducts();
    else if (tab === 'deals') loadDeals();
    else if (tab === 'prebuilds') loadPrebuilds();
  }, [page, searchTerm, tab]);

  const loadAll = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      try {
        const statsResp = await apiCall('/api/admin/statistics');
        if (statsResp?.statistics) {
          setStats(statsResp.statistics);
        }
      } catch (err) {
        console.error('Stats load error:', err);
      }
      
      // Load categories - try multiple endpoints
      try {
        let catsData = [];
        try {
          const catsResp = await apiCall('/api/categories');
          if (Array.isArray(catsResp)) {
            catsData = catsResp.map(c => c.name || c).filter(Boolean);
          } else if (catsResp?.categories) {
            catsData = catsResp.categories;
          }
        } catch (e1) {
          // Try alternative endpoint
          try {
            const catsResp = await apiCall('/api/admin/categories');
            if (catsResp?.categories) {
              catsData = catsResp.categories;
            }
          } catch (e2) {
            console.error('Categories load error:', e2);
          }
        }
        setCategories(catsData);
      } catch (err) {
        console.error('Categories error:', err);
      }
      
      // Load brands - try multiple endpoints
      try {
        let brandsData = [];
        try {
          const brandsResp = await apiCall('/api/brands');
          if (Array.isArray(brandsResp)) {
            brandsData = brandsResp.map(b => b.name || b).filter(Boolean);
          } else if (brandsResp?.brands) {
            brandsData = brandsResp.brands;
          }
        } catch (e1) {
          // Try alternative endpoint
          try {
            const brandsResp = await apiCall('/api/admin/brands');
            if (brandsResp?.brands) {
              brandsData = brandsResp.brands;
            }
          } catch (e2) {
            console.error('Brands load error:', e2);
          }
        }
        setBrands(brandsData);
      } catch (err) {
        console.error('Brands error:', err);
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
      const url = `/api/admin/products?${params}`;
      console.log('Loading products from:', url);
      
      const data = await apiCall(url);
      console.log('Products response:', data);
      
      const productList = Array.isArray(data) ? data : (data.products || []);
      setProducts(productList);
      setTotalPages(Math.ceil((data.total || productList.length) / PAGE_LIMIT));
    } catch (err) {
      console.error('Products load error:', err);
      setProducts([]);
    }
  };

  const loadDeals = async () => {
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT, ...(searchTerm && { search: searchTerm }) });
      const data = await apiCall(`/api/deals?${params}`).catch(() => ({ deals: [] }));
      setDeals(Array.isArray(data.deals) ? data.deals : []);
      setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT));
    } catch (err) {
      console.error('Deals load error:', err);
    }
  };

  const loadPrebuilds = async () => {
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT, ...(searchTerm && { search: searchTerm }) });
      const data = await apiCall(`/api/prebuilds?${params}`).catch(() => ({ prebuilds: [] }));
      setPrebuilds(Array.isArray(data.prebuilds) ? data.prebuilds : []);
      setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT));
    } catch (err) {
      console.error('Prebuilds load error:', err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.Name || product.name || '',
      price: product.price || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock || '',
      img: product.img || product.imageUrl || ''
    });
    setNewCategory('');
    setNewBrand('');
  };

  const handleSaveProduct = async () => {
    try {
      if (!editingProduct) {
        alert('No product selected');
        return;
      }
      
      const productId = editingProduct.id || editingProduct._id;
      if (!productId) {
        alert('Product ID not found');
        return;
      }
      
      const finalForm = { ...editForm };
      if (newCategory) finalForm.category = newCategory;
      if (newBrand) finalForm.brand = newBrand;
      
      console.log('Saving product:', productId, finalForm);
      
      const response = await apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(finalForm)
      });
      
      console.log('Save response:', response);
      
      setEditingProduct(null);
      setEditForm({});
      setNewCategory('');
      setNewBrand('');
      
      // Reload products
      await loadProducts();
      alert('Product updated successfully!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to update product: ' + (err.message || 'Unknown error'));
    }
  };

  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm({ ...editForm, img: event.target.result });
      setImageLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read file');
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlUpload = async () => {
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    setImageLoading(true);
    try {
      // Fetch the image from URL and convert to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setEditForm({ ...editForm, img: event.target.result });
        setImageUrl('');
        setImageLoading(false);
        alert('Image loaded successfully!');
      };

      reader.onerror = () => {
        alert('Failed to convert image');
        setImageLoading(false);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Image URL error:', err);
      alert('Failed to load image from URL: ' + err.message);
      setImageLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
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
            <p className="text-sm text-slate-600 mt-1">Complete management system</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Total Products</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">Rs {stats.totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Deals</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDeals || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Prebuilds</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPrebuilds || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-blue-200">
          <button
            onClick={() => { setTab('products'); setPage(1); }}
            className={`px-4 py-2 font-medium transition ${tab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Products
          </button>
          <button
            onClick={() => { setTab('deals'); setPage(1); }}
            className={`px-4 py-2 font-medium transition ${tab === 'deals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Deals
          </button>
          <button
            onClick={() => { setTab('prebuilds'); setPage(1); }}
            className={`px-4 py-2 font-medium transition ${tab === 'prebuilds' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Prebuilds
          </button>
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-blue-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Brand</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No products found</td></tr>
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
                            <p className="font-medium text-slate-900">{product.Name || product.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">Rs {product.price?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${(product.stock || 0) < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{product.category || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600">{product.brand || 'N/A'}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id || product._id)}
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
        )}

        {/* Deals Tab */}
        {tab === 'deals' && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="border-b border-blue-200 p-6 flex gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
                <Plus size={18} /> New Deal
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-blue-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Deal Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Products</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                  ) : deals.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No deals found</td></tr>
                  ) : (
                    deals.map(deal => (
                      <tr key={deal.id || deal._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{deal.title || deal.name}</td>
                        <td className="px-6 py-4 text-slate-600">{deal.discount || '0'}%</td>
                        <td className="px-6 py-4 text-slate-600">{deal.products?.length || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${deal.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {deal.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
        )}

        {/* Prebuilds Tab */}
        {tab === 'prebuilds' && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="border-b border-blue-200 p-6 flex gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search prebuilds..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
                <Plus size={18} /> New Prebuild
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-blue-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Prebuild Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Components</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                  ) : prebuilds.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No prebuilds found</td></tr>
                  ) : (
                    prebuilds.map(pb => (
                      <tr key={pb.id || pb._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{pb.title || pb.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">Rs {pb.price?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{pb.components?.length || 0}</td>
                        <td className="px-6 py-4 text-slate-600">{pb.performance || 'Standard'}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-blue-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Price (PKR)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Category</label>
                    <div className="flex gap-2">
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Brand</label>
                    <div className="flex gap-2">
                      <select
                        value={editForm.brand}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select brand</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="New brand"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Image Upload</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Option 1: Upload from Device</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageLoading}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-slate-500">OR</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Option 2: External Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            disabled={imageLoading}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50"
                          />
                          <button
                            onClick={handleImageUrlUpload}
                            disabled={imageLoading || !imageUrl.trim()}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition"
                          >
                            {imageLoading ? 'Loading...' : 'Load'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {editForm.img && editForm.img.startsWith('data:') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Image Preview</label>
                    <img src={editForm.img} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProduct}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardComplete;
