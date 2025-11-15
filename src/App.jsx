import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Nav from './nav';
import { ProductGrid, LoadingSpinner } from './components/PremiumUI';
import { useInView } from 'react-intersection-observer';
import { API_CONFIG } from './config/api';
import { searchProducts, getSearchSuggestions, normalizeProduct } from './utils/searchUtils';
import SmartImage from './components/SmartImage';
import mobileHero from '../heroimg/mobile.jpg';

const App = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [prebuilds, setPrebuilds] = useState([]);
  const [normalizedProducts, setNormalizedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });

  // Fetch products with pagination (32 per page for fast loading)
  const fetchProducts = useCallback(async (pageNum) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const limit = 32; // Load 32 products per page for optimal performance
      
      console.log(`[App] Fetching page ${pageNum} (${limit} products)...`);
      const response = await fetch(`${base}/api/products?limit=${limit}&page=${pageNum}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('[App] 401 Unauthorized - Backend authentication issue');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      let products = [];
      
      // Handle both array and paginated response formats
      if (Array.isArray(data)) {
        products = data;
      } else if (data && Array.isArray(data.products)) {
        products = data.products;
      }
      
      console.log(`[App] Fetched ${products.length} products for page ${pageNum}`);
      
      // Format products
      const formatted = products.map(p => ({
        id: p._id || p.id,
        name: p.title || p.name || p.Name || 'Unnamed Product',
        title: p.title || p.name || p.Name || 'Unnamed Product',
        price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
        img: p.imageUrl || p.img || '/placeholder.svg',
        imageUrl: p.imageUrl || p.img || '/placeholder.svg',
        category: p.category || 'Product',
        brand: p.brand || '',
        description: p.description || (Array.isArray(p.specs) ? p.specs.join(' ') : ''),
        specs: p.specs || []
      }));
      
      // Check if there are more products
      const hasMoreProducts = products.length === limit;
      setHasMore(hasMoreProducts);
      
      if (isFirstPage) {
        setPrebuilds(formatted);
        setNormalizedProducts(formatted.map(p => normalizeProduct(p)));
      } else {
        // Append to existing products
        setPrebuilds(prev => [...prev, ...formatted]);
        setNormalizedProducts(prev => [...prev, ...formatted.map(p => normalizeProduct(p))]);
      }
      
      // If we got less than requested, all products are loaded
      if (products.length < limit) {
        setAllProductsLoaded(true);
        console.log(`[App] All products loaded (total: ${isFirstPage ? products.length : prebuilds.length + products.length})`);
      }
      
      setBackendError(false);
    } catch (error) {
      console.error('[App] Failed to fetch products:', error.message);
      if (isFirstPage) {
        setPrebuilds([]);
        setNormalizedProducts([]);
      }
      setBackendError(true);
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (loadMoreInView && !loading && !loadingMore && hasMore && !allProductsLoaded) {
      console.log('[App] Loading more products...');
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [loadMoreInView, loading, loadingMore, hasMore, allProductsLoaded, page, fetchProducts]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update suggestions as user types
  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      const newSuggestions = getSearchSuggestions(searchTerm);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Perform smart search using normalized products
  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.trim().length < 1) {
      return [];
    }
    return searchProducts(normalizedProducts, debouncedSearchTerm, {
      minScore: 5,
      maxResults: 20
    });
  }, [debouncedSearchTerm, normalizedProducts]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion.value);
    setSuggestions([]);
  }, []);

  return (
    <>
      {/* Navigation */}
      <Nav 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
      />

      {/* Backend Error Banner */}
      {backendError && (
        <div className="bg-red-600 text-white py-3 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <p className="font-semibold text-lg mb-1">⚠️ Backend Server Not Running</p>
            <p className="text-sm">
              Please start the backend server: Open terminal → Run <code className="bg-red-700 px-2 py-1 rounded">npm run backend</code> → Refresh this page
            </p>
          </div>
        </div>
      )}
      
      {/* Hero Banner Section */}
      <section className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden">
            <picture>
              <source 
                srcSet={mobileHero} 
                media="(max-width: 640px)" 
              />
              <img 
                src="/desktop-hero.png" 
                alt="Aala Computer Banner" 
                className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our complete range of PC hardware organized by category
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {[
              { name: 'Processors', icon: '🔧', slug: 'processors', color: 'bg-blue-500' },
              { name: 'Graphics Cards', icon: '🎮', slug: 'graphics-cards', color: 'bg-purple-500' },
              { name: 'RAM', icon: '💾', slug: 'ram', color: 'bg-green-500' },
              { name: 'Motherboards', icon: '🧩', slug: 'motherboards', color: 'bg-orange-500' },
              { name: 'Storage', icon: '💿', slug: 'storage', color: 'bg-pink-500' },
              { name: 'Monitors', icon: '🖥️', slug: 'monitors', color: 'bg-cyan-500' },
              { name: 'Keyboards', icon: '⌨️', slug: 'keyboards', color: 'bg-indigo-500' },
              { name: 'Mouse', icon: '🖱️', slug: 'mouse', color: 'bg-red-500' },
              { name: 'Headsets', icon: '🎧', slug: 'headsets', color: 'bg-yellow-500' },
              { name: 'PC Cases', icon: '🧱', slug: 'cases', color: 'bg-teal-500' },
              { name: 'Laptops', icon: '💻', slug: 'laptops', color: 'bg-violet-500' },
              { name: 'Deals', icon: '🔥', slug: 'deals', color: 'bg-rose-500' }
            ].map((category, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 mx-auto mb-4 ${category.color} rounded-2xl flex items-center justify-center text-2xl text-white transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {category.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/categories")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our top picks for building the perfect PC setup
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : prebuilds.length > 0 ? (
            <>
              <ProductGrid products={prebuilds.slice(0, 8)} />
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate("/products")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  View All Products
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
              <p className="text-gray-500">Check back later for new arrivals</p>
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default App;
