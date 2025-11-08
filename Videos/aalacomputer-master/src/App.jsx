import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Nav from './nav';
import { ProductGrid, LoadingSpinner } from './components/PremiumUI';
import { useInView } from 'react-intersection-observer';
import { API_CONFIG } from './config/api';
import { searchProducts, getSearchSuggestions, normalizeProduct } from './utils/searchUtils';
import SmartImage from './components/SmartImage';

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
      
      <section
        ref={sectionRef}
        className="relative bg-gradient-to-br from-white via-blue-100 to-blue-400 text-blue-900 min-h-[70vh] mt-2 w-full px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      >
        {/* TOP-RIGHT BUTTON */}
        <button
          id="view-prebuilds-btn"
          onClick={() => navigate("/products")}
          className="absolute top-4 right-4 lg:top-6 lg:right-8 bg-blue-700 hover:bg-blue-800 text-white text-sm sm:text-base lg:text-lg xl:text-xl font-semibold rounded-xl py-2 px-4 sm:py-3 sm:px-6 lg:py-4 lg:px-8 transition-all shadow-lg hover:shadow-xl z-20"
        >
          View Products
        </button>
        {/* LEFT SIDE — TEXT CONTENT */}
        <div className="flex-1 text-center lg:text-left space-y-6 w-full lg:w-1/2 lg:pr-8 xl:pr-12 z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight relative tracking-tight">
            Build your <br className="hidden sm:block" />
            <span className="relative inline-block text-blue-700 font-extrabold whitespace-nowrap">
              Dream
              {/* Tiny flame under "Dream" */}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-2 h-2">
                <span className="absolute inset-0 bg-orange-500 rounded-full blur-[1px]"></span>
                <span className="absolute top-[1px] left-[1px] w-[5px] h-[5px] bg-yellow-300 rounded-full blur-[0.5px]"></span>
              </span>
            </span>{" "}
            PC in minutes
          </h1>

          <h3 className="text-base sm:text-lg text-blue-700/80 max-w-lg mx-auto lg:mx-0">
            Choose from a wide range of parts and instantly build your own custom PC.
          </h3>

          <div className="flex flex-col items-center lg:items-start space-y-4 w-full">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto lg:mx-0">
              <input
                type="text"
                placeholder={loading ? "Loading products..." : "Search products..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-blue-300 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md text-blue-900 placeholder-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && searchTerm.trim() && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-blue-200 z-30 overflow-hidden max-h-64 overflow-y-auto">
                  <div className="p-2 bg-blue-50 border-b border-blue-200 sticky top-0">
                    <p className="text-xs text-blue-600 font-semibold">Suggestions:</p>
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 sm:px-4 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize flex-shrink-0">
                        {suggestion.type}
                      </span>
                      <span className="text-sm text-blue-900 font-medium truncate">{suggestion.display}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {debouncedSearchTerm.trim() && filteredResults.length === 0 && !loading && (
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-blue-200 text-center">
                <p className="text-blue-600 font-semibold mb-2">No products found matching "{debouncedSearchTerm}"</p>
                <p className="text-blue-500 text-sm">Try searching for: GPU, MSI, Corsair, Keyboard, etc.</p>
              </div>
            )}

            {filteredResults.length > 0 && (
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-3 sm:p-4 max-h-[60vh] overflow-y-auto space-y-3 border border-blue-200">
                <div className="pb-2 border-b border-blue-200 sticky top-0 bg-white/95 backdrop-blur-sm">
                  <p className="text-xs text-blue-600 font-semibold">
                    Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 border-b border-blue-100 pb-3 last:border-b-0 hover:bg-blue-50 transition-colors rounded-md p-3 group"
                  >
                    <SmartImage
                      src={item.img || item.imageUrl || '/placeholder.svg'}
                      alt={item.displayName || item.name}
                      product={item}
                      className="w-20 h-20 object-contain rounded-lg shadow-sm bg-white p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-900 text-sm group-hover:text-blue-700 truncate">
                        {item.displayName || item.name || item.title}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium mb-1">
                        PKR {typeof item.price === 'number' ? item.price.toLocaleString() : 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {item.brand && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {item.brand}
                          </span>
                        )}
                        {item.category && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className="text-yellow-400 text-xs">⭐</span>
                        ))}
                        <span className="text-gray-500 text-xs ml-1">(4.8)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <span className="bg-green-100 px-2 py-0.5 rounded-full">🔥 Trending</span>
                        <span>Most Selling</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart directly
                          const cartItem = {
                            id: item.id || item._id,
                            name: item.name || item.title || item.displayName,
                            price: Number(item.price || 0),
                            img: item.img || item.imageUrl || '/placeholder.svg',
                            spec: item.description || '',
                            qty: 1
                          };
                          
                          // Use the global addToCart function if available
                          if (window.addToCart) {
                            window.addToCart(cartItem);
                          } else {
                            // Fallback: directly update localStorage
                            try {
                              const raw = localStorage.getItem("aala_cart");
                              const arr = raw ? JSON.parse(raw) : [];
                              const idx = arr.findIndex((i) => i.id === cartItem.id);
                              if (idx === -1) arr.push(cartItem);
                              else arr[idx] = { ...arr[idx], qty: (arr[idx].qty || 1) + 1 };
                              localStorage.setItem("aala_cart", JSON.stringify(arr));
                            } catch (e) {
                              console.error('Cart update error:', e);
                            }
                          }
                          
                          // Navigate to cart
                          navigate('/cart');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>🛒</span>
                        Buy Now
                      </button>
                      <button
                        onClick={() => navigate(`/products/${item.id || item._id}`)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile banner image */}
        <div className="flex lg:hidden w-full justify-center items-center mt-6 z-10">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <img
              src="https://res.cloudinary.com/dqsiquwhw/image/upload/v1762370830/pcglow_ez384i.jpg"
              alt="PC Glow showcase"
              className="w-full h-40 object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>
        </div>

        {/* RIGHT SIDE — PCGlow Only */}
        <div className="hidden lg:flex lg:w-1/2 justify-center items-center relative z-10">
          <div className="relative w-full max-w-3xl">
            <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <img
                src="https://res.cloudinary.com/dqsiquwhw/image/upload/v1762370830/pcglow_ez384i.jpg"
                alt="PC Glow showcase"
                className="w-full h-[380px] object-cover"
                loading="lazy"
                onError={(e) => { 
                  e.currentTarget.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeiG9kf4-DyOrqrH5e8x6_hhamqkJS__-yIg&s'; 
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our complete range of PC hardware organized by category
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { name: 'Processors', icon: '🔧', slug: 'processors', color: 'from-blue-500 to-blue-600' },
              { name: 'Graphics Cards', icon: '🎮', slug: 'graphics-cards', color: 'from-purple-500 to-purple-600' },
              { name: 'RAM', icon: '💾', slug: 'ram', color: 'from-green-500 to-green-600' },
              { name: 'Motherboards', icon: '🔲', slug: 'motherboards', color: 'from-orange-500 to-orange-600' },
              { name: 'Storage', icon: '💿', slug: 'storage', color: 'from-pink-500 to-pink-600' },
              { name: 'Monitors', icon: '🖥️', slug: 'monitors', color: 'from-cyan-500 to-cyan-600' },
              { name: 'Keyboards', icon: '⌨️', slug: 'keyboards', color: 'from-indigo-500 to-indigo-600' },
              { name: 'Mouse', icon: '🖱️', slug: 'mouse', color: 'from-red-500 to-red-600' },
              { name: 'Headsets', icon: '🎧', slug: 'headsets', color: 'from-yellow-500 to-yellow-600' },
              { name: 'PC Cases', icon: '📦', slug: 'cases', color: 'from-teal-500 to-teal-600' },
              { name: 'Laptops', icon: '💻', slug: 'laptops', color: 'from-violet-500 to-violet-600' },
              { name: 'Deals', icon: '🔥', slug: 'deals', color: 'from-rose-500 to-rose-600' }
            ].map((category, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-4 text-center transform hover:-translate-y-1"
              >
                <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform`}>
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-panel">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Featured Products</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Explore our top picks for building the perfect PC setup
            </p>
          </div>

          <ProductGrid products={prebuilds.slice(0, 8)} />

          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Infinite Scroll Trigger - Load More Products */}
      {!loading && hasMore && !allProductsLoaded && (
        <div ref={loadMoreRef} className="py-8 flex justify-center items-center">
          {loadingMore ? (
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner />
              <p className="text-sm text-gray-600">Loading more products...</p>
            </div>
          ) : (
            <div className="h-10"></div>
          )}
        </div>
      )}

      {/* All Products Loaded Message */}
      {!loading && allProductsLoaded && prebuilds.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-600 font-medium">
            ✅ All {prebuilds.length} products loaded
          </p>
        </div>
      )}
    </>
  );
};

export default App;
