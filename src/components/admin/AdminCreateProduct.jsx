import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Eye, X, Plus } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminCreateProduct = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    tags: '',
    category: '',
    brand: '',
    isPrebuild: false,
    img: '',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'link'
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  useEffect(() => {
    fetchCategoriesAndBrands();
  }, []);

  const fetchCategoriesAndBrands = async () => {
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      
      // Fetch categories
      const catResponse = await fetch(`${base}/api/categories`);
      if (catResponse.ok) {
        const cats = await catResponse.json();
        setCategories(Array.isArray(cats) ? cats.map(c => c.name || c) : []);
      }

      // Fetch brands from products
      const prodResponse = await fetch(`${base}/api/products?limit=10000`);
      if (prodResponse.ok) {
        const prodData = await prodResponse.json();
        const products = Array.isArray(prodData) ? prodData : prodData.products || [];
        const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        setBrands(uniqueBrands.sort());
      }
    } catch (error) {
      console.error('Failed to fetch categories/brands:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, img: reader.result, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLink = (url) => {
    setFormData({ ...formData, img: url, imageUrl: url });
    setImagePreview(url);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddNewBrand = () => {
    if (!newBrandName.trim()) {
      showMessage('Please enter a brand name', 'error');
      return;
    }

    if (brands.includes(newBrandName)) {
      showMessage('Brand already exists', 'error');
      return;
    }

    // Add new brand to list
    const updatedBrands = [...brands, newBrandName].sort();
    setBrands(updatedBrands);
    
    // Set it as selected
    setFormData({ ...formData, brand: newBrandName });
    
    // Reset input
    setNewBrandName('');
    setShowNewBrandInput(false);
    
    showMessage('Brand added successfully!', 'success');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showMessage('Product name is required', 'error');
      return false;
    }
    if (!formData.price) {
      showMessage('Price is required', 'error');
      return false;
    }
    if (!formData.category) {
      showMessage('Category is required', 'error');
      return false;
    }
    if (!formData.img && !formData.imageUrl) {
      showMessage('Product image is required', 'error');
      return false;
    }
    return true;
  };

  const createProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const adminToken = localStorage.getItem('aalacomp_admin_token');
      
      const productData = {
        name: formData.name,
        price: parseInt(formData.price) || 0,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        category: formData.category,
        brand: formData.brand,
        type: formData.isPrebuild ? 'Prebuild' : 'Product',
        img: formData.img || formData.imageUrl,
        imageUrl: formData.img || formData.imageUrl,
        inStock: true
      };

      const response = await fetch(`${base}/api/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        showMessage('Product created successfully!', 'success');
        // Reset form
        setFormData({
          name: '',
          price: '',
          description: '',
          tags: '',
          category: '',
          brand: '',
          isPrebuild: false,
          img: '',
          imageUrl: ''
        });
        setImagePreview('');
        setImageInputMode('upload');
      } else {
        const error = await response.json();
        showMessage(error.message || 'Failed to create product', 'error');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      showMessage('Error creating product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold mb-8">Create New Product</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (PKR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description..."
                rows="4"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="gaming, high-performance, RGB"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
              {!showNewBrandInput ? (
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => {
                    if (e.target.value === 'add-new') {
                      setShowNewBrandInput(true);
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                  <option value="add-new" className="bg-gray-600 font-semibold">+ Add New Brand</option>
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Enter new brand name"
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewBrand()}
                      autoFocus
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNewBrand}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                    >
                      Add
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowNewBrandInput(false);
                        setNewBrandName('');
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Product Type */}
            <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                name="isPrebuild"
                checked={formData.isPrebuild}
                onChange={handleInputChange}
                id="isPrebuild"
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="isPrebuild" className="text-white font-medium cursor-pointer flex-1">
                This is a Prebuild PC
              </label>
            </div>
          </div>

          {/* Right: Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Product Image *</label>
              
              {/* Image Input Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImageInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition font-medium ${
                    imageInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Upload size={18} />
                  Upload
                </button>
                <button
                  onClick={() => setImageInputMode('link')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition font-medium ${
                    imageInputMode === 'link'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <LinkIcon size={18} />
                  Link
                </button>
              </div>

              {/* Upload Mode */}
              {imageInputMode === 'upload' && (
                <label className="block w-full px-4 py-6 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Link Mode */}
              {imageInputMode === 'link' && (
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => handleImageLink(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-600"
                />
                <button
                  onClick={() => {
                    setImagePreview('');
                    setFormData({ ...formData, img: '', imageUrl: '' });
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full transition"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded flex items-center gap-2">
                  <Eye size={14} />
                  Live Preview
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Button */}
        <div className="mt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createProduct}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} />
                Create Product
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCreateProduct;
