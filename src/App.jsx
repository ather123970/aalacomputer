import React, { useState, useEffect } from "react";
import { motion as FM } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";

const App = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(30); // seconds for one loop

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
        console.log('🔍 Fetching all products from database...');
        
        // Fetch products, prebuilds, and deals in parallel
        const [productsRes, prebuildsRes, dealsRes] = await Promise.all([
          fetch(`${base}/api/products`),
          fetch(`${base}/api/prebuilds`),
          fetch(`${base}/api/deals`)
        ]);

        let allData = [];

        // Process products
        if (productsRes.ok) {
          const products = await productsRes.json();
          if (Array.isArray(products)) {
            allData = [...allData, ...products.map(p => ({...p, source: 'product'}))];
          }
        }

        // Process prebuilds
        if (prebuildsRes.ok) {
          const prebuilds = await prebuildsRes.json();
          if (Array.isArray(prebuilds)) {
            allData = [...allData, ...prebuilds.map(p => ({...p, source: 'prebuild'}))];
          }
        }

        // Process deals
        if (dealsRes.ok) {
          const deals = await dealsRes.json();
          if (Array.isArray(deals)) {
            allData = [...allData, ...deals.map(p => ({...p, source: 'deal'}))];
          }
        }

        // Format all products
        const formatted = allData.map(p => ({
          id: p._id || p.id,
          name: p.title || p.name || 'Unnamed Product',
          price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
          img: p.imageUrl || p.img || '/placeholder.svg',
          category: p.category || 'Other',
          specs: Array.isArray(p.specs) ? p.specs : (p.description ? [p.description] : []),
          tags: Array.isArray(p.tags) ? p.tags : [],
          source: p.source || 'product'
        }));

        console.log('✅ Total products loaded:', formatted.length);
        setAllProducts(formatted);
      } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();

    // Listen for product updates from admin
    const onProductsUpdated = () => {
      fetchAllProducts();
    };

    const onStorage = (e) => {
      if (e && e.key === 'products_last_updated') {
        fetchAllProducts();
      }
    };

    window.addEventListener('products-updated', onProductsUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('products-updated', onProductsUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Intelligent fuzzy search function
  const smartSearch = (product, query) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    // Common aliases for better matching
    const aliases = {
      'gpu': ['gpu', 'graphic card', 'graphics card', 'video card', 'vga', 'graphics'],
      'ram': ['ram', 'memory', 'ddr', 'ddr4', 'ddr5'],
      'ssd': ['ssd', 'nvme', 'm.2', 'm2', 'solid state'],
      'hdd': ['hdd', 'hard drive', 'hard disk'],
      'cpu': ['cpu', 'processor', 'intel', 'amd', 'ryzen', 'core'],
      'keyboard': ['keyboard', 'key board', 'keys'],
      'mouse': ['mouse', 'mice'],
      'pc': ['pc', 'computer', 'desktop', 'system', 'prebuild', 'prebuilt']
    };

    // Expand search query with aliases
    let searchTerms = [q];
    for (const [key, values] of Object.entries(aliases)) {
      if (values.some(v => q.includes(v))) {
        searchTerms.push(key, ...values);
      }
    }

    // Fields to search in
    const searchableText = [
      product.name,
      product.category,
      ...product.specs,
      ...product.tags,
      product.source
    ].join(' ').toLowerCase();

    // Check if any search term matches
    return searchTerms.some(term => {
      // Partial match - even first letter
      return searchableText.includes(term);
    });
  };

  // Filter products based on search - only show when user searches
  const filteredResults = searchTerm.trim()
    ? allProducts.filter((item) => smartSearch(item, searchTerm))
    : []; // Empty when no search term

  // Log search results for debugging
  if (searchTerm.trim()) {
    console.log(`🔍 Searching "${searchTerm}" in ${allProducts.length} products`);
    console.log(`✅ Found ${filteredResults.length} matches`);
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-gradient-to-br from-white via-blue-100 to-blue-400 text-blue-900 mt-[3vh] px-6 md:px-10 py-12 md:py-24 flex flex-col-reverse md:flex-row items-center justify-between overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-3xl"
        style={{ minHeight: 'auto' }}
      >
        {/* TOP-RIGHT BUTTON */}
        <FM.button
          initial={{ y: 100, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          id="view-prebuilds-btn"
          onClick={() => navigate("/products")}
          className="absolute top-6 right-6 bg-blue-700 hover:bg-blue-800 text-white text-sm sm:text-base md:text-lg rounded-md py-2 px-4 md:py-3 md:px-6 transition-all shadow-md hover:shadow-lg z-20"
        >
          View PreBuilds
        </FM.button>
        {/* LEFT SIDE — TEXT CONTENT */}
        <FM.div
          initial={{ x: 100, opacity: 1 }}
          animate={inView ? { x: 0, opacity: 1 } : { x: 100, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex-1 text-center md:text-left space-y-6 md:ml-8 z-10"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight relative">
            Build your <br />
            <span className="relative inline-block text-blue-700 font-extrabold animate-float-glow">
              Dream
              {/* Tiny flame under “Dream” */}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-2 h-2">
                <span className="absolute inset-0 bg-orange-500 rounded-full blur-[1px] animate-flicker"></span>
                <span className="absolute top-[1px] left-[1px] w-[5px] h-[5px] bg-yellow-300 rounded-full blur-[0.5px] animate-flicker-slow"></span>
              </span>
            </span>{" "}
            PC in minutes
          </h1>

          <FM.h3
            initial={{ x: 100, opacity: 1 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 100, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="text-base sm:text-lg text-blue-700/80 max-w-lg mx-auto md:mx-0"
          >
            Choose from a wide range of parts and instantly build your own custom PC.
          </FM.h3>

          <FM.div
            initial={{ y: 100, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex flex-col items-center md:items-start space-y-4 w-full"
          >
            <div className="w-full md:w-[80%] lg:w-[70%]">
              {/* Database info badge */}
              {!loading && allProducts.length > 0 && (
                <div className="mb-2 text-center">
                  <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    🗄️ Searching {allProducts.length} products from database
                  </span>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="text"
                  placeholder={loading ? "Loading products..." : `Search ${allProducts.length} products from database...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md text-blue-900 placeholder-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!loading && searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {!loading && filteredResults.length === 0 && allProducts.length === 0 && (
              <div className="w-full md:w-[80%] lg:w-[70%] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-blue-200 text-center">
                <p className="text-blue-600">No products available yet. Add some in the admin dashboard!</p>
              </div>
            )}

            {searchTerm.trim() && filteredResults.length === 0 && allProducts.length > 0 && !loading && (
              <div className="w-full md:w-[80%] lg:w-[70%] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-blue-200 text-center">
                <p className="text-blue-600 mb-2">No products found matching "{searchTerm}"</p>
                <p className="text-gray-500 text-sm mb-2">Searched through all {allProducts.length} products in database</p>
                <p className="text-gray-500 text-xs">Try: GPU, RAM, SSD, Keyboard, Mouse, PC, or any brand name</p>
              </div>
            )}

            {/* Infinite Horizontal Scrolling Carousel - Pure CSS */}
            {!loading && filteredResults.length > 0 && (
              <div className="w-full overflow-hidden">
                {/* Header with Controls */}
                <div className="flex items-center justify-between mb-3 px-2 flex-wrap gap-2">
                  <div className="text-sm font-semibold text-blue-700">
                    🔍 Found {filteredResults.length} of {allProducts.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Speed Control */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Speed:</span>
                      <button
                        onClick={() => setScrollSpeed(s => Math.max(10, s - 5))}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                      >
                        ⚡ Fast
                      </button>
                      <button
                        onClick={() => setScrollSpeed(s => Math.min(60, s + 5))}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        🐌 Slow
                      </button>
                    </div>
                    {searchTerm.trim() && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded transition-colors"
                      >
                        Clear ×
                      </button>
                    )}
                  </div>
                </div>

                {/* CSS Keyframes Styles */}
                <style>{`
                  @keyframes scrollX {
                    from {
                      transform: translateX(0);
                    }
                    to {
                      transform: translateX(-50%);
                    }
                  }
                  
                  @keyframes bob {
                    0%, 100% {
                      transform: translateY(0px) rotate(0deg);
                    }
                    25% {
                      transform: translateY(-8px) rotate(1deg);
                    }
                    50% {
                      transform: translateY(-4px) rotate(0deg);
                    }
                    75% {
                      transform: translateY(-8px) rotate(-1deg);
                    }
                  }
                  
                  .scroll-track {
                    animation: scrollX var(--scroll-duration, 30s) linear infinite;
                  }
                  
                  .scroll-track:hover {
                    animation-play-state: paused;
                  }
                  
                  .bob-item {
                    animation: bob 3s ease-in-out infinite;
                  }
                  
                  .bob-item:nth-child(2n) {
                    animation-delay: 0.5s;
                  }
                  
                  .bob-item:nth-child(3n) {
                    animation-delay: 1s;
                  }
                  
                  .bob-item:nth-child(4n) {
                    animation-delay: 1.5s;
                  }
                `}</style>

                {/* Horizontal Infinite Scroll Container */}
                <div className="relative group">
                  {/* Left Gradient Fade */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Right Gradient Fade */}
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-50 via-blue-50/50 to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Hover Indicator */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-xs px-3 py-1 rounded-full z-20 shadow-lg">
                    ⏸ Hover to pause • ⚡ Adjust speed above
                  </div>
                  
                  {/* Scrolling Track */}
                  <div className="overflow-hidden py-4">
                    <div 
                      className="scroll-track flex gap-6"
                      style={{ '--scroll-duration': `${scrollSpeed}s` }}
                    >
                      {/* Duplicate items twice for smooth infinite loop */}
                      {[...filteredResults, ...filteredResults].map((item, index) => {
                        const targetUrl = item.source === 'deal' 
                          ? `/deal/${item.id}` 
                          : `/products/${item.id}`;
                        
                        const badgeColor = item.source === 'deal' 
                          ? 'bg-red-500' 
                          : item.source === 'prebuild'
                          ? 'bg-blue-500'
                          : 'bg-green-500';
                        
                        return (
                          <div
                            key={`${item.id}-${index}`}
                            className="bob-item flex-shrink-0 w-[280px] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl p-4 cursor-pointer transition-all border-2 border-blue-200 hover:border-blue-400 group/card"
                            onClick={() => {
                              console.log('🔗 Navigating to:', targetUrl, '| Product:', item.name);
                              navigate(targetUrl);
                            }}
                          >
                            {/* Image */}
                            <div className="relative mb-3 overflow-hidden rounded-lg">
                              <img
                                src={item.img}
                                alt={item.name}
                                className="w-full h-36 object-cover group-hover/card:scale-110 transition-transform duration-500"
                                onError={(e) => e.currentTarget.src = '/placeholder.svg'}
                              />
                              <span className={`absolute top-2 right-2 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full uppercase shadow-lg`}>
                                {item.source}
                              </span>
                              {/* View Details Overlay */}
                              <div className="absolute inset-0 bg-blue-600/0 group-hover/card:bg-blue-600/20 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover/card:opacity-100 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold transition-opacity">
                                  View Details →
                                </span>
                              </div>
                            </div>
                            
                            {/* Product Name */}
                            <h3 className="font-bold text-blue-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
                              {item.name}
                            </h3>
                            
                            {/* Price and Category */}
                            <div className="flex items-center justify-between">
                              <p className="text-blue-600 font-bold text-base">
                                PKR {item.price.toLocaleString()}
                              </p>
                              {item.category && (
                                <span className="text-gray-500 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FM.div>
        </FM.div>

        {/* RIGHT SIDE — IMAGE SECTION */}
        <FM.div
          initial={{ x: -100, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : { x: -100, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex-1 flex justify-center items-center mb-10 md:mb-0 relative max-w-full"
        >
          {/* Glow behind image - reduced size on very small screens to avoid overflow */}
          <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[200px] sm:w-[260px] md:w-[360px] h-[80px] sm:h-[100px] bg-blue-400/50 blur-3xl rounded-full opacity-70 pointer-events-none"></div>

          <img
            src="/pcglow.jpg"
            alt="PC build"
            className="relative w-[220px] sm:w-[300px] md:w-[420px] lg:w-[520px] max-w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(37,99,235,0.6)]"
          />
        </FM.div>
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
