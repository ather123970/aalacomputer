import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, Grid, List, ArrowLeft } from 'lucide-react';
import { ProductGrid, LoadingSpinner } from '../components/PremiumUI';
import { getCategoryByIdentifier, autoDetectCategory, autoDetectBrand } from '../data/categoriesData';
import { API_CONFIG } from '../config/api';

const CategoryProductsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(true);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Set category info immediately for instant page render
    const categoryInfo = getCategoryByIdentifier(slug);
    
    if (categoryInfo) {
      setCategory(categoryInfo);
    } else {
      console.warn(`Category not found for slug: ${slug}`);
      setCategory(null);
    }
    
    setInitialLoad(false);
    
    // Load products in background (only if category exists)
    if (categoryInfo) {
      loadCategoryAndProducts();
    } else {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedBrand, priceRange, sortBy]);

  const loadCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Category info already set in useEffect for instant render
      const categoryInfo = category || getCategoryByIdentifier(slug);

      // Fetch products with optimized limit
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=500`);
      const data = await response.json();
      const allProducts = Array.isArray(data) ? data : (data.products || []);

      // Filter products for this category with auto-detection
      const categoryProducts = allProducts.filter(product => {
        let productCategory = product.category;
        
        // Auto-detect brand if missing (do this first)
        if (!product.brand || product.brand.trim() === '') {
          const detectedBrand = autoDetectBrand(product);
          product.brand = detectedBrand || '';
        }

        // Auto-detect category if missing or empty
        if (!productCategory || productCategory.trim() === '') {
          const detected = autoDetectCategory(product);
          productCategory = detected ? detected.name : '';
          product.category = productCategory;
        }

        // Match category - if no category info, return false
        if (!categoryInfo) return false;
        
        // Normalize both for comparison
        const normalizedCategory = (productCategory || '').toLowerCase().trim();
        const normalizedCategoryName = (categoryInfo.name || '').toLowerCase().trim();
        const normalizedSlug = (categoryInfo.slug || '').toLowerCase().trim();
        
        // Check multiple matching strategies
        const matches = (
          // Exact match with category name
          normalizedCategory === normalizedCategoryName ||
          // Match with slug
          normalizedCategory === normalizedSlug ||
          // Match with alternative names
          categoryInfo.alternativeNames?.some(alt => 
            alt.toLowerCase().trim() === normalizedCategory
          ) ||
          // Partial match (contains) as fallback
          normalizedCategory.includes(normalizedSlug) ||
          normalizedSlug.includes(normalizedCategory) ||
          // Check if product name/title contains category keywords
          (normalizedCategory === '' && categoryInfo.keywords?.some(keyword =>
            (product.name || product.title || '').toLowerCase().includes(keyword.toLowerCase())
          ))
        );

        // Debug logging for first few products
        if (allProducts.indexOf(product) < 3) {
          console.log('Product matching:', {
            productName: product.name || product.title,
            productCategory: productCategory,
            lookingFor: categoryInfo.name,
            matches: matches
          });
        }

        return matches;
      });

      // Extract unique brands from products
      const brands = [...new Set(categoryProducts.map(p => p.brand).filter(Boolean))].sort();
      setAvailableBrands(brands);

      // Debug logging
      console.log(`Category "${slug}" - Found ${categoryProducts.length} products`);
      console.log('Category info:', categoryInfo);
      console.log('Sample matched products:', categoryProducts.slice(0, 3).map(p => ({
        name: p.name || p.title,
        category: p.category,
        brand: p.brand
      })));

      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'name-az':
        filtered.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      case 'name-za':
        filtered.sort((a, b) => (b.title || b.name || '').localeCompare(a.title || a.name || ''));
        break;
      default:
        // Default order
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setPriceRange({ min: 0, max: Infinity });
    setSortBy('default');
  };

  // Show category not found only after initial load
  if (!category && !initialLoad) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Category Not Found</h2>
        <button
          onClick={() => navigate('/categories')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse All Categories
        </button>
      </div>
    );
  }

  // Skeleton loader component
  const ProductSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center space-x-2 text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">{category?.name || 'Loading...'}</h1>
            <p className="text-blue-100 text-lg mb-4">{category?.description || 'Please wait...'}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {filteredProducts.length} Products
              </span>
              {availableBrands.length > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {availableBrands.length} Brands
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Brands</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                </select>
              </div>

              {/* Active Filters */}
              {(selectedBrand || sortBy !== 'default') && (
                <div className="pt-4 border-t">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Active Filters:</div>
                  <div className="space-y-2">
                    {selectedBrand && (
                      <div className="flex items-center justify-between bg-blue-50 px-3 py-1 rounded-lg">
                        <span className="text-sm">{selectedBrand}</span>
                        <button onClick={() => setSelectedBrand('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 w-full bg-white px-4 py-3 rounded-lg shadow flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {loading ? (
              <ProductSkeletonGrid />
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-20 bg-white rounded-xl">
                <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsPage;
