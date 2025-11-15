import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, X, Save, FolderTree,
  AlertCircle, CheckCircle, Loader, Eye, EyeOff
} from 'lucide-react';
import { apiCall } from '../../config/api';

const CategoriesManager = ({ onStatsUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brands: [],
    published: true,
    sortOrder: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/categories').catch(() => []);
      const categoriesList = Array.isArray(data) ? data : [];
      setCategories(categoriesList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      setError('Failed to load categories');
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
      const categoryData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      if (editingCategory) {
        await apiCall(`/api/admin/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryData)
        });
        setSuccess('Category updated successfully!');
      } else {
        await apiCall('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData)
        });
        setSuccess('Category created successfully!');
      }

      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will affect all products in this category!')) return;

    setLoading(true);
    try {
      await apiCall(`/api/admin/categories/${id}`, { method: 'DELETE' });
      setSuccess('Category deleted successfully!');
      loadCategories();
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (category) => {
    setLoading(true);
    try {
      await apiCall(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...category, published: !category.published })
      });
      setSuccess(`Category ${!category.published ? 'published' : 'unpublished'}!`);
      loadCategories();
    } catch (err) {
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      brands: category.brands || [],
      published: category.published !== false,
      sortOrder: category.sortOrder || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      brands: [],
      published: true,
      sortOrder: 0
    });
    setEditingCategory(null);
  };

  const addBrand = () => {
    const brand = prompt('Enter brand name:');
    if (brand && !formData.brands.includes(brand)) {
      setFormData({...formData, brands: [...formData.brands, brand]});
    }
  };

  const removeBrand = (brand) => {
    setFormData({...formData, brands: formData.brands.filter(b => b !== brand)});
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-3xl font-bold mb-2">Categories Management</h2>
          <p className="text-gray-400">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Category
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
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCategories.map(category => (
            <motion.div
              key={category._id || category.id}
              whileHover={{ x: 4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderTree className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <span className="text-sm text-gray-500">({category.slug})</span>
                    {category.published !== false ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                        Hidden
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                  )}
                  {category.brands && category.brands.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {category.brands.slice(0, 10).map((brand, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                          {brand}
                        </span>
                      ))}
                      {category.brands.length > 10 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-sm">
                          +{category.brands.length - 10} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublished(category)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title={category.published !== false ? 'Hide' : 'Publish'}
                  >
                    {category.published !== false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id || category.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Processors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="processors"
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({...formData, published: e.target.checked})}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium">Published</span>
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Brands</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.brands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2"
                        >
                          {brand}
                          <button
                            type="button"
                            onClick={() => removeBrand(brand)}
                            className="hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addBrand}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                    >
                      + Add Brand
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingCategory ? 'Update Category' : 'Create Category'}
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

export default CategoriesManager;
