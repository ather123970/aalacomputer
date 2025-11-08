import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, X, Save, ShoppingBag,
  AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import { apiCall } from '../../config/api';

const PrebuildsManager = ({ onStatsUpdate }) => {
  const [prebuilds, setPrebuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrebuild, setEditingPrebuild] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    price: '',
    description: '',
    imageUrl: '',
    specs: '',
    WARRANTY: '1 Year',
    stock: 0
  });

  useEffect(() => {
    loadPrebuilds();
  }, []);

  const loadPrebuilds = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/admin/prebuilds').catch(() => ({ prebuilds: [] }));
      const prebuildsList = data.prebuilds || [];
      setPrebuilds(prebuildsList);
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      setError('Failed to load prebuilds');
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
      const prebuildData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        Spec: formData.specs.split('\n').filter(s => s.trim())
      };

      if (editingPrebuild) {
        await apiCall(`/api/admin/prebuilds/${editingPrebuild._id}`, {
          method: 'PUT',
          body: JSON.stringify(prebuildData)
        });
        setSuccess('Prebuild updated successfully!');
      } else {
        await apiCall('/api/admin/prebuilds', {
          method: 'POST',
          body: JSON.stringify(prebuildData)
        });
        setSuccess('Prebuild created successfully!');
      }

      setShowModal(false);
      resetForm();
      loadPrebuilds();
    } catch (err) {
      setError(err.message || 'Failed to save prebuild');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prebuild?')) return;

    setLoading(true);
    try {
      await apiCall(`/api/admin/prebuilds/${id}`, { method: 'DELETE' });
      setSuccess('Prebuild deleted successfully!');
      loadPrebuilds();
    } catch (err) {
      setError('Failed to delete prebuild');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prebuild) => {
    setEditingPrebuild(prebuild);
    setFormData({
      name: prebuild.name || prebuild.Name || prebuild.title || '',
      title: prebuild.title || prebuild.name || prebuild.Name || '',
      price: prebuild.price || '',
      description: prebuild.description || '',
      imageUrl: prebuild.imageUrl || prebuild.img || '',
      specs: Array.isArray(prebuild.Spec) ? prebuild.Spec.join('\n') : '',
      WARRANTY: prebuild.WARRANTY || '1 Year',
      stock: prebuild.stock || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      price: '',
      description: '',
      imageUrl: '',
      specs: '',
      WARRANTY: '1 Year',
      stock: 0
    });
    setEditingPrebuild(null);
  };

  const filteredPrebuilds = prebuilds.filter(prebuild =>
    (prebuild.name || prebuild.Name || prebuild.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Prebuilds Management</h2>
          <p className="text-gray-400">{prebuilds.length} total prebuilds</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Prebuild
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search prebuilds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Prebuilds Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrebuilds.map(prebuild => (
            <motion.div
              key={prebuild._id || prebuild.id}
              whileHover={{ y: -4 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden">
                <img
                  src={prebuild.imageUrl || prebuild.img || '/placeholder.svg'}
                  alt={prebuild.name || prebuild.Name}
                  className="w-full h-full object-contain"
                  onError={(e) => e.target.src = '/placeholder.svg'}
                />
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {prebuild.name || prebuild.Name || prebuild.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 font-bold text-xl">
                  PKR {(prebuild.price || 0).toLocaleString()}
                </span>
              </div>
              {prebuild.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{prebuild.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(prebuild)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prebuild._id || prebuild.id)}
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
                  {editingPrebuild ? 'Edit Prebuild' : 'Add New Prebuild'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Prebuild Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Gaming PC RTX 4070 Build"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Specifications (one per line)</label>
                    <textarea
                      value={formData.specs}
                      onChange={(e) => setFormData({...formData, specs: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Intel Core i7-13700K&#10;RTX 4070 12GB&#10;32GB DDR5 RAM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Warranty</label>
                    <input
                      type="text"
                      value={formData.WARRANTY}
                      onChange={(e) => setFormData({...formData, WARRANTY: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingPrebuild ? 'Update Prebuild' : 'Create Prebuild'}
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

export default PrebuildsManager;
