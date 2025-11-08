import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, Grid, List, ArrowLeft } from 'lucide-react';
import { ProductGrid, LoadingSpinner } from '../components/PremiumUI';
import { getCategoryByIdentifier, autoDetectCategory, autoDetectBrand } from '../data/categoriesData';
import { API_CONFIG } from '../config/api';
import { fetchCategoryProducts, fetchDynamicCategories, fetchCategoryBrands } from '../services/categoryService';

// Skeleton loader component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const CategoryProductsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 32;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('featured');
  const [availableBrands, setAvailableBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load category and initial products
  const loadCategoryAndProducts = useCallback(async () => {
    setLoading(true);
    setIsInitialLoad(true);
    setCurrentPage(1);
    setProducts([]);
    setFilteredProducts([]);
    
    try {
      // Get category info from static data (fallback) or dynamic API
      let categoryInfo = getCategoryByIdentifier(slug);
      
      if (!categoryInfo) {
        const dynamicCategories = await fetchDynamicCategories();
        categoryInfo = dynamicCategories.find(c => 
          c.slug === slug || 
          c.name.toLowerCase() === slug.toLowerCase()
        );
      }
      
      if (!categoryInfo) {
        console.error(`Category not found: ${slug}`);
        setLoading(false);
        return;
      }
      
      setCategory(categoryInfo);
      
      // Fetch products - always start with page 1
      const result = await fetchCategoryProducts(slug, { 
        limit: ITEMS_PER_PAGE, 
        page: 1
      });
      
      console.log(`[CategoryProducts] Loaded ${result.products?.length || 0} products for ${slug}`);
      
      const newProducts = result.products || [];
      setProducts(newProducts);
      setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE));
      setHasMore((result.products?.length || 0) >= ITEMS_PER_PAGE);
      
      console.log(`[CategoryProducts] Total: ${result.total}, Pages: ${Math.ceil((result.total || 0) / ITEMS_PER_PAGE)}, HasMore: ${(result.products?.length || 0) >= ITEMS_PER_PAGE}`);
      
      // Extract unique brands
      const brands = [...new Set(newProducts.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(brands.sort());
      
    } catch (error) {
      console.error('Error loading category and products:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCategoryAndProducts();
  }, [loadCategoryAndProducts]);

  const applyFilters = useCallback(() => {
    // Start with a fresh copy of products
    // Note: API already returns category-specific products, so no need to filter by category again
    let filtered = [...products];

    // Apply brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Get category's official brands for priority sorting
    const officialBrands = category?.brands || [];
    const officialBrandsLower = officialBrands.map(b => b.toLowerCase());

    // Priority sorting - official brands first
    filtered.sort((a, b) => {
      const aBrand = (a.brand || '').toLowerCase();
      const bBrand = (b.brand || '').toLowerCase();
      
      const aIsOfficial = officialBrandsLower.includes(aBrand);
      const bIsOfficial = officialBrandsLower.includes(bBrand);
      
      // If one is official and other is not, official comes first
      if (aIsOfficial && !bIsOfficial) return -1;
      if (!aIsOfficial && bIsOfficial) return 1;
      
      // Both official or both non-official - apply selected sort within group
      switch (sortBy) {
        case 'price-asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price-desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'name-asc':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'name-desc':
          return (b.title || b.name || '').localeCompare(a.title || a.name || '');
        default:
          // Default: keep relative order within group
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedBrand, priceRange, sortBy, category, slug]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadMoreProducts = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      
      // Get category info from static data (fallback) or dynamic API
      let categoryInfo = getCategoryByIdentifier(slug);
      
      if (!categoryInfo) {
        const dynamicCategories = await fetchDynamicCategories();
        categoryInfo = dynamicCategories.find(c => 
          c.slug === slug || 
          c.name.toLowerCase() === slug.toLowerCase()
        );
      }
      
      if (!categoryInfo) {
        console.error(`Category not found: ${slug}`);
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      
      setCategory(categoryInfo);
      
      // Fetch products with pagination
      const result = await fetchCategoryProducts(slug, { 
        limit: ITEMS_PER_PAGE, 
        page,
        brand: selectedBrand || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      });
      
      // Process the products
      const newProducts = result.products || [];
      
      // Update products state (append or replace)
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      // Update pagination state
      setCurrentPage(page);
      setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE));
      setHasMore((result.products?.length || 0) >= ITEMS_PER_PAGE);
      
      // Extract unique brands from the first page
      if (page === 1) {
        const brands = await fetchCategoryBrands(categoryInfo.id);
        setAvailableBrands(brands);
      }
      
      return newProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [slug, selectedBrand, priceRange]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // Load more when user scrolls to 90% of the page (closer to bottom)
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      console.log(`[CategoryProducts] Loading page ${currentPage + 1}...`);
      loadMoreProducts(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadMoreProducts]);
  
  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const clearFilters = () => {
    setSelectedBrand('');
    setPriceRange([0, 100000]);
    setSortBy('featured');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 bg-white/20 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
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
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-blue-100 text-lg mb-4">{category.description}</p>
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

            {filteredProducts.length > 0 ? (
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
