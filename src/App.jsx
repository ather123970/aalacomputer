import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProductGrid, LoadingSpinner } from './components/PremiumUI';
import { useInView } from 'react-intersection-observer';
import { API_CONFIG } from './config/api';
import { searchProducts, getSearchSuggestions, normalizeProduct } from './utils/searchUtils';
import { detectSearchCategory, searchByCategory, formatCategorySearchResults } from './utils/categorySearchUtils';
import CategorySearchResults from './components/CategorySearchResults';
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
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });

  // Fetch products with pagination (100 initial, 80 per page for fast loading)
  const fetchProducts = useCallback(async (pageNum) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const limit = isFirstPage ? 100 : 80; // Load 100 initially, then 80 per page for optimal performance

      console.log('[App] Fetching from:', `${base}/api/products?limit=${limit}&page=${pageNum}`);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${base}/api/products?limit=${limit}&page=${pageNum}`, {
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
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

      console.log('[App] Products fetched successfully:', formatted.length);
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

  // Extract featured products in specific order (8 products)
  useEffect(() => {
    if (prebuilds.length > 0) {
      const categoryOrder = ['Processors', 'Graphics Cards', 'Keyboards', 'Headsets', 'Mouse', 'RAM', 'Motherboards', 'Power Supply'];
      const categoryMap = new Map();
      const featured = [];

      // Group products by category
      prebuilds.forEach(product => {
        const category = product.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, product);
        }
      });

      // Add products in specific order (max 8)
      categoryOrder.forEach(category => {
        if (featured.length < 8 && categoryMap.has(category)) {
          featured.push(categoryMap.get(category));
        }
      });

      setFeaturedProducts(featured);
    }
  }, [prebuilds]);

  // Initial load
  useEffect(() => {
    fetchProducts(1);

    // Fallback timeout - force show content after 10 seconds even if loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      console.warn('[App] Loading timeout - forcing render');
    }, 10000);

    return () => clearTimeout(timeoutId);
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

  // Detect search category (GPU, CPU, RAM, etc.)
  const detectedCategory = useMemo(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.trim().length < 1) {
      return null;
    }
    return detectSearchCategory(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Category-specific search results
  const categorySearchResults = useMemo(() => {
    if (!detectedCategory || !debouncedSearchTerm.trim()) {
      return [];
    }
    return searchByCategory(prebuilds, debouncedSearchTerm, detectedCategory, {
      maxResults: 20,
      minScore: 5
    });
  }, [debouncedSearchTerm, detectedCategory, prebuilds]);

  // Check if current search is category-specific
  const isCurrentSearchCategory = useMemo(() => {
    return debouncedSearchTerm.trim().length > 0 && detectedCategory !== null;
  }, [debouncedSearchTerm, detectedCategory]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion.value);
    setSuggestions([]);
  }, []);

  return (
    <>
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

      {/* Category Search Results Section */}
      {isCurrentSearchCategory && detectedCategory && (
        <section className="py-12 bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategorySearchResults
              results={categorySearchResults}
              query={debouncedSearchTerm}
              category={detectedCategory}
              isLoading={loading}
            />
          </div>
        </section>
      )}

      {/* Hero Banner Section */}
      <section className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-3xl"
          >
            <picture>
              <source
                srcSet={mobileHero}
                media="(max-width: 640px)"
              />
              <img
                src="/desktop-hero.png"
                alt="Aala Computer Banner - Click to view all products"
                className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Shop by Category Section - Infinite Scroll Carousel */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our complete range of PC hardware organized by category
            </p>
          </div>

          {/* Infinite Scrolling Carousel */}
          <div className="relative mb-8">
            {/* Gradient Overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Scrollable Container */}
            <div
              className="overflow-x-auto scrollbar-hide pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                
                @keyframes scroll-left {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                
                .animate-scroll {
                  animation: scroll-left 40s linear infinite;
                }
                
                .animate-scroll:hover {
                  animation-play-state: paused;
                }
              `}</style>

              {/* Double the categories for seamless infinite scroll */}
              <div className="flex gap-8 animate-scroll" style={{ width: 'max-content' }}>
                {[...Array(2)].map((_, dupIndex) => (
                  <React.Fragment key={dupIndex}>
                    {[
                      { name: 'Processors', icon: '🔧', slug: 'processors', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
                      { name: 'Graphics Cards', icon: '🎮', slug: 'graphics-cards', color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
                      { name: 'RAM', icon: '💾', slug: 'ram', color: 'bg-gradient-to-br from-green-400 to-green-600' },
                      { name: 'Motherboards', icon: '🧩', slug: 'motherboards', color: 'bg-gradient-to-br from-orange-400 to-orange-600' },
                      { name: 'Storage', icon: '💿', slug: 'storage', color: 'bg-gradient-to-br from-pink-400 to-pink-600' },
                      { name: 'Monitors', icon: '🖥️', slug: 'monitors', color: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
                      { name: 'Keyboards', icon: '⌨️', slug: 'keyboards', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
                      { name: 'Mouse', icon: '🖱️', slug: 'mouse', color: 'bg-gradient-to-br from-red-400 to-red-600' },
                      { name: 'Headsets', icon: '🎧', slug: 'headsets', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
                      { name: 'PC Cases', icon: '🧱', slug: 'cases', color: 'bg-gradient-to-br from-teal-400 to-teal-600' },
                      { name: 'Laptops', icon: '💻', slug: 'laptops', color: 'bg-gradient-to-br from-violet-400 to-violet-600' },
                      { name: 'Deals', icon: '🔥', slug: 'deals', color: 'bg-gradient-to-br from-rose-400 to-rose-600' }
                    ].map((category, idx) => (
                      <button
                        key={`${dupIndex}-${idx}`}
                        onClick={() => navigate(`/category/${category.slug}`)}
                        className="group flex flex-col items-center gap-4 flex-shrink-0 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
                      >
                        {/* Large Circle */}
                        <div className={`w-32 h-32 ${category.color} rounded-full flex items-center justify-center text-5xl shadow-xl group-hover:shadow-2xl transition-all duration-300 border-4 border-white ring-4 ring-blue-100 group-hover:ring-blue-300`}>
                          {category.icon}
                        </div>
                        {/* Category Name */}
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors max-w-[128px] text-center">
                          {category.name}
                        </h3>
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
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

      {/* Featured Products Section - First product from each category */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our top picks from each category - GPUs, Processors, RAM, Keyboards, and more
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <ProductGrid products={featuredProducts} />
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
