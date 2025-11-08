import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Eye, EyeOff, ArrowUp, ArrowDown,
  Folder, FolderOpen, Tag, Save, X, AlertCircle, CheckCircle
} from 'lucide-react';
import { apiCall } from '../../config/api';
import { PC_HARDWARE_CATEGORIES, getCategoryByIdentifier } from '../../data/categoriesData';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, brandsData] = await Promise.all([
        apiCall('/api/admin/categories').catch(() => ({ categories: [] })),
        apiCall('/api/admin/brands').catch(() => ({ brands: [] }))
      ]);
      
      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      const endpoint = editingCategory 
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      await apiCall(endpoint, {
        method,
        body: JSON.stringify(categoryData)
      });

      setSuccess(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowModal(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      setError(error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await apiCall(`/api/admin/categories/${id}`, { method: 'DELETE' });
      setSuccess('Category deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (error) {
      setError(error.message || 'Failed to delete category');
    }
  };

  const handleToggleVisibility = async (category) => {
    try {
      await apiCall(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...category,
          published: !category.published
        })
      });
      loadData();
    } catch (error) {
      setError(error.message || 'Failed to update visibility');
    }
  };

  const handleSeedCategories = async () => {
    if (!confirm(`This will add ${PC_HARDWARE_CATEGORIES.length} pre-defined PC hardware categories. Continue?`)) return;

    setIsSeeding(true);
    try {
      const promises = PC_HARDWARE_CATEGORIES.map(categoryData => 
        apiCall('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData)
        }).catch(e => console.log(`Skipping ${categoryData.name}:`, e.message))
      );

      await Promise.all(promises);
      setSuccess(`Successfully seeded ${PC_HARDWARE_CATEGORIES.length} categories!`);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (error) {
      setError('Some categories failed to seed');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Folder className="w-6 h-6 mr-2 text-blue-600" />
            Categories Management
          </h2>
          <p className="text-gray-600 mt-1">
            Organize products with categories and subcategories
          </p>
        </div>
        <div className="flex space-x-2">
          {categories.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSeedCategories}
              disabled={isSeeding}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <FolderOpen className="w-5 h-5" />
              <span>{isSeeding ? 'Seeding...' : 'Seed PC Categories'}</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
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
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <button
                onClick={() => handleToggleVisibility(category)}
                className={`p-1 rounded-lg ${
                  category.published
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {category.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {category.description || 'No description'}
            </p>

            {category.brands && category.brands.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Tag className="w-3 h-3 mr-1" />
                  Brands ({category.brands.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.brands.slice(0, 3).map((brand, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {brand}
                    </span>
                  ))}
                  {category.brands.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{category.brands.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {category.productCount || 0} products
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No categories found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
          </p>
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={editingCategory}
            brands={brands}
            onClose={() => {
              setShowModal(false);
              setEditingCategory(null);
            }}
            onSave={handleSaveCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, brands, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
    brands: [],
    published: true,
    sortOrder: 0,
    ...category
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const toggleBrand = (brand) => {
    const newBrands = formData.brands.includes(brand)
      ? formData.brands.filter(b => b !== brand)
      : [...formData.brands, brand];
    setFormData({ ...formData, brands: newBrands });
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Create Category'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name)
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Graphics Cards"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., graphics-cards"
              />
            </div>
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
              placeholder="Describe this category..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Attach Brands
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {brands.map((brand) => (
                <button
                  key={brand._id}
                  type="button"
                  onClick={() => toggleBrand(brand.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.brands.includes(brand.name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={formData.published ? 'published' : 'draft'}
                onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
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
              <span>{category ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CategoriesManagement;
