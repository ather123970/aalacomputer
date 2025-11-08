import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, X, Save, Upload, Sparkles,
  DollarSign, Tag, Folder, Image as ImageIcon, AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import { apiCall } from '../../config/api';

// Pakistan Market Categories and Brands
const PAKISTAN_CATEGORIES_BRANDS = {
  'Processors': ['Intel', 'AMD'],
  'Motherboards': ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar'],
  'Graphics Cards': ['ASUS', 'MSI', 'Gigabyte', 'Zotac', 'PNY', 'XFX', 'Sapphire', 'Colorful'],
  'RAM': ['Corsair', 'XPG', 'G.Skill', 'Kingston', 'TeamGroup', 'Crucial', 'Lexar'],
  'Power Supply': ['Cooler Master', 'Corsair', 'Thermaltake', 'DeepCool', 'Gigabyte', 'Antec', 'SilverStone'],
  'CPU Coolers': ['Cooler Master', 'DeepCool', 'NZXT', 'Arctic', 'Thermalright', 'Lian Li'],
  'PC Cases': ['Lian Li', 'Cooler Master', 'NZXT', 'Cougar', 'Thermaltake', 'DarkFlash', 'Montech'],
  'Storage': ['Samsung', 'Kingston', 'WD', 'Seagate', 'Crucial', 'XPG', 'Lexar', 'Transcend'],
  'Peripherals': ['Logitech', 'Razer', 'Redragon', 'Fantech', 'Bloody', 'HyperX', 'SteelSeries', 'Corsair'],
  'Monitors': ['ASUS', 'MSI', 'Samsung', 'Dell', 'ViewSonic', 'AOC', 'Gigabyte', 'BenQ'],
  'Laptops': ['ASUS', 'MSI', 'Dell', 'HP', 'Acer', 'Lenovo', 'Gigabyte'],
  'Prebuilt PCs': ['MSI', 'ASUS', 'HP', 'Dell', 'Lenovo', 'CyberPowerPC', 'Custom Build'],
  'Cables & Accessories': ['Ugreen', 'Vention', 'Orico', 'Baseus', 'Unitek', 'Generic'],
  'Audio Devices': ['Redragon', 'Fantech', 'Razer', 'HyperX', 'Logitech', 'Bloody', 'Fifine'],
  'Gaming Chairs': ['Cougar', 'ThunderX3', 'Fantech', 'DXRacer', 'Generic'],
  'Deals': ['Mixed']
};

const ProductsManager = ({ onStatsUpdate }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(Object.keys(PAKISTAN_CATEGORIES_BRANDS));
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    imageUrl: '',
    WARRANTY: '1 Year',
    stock: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter brands based on selected category from PAKISTAN_CATEGORIES_BRANDS
    if (formData.category) {
      const brandsForCategory = PAKISTAN_CATEGORIES_BRANDS[formData.category] || [];
      setFilteredBrands(brandsForCategory);
    } else {
      // Show all brands from all categories
      const allBrands = [...new Set(Object.values(PAKISTAN_CATEGORIES_BRANDS).flat())];
      setFilteredBrands(allBrands);
    }
  }, [formData.category]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await apiCall('/api/products').catch(() => []);
      const productsList = Array.isArray(productsData) ? productsData : [];
      
      setProducts(productsList);
      // Categories are already set from PAKISTAN_CATEGORIES_BRANDS
      // Get all unique brands
      const allBrands = [...new Set(Object.values(PAKISTAN_CATEGORIES_BRANDS).flat())].sort();
      setBrands(allBrands);
      setFilteredBrands(allBrands);
      
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0
      };

      if (editingProduct) {
        await apiCall(`/api/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(productData)
        });
        setSuccess('Product updated successfully!');
      } else {
        await apiCall('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        setSuccess('Product created successfully!');
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE' });
      setSuccess('Product deleted successfully!');
      loadData();
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || product.Name || product.title || '',
      title: product.title || product.name || product.Name || '',
      price: product.price || '',
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      imageUrl: product.imageUrl || product.img || '',
      WARRANTY: product.WARRANTY || '1 Year',
      stock: product.stock || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      price: '',
      category: '',
      brand: '',
      description: '',
      imageUrl: '',
      WARRANTY: '1 Year',
      stock: 0
    });
    setEditingProduct(null);
  };

  const autoFillFromName = () => {
    const name = formData.name || formData.title;
    if (!name) return;

    const nameLower = name.toLowerCase();
    let detectedCategory = '';
    let detectedBrand = '';
    
    // Auto-detect category
    if (nameLower.includes('processor') || nameLower.includes('cpu') || nameLower.includes('intel') || nameLower.includes('amd') || nameLower.includes('ryzen') || nameLower.includes('core i')) {
      detectedCategory = 'Processors';
    } else if (nameLower.includes('graphics') || nameLower.includes('gpu') || nameLower.includes('rtx') || nameLower.includes('gtx') || nameLower.includes('radeon')) {
      detectedCategory = 'Graphics Cards';
    } else if (nameLower.includes('ram') || nameLower.includes('memory') || nameLower.includes('ddr')) {
      detectedCategory = 'RAM';
    } else if (nameLower.includes('motherboard') || nameLower.includes('mobo')) {
      detectedCategory = 'Motherboards';
    } else if (nameLower.includes('ssd') || nameLower.includes('hdd') || nameLower.includes('nvme') || nameLower.includes('storage')) {
      detectedCategory = 'Storage';
    } else if (nameLower.includes('monitor') || nameLower.includes('display')) {
      detectedCategory = 'Monitors';
    } else if (nameLower.includes('keyboard')) {
      detectedCategory = 'Peripherals';
    } else if (nameLower.includes('mouse')) {
      detectedCategory = 'Peripherals';
    } else if (nameLower.includes('headset') || nameLower.includes('headphone')) {
      detectedCategory = 'Peripherals';
    } else if (nameLower.includes('laptop')) {
      detectedCategory = 'Laptops';
    } else if (nameLower.includes('psu') || nameLower.includes('power supply')) {
      detectedCategory = 'Power Supply';
    } else if (nameLower.includes('cooler') || nameLower.includes('cooling')) {
      detectedCategory = 'CPU Coolers';
    } else if (nameLower.includes('case') || nameLower.includes('cabinet')) {
      detectedCategory = 'PC Cases';
    } else if (nameLower.includes('cable') || nameLower.includes('adapter')) {
      detectedCategory = 'Cables & Accessories';
    } else if (nameLower.includes('speaker') || nameLower.includes('mic') || nameLower.includes('audio')) {
      detectedCategory = 'Audio Devices';
    } else if (nameLower.includes('chair') || nameLower.includes('desk')) {
      detectedCategory = 'Gaming Chairs';
    }

    // Auto-detect brand from all available brands
    const allBrands = [...new Set(Object.values(PAKISTAN_CATEGORIES_BRANDS).flat())];
    for (const brand of allBrands) {
      if (nameLower.includes(brand.toLowerCase())) {
        detectedBrand = brand;
        break;
      }
    }

    setFormData(prev => ({
      ...prev,
      category: detectedCategory || prev.category,
      brand: detectedBrand || prev.brand
    }));

    if (detectedCategory || detectedBrand) {
      setSuccess(`Auto-detected: ${detectedCategory || ''} ${detectedBrand || ''}`.trim());
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      (product.name || product.Name || product.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Products Management</h2>
          <p className="text-gray-400">{products.length} total products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500 rounded-xl text-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <motion.div
              key={product._id || product.id}
              whileHover={{ y: -4 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-all"
            >
              <div className="aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                {product.imageUrl || product.img ? (
                  <img
                    src={product.imageUrl || product.img}
                    alt={product.name || product.Name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No Image</p>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.name || product.Name || product.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-bold text-xl">
                  PKR {(product.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2 mb-3 text-sm flex-wrap">
                {product.category && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {product.brand}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id || product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={autoFillFromName}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Auto-Detect Category & Brand
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Intel Core i7-13700K"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select brand</option>
                      {filteredBrands.map((brand, idx) => (
                        <option key={idx} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.category ? `${filteredBrands.length} brands for ${formData.category}` : 'Select a category to filter brands'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Warranty</label>
                    <input
                      type="text"
                      value={formData.WARRANTY}
                      onChange={(e) => setFormData({...formData, WARRANTY: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsManager;
