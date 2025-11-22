import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Search, Tag, AlertCircle } from 'lucide-react';

export const CategoryModal = ({ 
  isOpen, 
  onClose, 
  product, 
  categories, 
  onCategoryChange,
  onCreateCategory 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(product?.category || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedCategory(product?.category || '');
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    setError('');
    setSuccess('');
    setSearchQuery('');
  }, [product, isOpen]);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCategory = async () => {
    if (!selectedCategory.trim()) {
      setError('Please select or create a category');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${product._id || product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      setSuccess('✓ Category updated successfully!');
      if (onCategoryChange) {
        onCategoryChange(product._id || product.id, selectedCategory);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Error updating category');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (categories.includes(newCategoryName)) {
      setError('This category already exists');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new category
      if (onCreateCategory) {
        await onCreateCategory(newCategoryName);
      }

      setSelectedCategory(newCategoryName);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      setSuccess('✓ Category created successfully!');
    } catch (err) {
      setError(err.message || 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Manage Category</h2>
            <p className="text-blue-100 text-sm mt-1">Organize your products</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Product Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Product</p>
            <p className="font-semibold text-gray-900 line-clamp-2">{product?.name || product?.title}</p>
          </div>

          {/* Current Category Display */}
          {selectedCategory && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <Tag className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Selected Category</p>
                <p className="text-lg font-bold text-green-700">{selectedCategory}</p>
              </div>
            </div>
          )}

          {/* Category Selection Section */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Choose from Existing Categories
            </label>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery('');
                    }}
                    className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {selectedCategory === cat && <Check className="w-4 h-4 inline mr-1" />}
                    {cat}
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <p className="text-sm">No categories match "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Category Count */}
            <p className="text-xs text-gray-500 mt-2">
              {filteredCategories.length} of {categories.length} categories
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Create New Category Section */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              Create New Category
            </label>

            {!showNewCategoryInput ? (
              <button
                onClick={() => setShowNewCategoryInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 hover:border-purple-500 hover:bg-purple-50 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add New Category
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name (e.g., Gaming Laptops, Accessories)"
                  className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCategory}
                    disabled={loading || !newCategoryName.trim()}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCategory}
            disabled={loading || selectedCategory === product?.category || !selectedCategory}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 transition-all font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Category
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
