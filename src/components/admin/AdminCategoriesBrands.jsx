import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Tag, Package } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminCategoriesBrands = ({ showMessage }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
      console.error('Failed to fetch data:', error);
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      showMessage('Please enter category name', 'error');
      return;
    }

    if (categories.includes(newCategoryName)) {
      showMessage('Category already exists', 'error');
      return;
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });

      if (response.ok) {
        setCategories([...categories, newCategoryName].sort());
        setNewCategoryName('');
        setShowNewCategory(false);
        showMessage('Category created successfully!', 'success');
      } else {
        showMessage('Failed to create category', 'error');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      showMessage('Error creating category', 'error');
    }
  };

  const deleteCategory = async (categoryName) => {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/categories/${categoryName}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(c => c !== categoryName));
        showMessage('Category deleted', 'success');
      } else {
        showMessage('Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      showMessage('Error deleting category', 'error');
    }
  };

  const createBrand = async () => {
    if (!newBrandName.trim()) {
      showMessage('Please enter brand name', 'error');
      return;
    }

    if (brands.includes(newBrandName)) {
      showMessage('Brand already exists', 'error');
      return;
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName })
      });

      if (response.ok) {
        setBrands([...brands, newBrandName].sort());
        setNewBrandName('');
        setShowNewBrand(false);
        showMessage('Brand created successfully!', 'success');
      } else {
        showMessage('Failed to create brand', 'error');
      }
    } catch (error) {
      console.error('Failed to create brand:', error);
      showMessage('Error creating brand', 'error');
    }
  };

  const deleteBrand = async (brandName) => {
    if (!window.confirm(`Delete brand "${brandName}"?`)) return;

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/brands/${brandName}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBrands(brands.filter(b => b !== brandName));
        showMessage('Brand deleted', 'success');
      } else {
        showMessage('Failed to delete brand', 'error');
      }
    } catch (error) {
      console.error('Failed to delete brand:', error);
      showMessage('Error deleting brand', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="text-blue-400" />
            <h2 className="text-2xl font-bold">Categories</h2>
            <span className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
              {categories.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            New
          </button>
        </div>

        {/* Create New Category */}
        {showNewCategory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
          >
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
              onKeyPress={(e) => e.key === 'Enter' && createCategory()}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createCategory}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Categories List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No categories yet</p>
          ) : (
            categories.map((category, idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition group"
              >
                <span className="text-white font-medium">{category}</span>
                <button
                  onClick={() => deleteCategory(category)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600 hover:bg-opacity-20 rounded transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Brands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="text-green-400" />
            <h2 className="text-2xl font-bold">Brands</h2>
            <span className="ml-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
              {brands.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewBrand(!showNewBrand)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            New
          </button>
        </div>

        {/* Create New Brand */}
        {showNewBrand && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
          >
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Enter brand name..."
              onKeyPress={(e) => e.key === 'Enter' && createBrand()}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createBrand}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewBrand(false);
                  setNewBrandName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Brands List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No brands yet</p>
          ) : (
            brands.map((brand, idx) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition group"
              >
                <span className="text-white font-medium">{brand}</span>
                <button
                  onClick={() => deleteBrand(brand)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600 hover:bg-opacity-20 rounded transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCategoriesBrands;
