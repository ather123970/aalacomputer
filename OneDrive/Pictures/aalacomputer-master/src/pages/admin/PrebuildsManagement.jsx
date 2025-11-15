import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Cpu, Eye, Save, AlertCircle, CheckCircle, Star
} from 'lucide-react';
import { apiCall } from '../../config/api';

const PrebuildsManagement = () => {
  const [prebuilds, setPrebuilds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrebuild, setEditingPrebuild] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prebuildsData, productsData] = await Promise.all([
        // Try admin endpoint first, fallback to public endpoint
        apiCall('/api/admin/prebuilds')
          .catch(() => apiCall('/api/prebuilds'))
          .catch(() => []),
        apiCall('/api/admin/products')
          .catch(() => apiCall('/api/products?limit=1000'))
          .catch(() => ({ products: [] }))
      ]);
      
      // Handle different response formats
      let prebuildsArray = [];
      if (Array.isArray(prebuildsData)) {
        prebuildsArray = prebuildsData;
      } else if (prebuildsData?.prebuilds) {
        prebuildsArray = prebuildsData.prebuilds;
      } else if (prebuildsData?.data) {
        prebuildsArray = prebuildsData.data;
      }
      
      let productsArray = [];
      if (Array.isArray(productsData)) {
        productsArray = productsData;
      } else if (productsData?.products) {
        productsArray = productsData.products;
      } else if (productsData?.data) {
        productsArray = productsData.data;
      }
      
      console.log('[PrebuildsManagement] Loaded:', { prebuilds: prebuildsArray.length, products: productsArray.length });
      setPrebuilds(prebuildsArray);
      setProducts(productsArray);
    } catch (error) {
      console.error('Error loading data:', error);
      setPrebuilds([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (prebuildData) => {
    try {
      const endpoint = editingPrebuild 
        ? `/api/admin/prebuilds/${editingPrebuild._id || editingPrebuild.id}`
        : '/api/admin/prebuilds';
      
      await apiCall(endpoint, {
        method: editingPrebuild ? 'PUT' : 'POST',
        body: JSON.stringify(prebuildData)
      });

      setSuccess(editingPrebuild ? 'Prebuild updated!' : 'Prebuild created!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      setEditingPrebuild(null);
      loadData();
    } catch (error) {
      setError(error.message || 'Failed to save prebuild');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prebuild?')) return;
    
    setLoading(true);
    try {
      console.log('[PrebuildsManagement] Deleting prebuild:', id);
      
      // Try admin endpoint first
      try {
        await apiCall(`/api/admin/prebuilds/${id}`, { method: 'DELETE' });
      } catch (adminError) {
        console.warn('[PrebuildsManagement] Admin endpoint failed, trying public endpoint:', adminError);
        // Fallback to public endpoint
        await apiCall(`/api/prebuilds/${id}`, { method: 'DELETE' });
      }
      
      setSuccess('Prebuild deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadData();
    } catch (error) {
      console.error('[PrebuildsManagement] Delete failed:', error);
      setError(`Failed to delete: ${error.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm(`Delete all ${prebuilds.length} prebuilds? This cannot be undone!`)) return;
    
    setLoading(true);
    try {
      // Delete all prebuilds one by one
      const deletePromises = prebuilds.map(p => 
        apiCall(`/api/admin/prebuilds/${p._id || p.id}`, { method: 'DELETE' })
          .catch(e => console.log(`Failed to delete ${p.title || p.name}:`, e.message))
      );
      
      await Promise.all(deletePromises);
      setSuccess('All prebuilds cleared!');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (error) {
      setError('Failed to clear prebuilds');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrebuilds = prebuilds.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Cpu className="w-6 h-6 mr-2 text-blue-600" />
            Prebuilds Management
          </h2>
          <p className="text-gray-600 mt-1">Manage pre-built PC configurations</p>
        </div>
        <div className="flex gap-2">
          {prebuilds.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear All ({prebuilds.length})</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingPrebuild(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Prebuild</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Info Box - How to Add Prebuilds */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">💡 How to Add Prebuilds</h3>
            <p className="text-sm text-blue-700">
              <strong>Option 1:</strong> Use "Add Prebuild" button above to create dedicated prebuild configurations.<br />
              <strong>Option 2:</strong> Go to Products tab and add a product with category <strong>"Prebuild PC"</strong> or <strong>"Prebuild"</strong> - it will automatically appear in the prebuilds section on your website.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search prebuilds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrebuilds.map((prebuild) => (
          <motion.div
            key={prebuild._id || prebuild.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all relative"
            style={{ pointerEvents: 'auto' }}
          >
            {prebuild.featured && (
              <div className="flex items-center text-yellow-600 text-sm mb-2">
                <Star className="w-4 h-4 mr-1 fill-current" />
                Featured
              </div>
            )}
            <h3 className="font-bold text-lg mb-2">{prebuild.title || prebuild.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {prebuild.description || 'No description'}
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-2xl font-bold text-blue-600">
                Rs. {(prebuild.price || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {prebuild.components?.length || 0} components • {prebuild.category || 'Uncategorized'}
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                prebuild.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {prebuild.status || 'draft'}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPrebuild(prebuild);
                  setShowModal(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10 relative"
                title="Edit prebuild"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(prebuild._id || prebuild.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10 relative"
                title="Delete prebuild"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPrebuilds.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No prebuilds found</h3>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <PrebuildModal
            prebuild={editingPrebuild}
            products={products}
            onClose={() => {
              setShowModal(false);
              setEditingPrebuild(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PrebuildModal = ({ prebuild, products, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    price: 0,
    img: '',
    imageUrl: '',
    category: 'Gaming',
    components: [],
    featured: false,
    status: 'draft',
    performance: 'High Performance',
    ...prebuild
  });

  const [selectedComponents, setSelectedComponents] = useState(prebuild?.components || []);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...formData,
      title: formData.title || formData.name,
      name: formData.name || formData.title,
      price: Number(formData.price) || 0,
      components: selectedComponents
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">
            {prebuild ? 'Edit Prebuild' : 'Create Prebuild'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title || formData.name}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option>Gaming</option>
                <option>Office</option>
                <option>Budget</option>
                <option>High-End</option>
                <option>Workstation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Performance Label</label>
              <input
                type="text"
                value={formData.performance}
                onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., High Performance"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={formData.img || formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, img: e.target.value, imageUrl: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Featured Prebuild</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Publish (make visible)</span>
            </label>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Pro Tip:</strong> Components are managed separately. You can add component details after creation via the products section.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
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
              <span>{prebuild ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PrebuildsManagement;
