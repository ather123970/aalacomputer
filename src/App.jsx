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
        const response = await fetch(`${base}/api/products?limit=1000`); // Load first 1000 for search
        if (response.ok) {
          const data = await response.json();
          const formatted = Array.isArray(data) ? data.map(p => ({
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
          })) : [];
          
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
        className="relative bg-gradient-to-br from-white via-blue-100 to-blue-400 text-blue-900 min-h-[90vh] md:min-h-[80vh] lg:min-h-[70vh] mt-[2vh] mx-4 md:mx-6 lg:mx-8 xl:mx-12 2xl:mx-auto 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-2xl sm:rounded-3xl"
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
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm sm:text-base group-hover:text-blue-700">
                        {item.displayName || item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-blue-600 font-medium text-sm">
                          Rs {item.price?.toLocaleString() || item._original?.price?.toLocaleString() || 0}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                          {item.categoryNormalized || item.category || item._original?.category || 'Product'}
                        </span>
                        {item.brandNormalized && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full capitalize">
                            {item.brandNormalized}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — IMAGE SECTION */}
        <div className="flex-1 flex justify-center items-center mt-8 lg:mt-0 relative w-full lg:w-1/2">
          {/* Glow behind image - responsive sizing */}
          <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[200px] sm:w-[260px] md:w-[320px] lg:w-[360px] xl:w-[400px] h-[80px] sm:h-[100px] md:h-[120px] lg:h-[130px] bg-blue-400/50 blur-3xl rounded-full opacity-70 pointer-events-none"></div>

          <img
            src="/images/pcglow.jpg"
            alt="PC build"
            className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[360px] xl:max-w-[400px] 2xl:max-w-[480px] h-auto object-contain drop-shadow-[0_0_25px_rgba(37,99,235,0.6)]"
            loading="lazy"
          />
        </div>
      </section>

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); text-shadow: 0 0 10px rgba(59,130,246,0.5); }
          50% { transform: translateY(-12px); text-shadow: 0 0 20px rgba(59,130,246,0.8); }
        }
        .animate-float-glow {
          animation: floatGlow 3s ease-in-out infinite;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        .animate-flicker {
          animation: flicker 0.3s infinite;
        }
        .animate-flicker-slow {
          animation: flicker 0.6s infinite;
        }
      `}</style>
    </>
  );
};

export default App;
