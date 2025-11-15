import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Tag, Save, AlertCircle, CheckCircle, Upload
} from 'lucide-react';
import { apiCall } from '../../config/api';
import { getAllBrands, PC_HARDWARE_CATEGORIES } from '../../data/categoriesData';

// Get all brands from categories data
const PAKISTAN_BRANDS = getAllBrands();

const BrandsManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/admin/brands').catch(() => ({ brands: [] }));
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error loading brands:', error);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async (brandData) => {
    try {
      const endpoint = editingBrand 
        ? `/api/admin/brands/${editingBrand._id}`
        : '/api/admin/brands';
      
      const method = editingBrand ? 'PUT' : 'POST';

      await apiCall(endpoint, {
        method,
        body: JSON.stringify(brandData)
      });

      setSuccess(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowModal(false);
      setEditingBrand(null);
      loadBrands();
    } catch (error) {
      setError(error.message || 'Failed to save brand');
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await apiCall(`/api/admin/brands/${id}`, { method: 'DELETE' });
      setSuccess('Brand deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadBrands();
    } catch (error) {
      setError(error.message || 'Failed to delete brand');
    }
  };

  const handleSeedBrands = async () => {
    if (!confirm(`This will add ${PAKISTAN_BRANDS.length} pre-defined Pakistan brands. Continue?`)) return;

    setIsSeeding(true);
    try {
      const promises = PAKISTAN_BRANDS.map(brandName => 
        apiCall('/api/admin/brands', {
          method: 'POST',
          body: JSON.stringify({
            name: brandName,
            description: `${brandName} products available in Pakistan`,
            country: 'Pakistan'
          })
        }).catch(e => console.log(`Skipping ${brandName}:`, e.message))
      );

      await Promise.all(promises);
      setSuccess(`Successfully seeded ${PAKISTAN_BRANDS.length} brands!`);
      setTimeout(() => setSuccess(''), 3000);
      loadBrands();
    } catch (error) {
      setError('Some brands failed to seed');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-blue-600" />
            Brands Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage product brands and manufacturers
          </p>
        </div>
        <div className="flex space-x-2">
          {brands.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSeedBrands}
              disabled={isSeeding}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>{isSeeding ? 'Seeding...' : 'Seed Pakistan Brands'}</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingBrand(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Brand</span>
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Quick Start:</strong> Click "Seed Pakistan Brands" to automatically add {PAKISTAN_BRANDS.length} common PC hardware brands available in Pakistan. You can edit or remove any brand later.
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBrands.map((brand) => (
          <motion.div
            key={brand._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all relative group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                {brand.name}
              </h3>
              <p className="text-xs text-gray-500">
                {brand.productCount || 0} products
              </p>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  setEditingBrand(brand);
                  setShowModal(true);
                }}
                className="p-2 bg-white rounded-lg hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleDeleteBrand(brand._id)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No brands found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Add your first brand or seed Pakistan brands'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleSeedBrands}
              disabled={isSeeding}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>{isSeeding ? 'Seeding...' : 'Seed Pakistan Brands'}</span>
            </button>
          )}
        </div>
      )}

      {/* Brand Modal */}
      <AnimatePresence>
        {showModal && (
          <BrandModal
            brand={editingBrand}
            onClose={() => {
              setShowModal(false);
              setEditingBrand(null);
            }}
            onSave={handleSaveBrand}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Brand Modal Component
const BrandModal = ({ brand, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    country: 'Pakistan',
    ...brand
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {brand ? 'Edit Brand' : 'Create Brand'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ASUS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of the brand..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pakistan, USA, China"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{brand ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BrandsManagement;
