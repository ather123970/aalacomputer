import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, AlertCircle, Loader } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import Nav from '../nav';

const BulkCategoryManager = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savingIds, setSavingIds] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load all products and categories
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        
        // Fetch all products with no limit
        const productsResponse = await fetch(`${base}/api/products?limit=999999`);
        let productsData = [];
        
        if (productsResponse.ok) {
          const json = await productsResponse.json();
          if (Array.isArray(json)) {
            productsData = json;
          } else if (json.products && Array.isArray(json.products)) {
            productsData = json.products;
          }
        }

        // Format products
        const formattedProducts = productsData.map(p => ({
          id: p._id || p.id,
          _id: p._id,
          name: p.Name || p.name || p.title || 'Unnamed',
          category: p.category || '',
          price: Number(p.price || p.priceAmount || 0),
          ...p
        }));

        setAllProducts(formattedProducts);
        setFilteredProducts(formattedProducts);

        // Fetch categories
        const categoriesResponse = await fetch(`${base}/api/categories`);
        let categoriesData = [];
        
        if (categoriesResponse.ok) {
          const json = await categoriesResponse.json();
          if (Array.isArray(json)) {
            categoriesData = json.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
          } else if (json.categories) {
            categoriesData = json.categories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
          }
        }

        setCategories(['All', ...categoriesData]);
        console.log(`✅ Loaded ${formattedProducts.length} products and ${categoriesData.length} categories`);
      } catch (error) {
        console.error('Error loading data:', error);
        setErrorMessage('Failed to load products and categories');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = allProducts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, allProducts]);

  // Handle category change for a product
  const handleCategoryChange = async (productId, newCategory) => {
    setSavingIds(prev => new Set([...prev, productId]));
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory })
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Update local state
      setAllProducts(prev => prev.map(p => 
        (p.id === productId || p._id === productId)
          ? { ...p, category: newCategory }
          : p
      ));

      setSuccessMessage(`✓ Category updated for product`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMessage('Failed to update category');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Bulk Category Manager</h1>
            <p className="text-gray-600">Search and change categories for all {allProducts.length} products easily</p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {errorMessage}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by product name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📂 Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredProducts.length}</span> of{' '}
              <span className="font-bold">{allProducts.length}</span> products
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading all products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <p className="text-xl text-gray-600">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            /* Products Table */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Product Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Current Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Change Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">{product.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {product.category || 'No Category'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          PKR {product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative group">
                            <button
                              disabled={savingIds.has(product.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                savingIds.has(product.id)
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {savingIds.has(product.id) ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Change
                                </>
                              )}
                            </button>

                            {/* Dropdown Menu */}
                            {!savingIds.has(product.id) && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden group-hover:block">
                                <div className="max-h-64 overflow-y-auto">
                                  {categories.filter(c => c !== 'All').map(cat => (
                                    <button
                                      key={cat}
                                      onClick={() => handleCategoryChange(product.id, cat)}
                                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        product.category === cat
                                          ? 'bg-blue-50 text-blue-700 font-medium'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BulkCategoryManager;
