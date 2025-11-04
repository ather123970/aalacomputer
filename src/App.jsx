import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Nav from './nav';
import { ProductGrid, LoadingSpinner } from './components/PremiumUI';
import { useInView } from 'react-intersection-observer';
import { API_CONFIG } from './config/api';
import { searchProducts, getSearchSuggestions, normalizeProduct } from './utils/searchUtils';

const App = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [prebuilds, setPrebuilds] = useState([]);
  const [normalizedProducts, setNormalizedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  // Fetch and normalize products
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        // Load first 1000 products for search (first few pages)
        const response = await fetch(`${base}/api/products?limit=1000&page=1`);
        if (response.ok) {
          const data = await response.json();
          let products = [];
          
          // Handle both array and paginated response formats
          if (Array.isArray(data)) {
            products = data;
          } else if (data && Array.isArray(data.products)) {
            products = data.products;
          }
          
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
          
          // Normalize all products for search
          const normalized = formatted.map(p => normalizeProduct(p));
          
          setPrebuilds(formatted);
          setNormalizedProducts(normalized);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setPrebuilds([]);
        setNormalizedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

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
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-blue-200 z-30 overflow-hidden">
                  <div className="p-2 bg-blue-50 border-b border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">Suggestions:</p>
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                        {suggestion.type}
                      </span>
                      <span className="text-sm text-blue-900 font-medium">{suggestion.display}</span>
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
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-h-[60vh] overflow-y-auto space-y-3 border border-blue-200">
                <div className="pb-2 border-b border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">
                    Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b border-blue-100 pb-3 last:border-b-0 hover:bg-blue-50 transition-colors rounded-md p-2 cursor-pointer group"
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    <img
                      src={item.img || item.imageUrl || item._original?.img || item._original?.imageUrl || '/placeholder.svg'}
                      alt={item.displayName || item.name}
                      className="w-16 h-16 object-contain rounded-md shadow-sm bg-white p-1"
                      onError={(e) => {
                        try {
                          const current = e.currentTarget.src || '';
                          const original = item.img || item.imageUrl || item._original?.img || item._original?.imageUrl || '';
                          const isExternal = /^https?:\/\//i.test(original);
                          const alreadyProxied = current.includes('/api/proxy-image');
                          if (isExternal && !alreadyProxied) {
                            e.currentTarget.src = `/api/proxy-image?url=${encodeURIComponent(original)}`;
                            return;
                          }
                        } catch {}
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 text-sm group-hover:text-blue-700 truncate">
                        {item.displayName || item.name}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium">
                        PKR {typeof item.price === 'number' ? item.price.toLocaleString() : 'N/A'}
                      </p>
                      {item.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full truncate">
                          {item.category}
                        </span>
                      )}
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
              src="/pcglow.jpg"
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
                src="/pcglow.jpg"
                alt="PC Glow showcase"
                className="w-full h-[380px] object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
            </div>
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <ProductGrid products={prebuilds.slice(0, 8)} />
          )}

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
    </>
  );
};

export default App;