import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "../nav";
import { API_CONFIG } from '../config/api';
import { ChevronDown, ArrowUp } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg";
  
  // For external URLs, return them directly (no proxy)
  // The images from zahcomputers.pk are public and will be handled with fallback in the component
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For local paths:
  // If it starts with /images/, return as is
  if (path.startsWith('/images/')) return path;
  // If it starts with / but not /images/, prepend /images/
  if (path.startsWith('/')) return `/images${path}`;
  // Otherwise, add /images/ prefix
  return `/images/${path}`;
};

const categories = [
  "All",
  "PC",
  "Deals",
  "Prebuilds",
  "Laptops",
  "Motherboard",
  "CPU",
  "GPU",
  "RAM",
  "Storage",
  "PSU",
  "Case",
  "Cooling",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Motherboard Accessories",
  "Laptop Accessories"
];

const brandOptionsByCategory = {
  All: [],
  PC: [],
  Deals: [],
  Prebuilds: [],
  Laptops: [],
  Motherboard: ["MSI", "ASUS", "Gigabyte", "ASRock"],
  CPU: ["Intel", "AMD"],
  GPU: ["NVIDIA", "ASUS", "MSI", "Gigabyte", "ZOTAC", "PNY"],
  RAM: ["Corsair", "Kingston", "G.Skill", "ADATA", "Crucial", "XPG"],
  Storage: ["Samsung", "WD (Western Digital)", "Seagate", "Kingston", "Crucial", "Hikvision"],
  PSU: ["Cooler Master", "Corsair", "Thermaltake", "Antec", "SilverStone"],
  Case: ["Cougar", "Cooler Master", "Thermaltake", "NZXT", "Lian Li"],
  Cooling: ["DeepCool", "Cooler Master", "NZXT", "Corsair", "Arctic"],
  Monitor: ["Samsung", "ASUS", "Dell", "Acer", "LG", "ViewSonic"],
  Keyboard: ["Redragon", "Logitech", "Corsair", "Razer", "Bloody"],
  Mouse: ["Logitech", "Redragon", "Razer", "Bloody", "A4Tech"],
  Headset: ["HyperX", "Logitech", "Razer", "Redragon", "Fantech"],
  "Motherboard Accessories": ["UGREEN", "Orico", "Vention"],
  "Laptop Accessories": ["Dell", "HP", "Lenovo", "ASUS", "Anker"]
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 32;
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const productsGridRef = useRef(null);
  const categoriesRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch products from backend on component mount
  useEffect(() => {
    loadProducts(1, false);

    // Listen for product updates from admin (same-tab) and storage events (cross-tab)
    const onProductsUpdated = () => {
      loadProducts(1, false);
    };

    const onStorage = (e) => {
      if (e && e.key === 'products_last_updated') onProductsUpdated();
    };

    window.addEventListener('products-updated', onProductsUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('products-updated', onProductsUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [selectedCategory, selectedBrand, searchQuery]);

  // Load products with pagination support
  const loadProducts = async (page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const endpoints = [`${base}/api/v1/products`, `${base}/api/products`];
      let allProductsData = [];
      let total = 0;
      
      // Try each endpoint
      for (const url of endpoints) {
        try {
          // Build query parameters
          const queryParams = new URLSearchParams({
            page: page,
            limit: PAGE_SIZE
          });
          
          // Add filters if they exist
          if (selectedCategory && selectedCategory !== "All") {
            queryParams.append('category', selectedCategory);
          }
          if (selectedBrand) {
            queryParams.append('brand', selectedBrand);
          }
          if (searchQuery) {
            queryParams.append('search', searchQuery);
          }
          
          const batchUrl = `${url}?${queryParams.toString()}`;
          console.log(`[Products] Fetching: ${batchUrl}`);
          
          const resp = await fetch(batchUrl, {
            signal: AbortSignal.timeout(15000)
          });
          
          if (resp.ok) {
            const json = await resp.json();
            let batchData = [];
            
            if (Array.isArray(json)) {
              batchData = json;
              total = json.length;
            } else if (json && Array.isArray(json.products)) {
              batchData = json.products;
              total = json.total || batchData.length;
              setHasMoreProducts(json.hasMore || batchData.length === PAGE_SIZE);
            }
            
            if (batchData.length > 0) {
              allProductsData = batchData;
              console.log(`[Products] Loaded page ${page}: ${batchData.length} products`);
              break;
            } else {
              setHasMoreProducts(false);
            }
          }
        } catch (error) {
          console.warn(`[Products] Failed to load products from ${url}:`, error.message);
        }
      }
      
      if (allProductsData.length > 0) {
        const formattedProducts = allProductsData.map(p => {
          // Prefer normalized priceAmount if present, fall back to price
          const numericPrice = Number(p.priceAmount ?? p.price ?? 0) || 0;

          // Support images array and backward-compatible single fields
          const images = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : (p.imageUrl || p.img) ? [{ url: p.imageUrl || p.img, alt: p.title || p.name || p.Name, primary: true }] : [];

          const primaryFromArray = images.find(i => i.primary && i.url);
          const imageUrlCandidate = p.imageUrlPrimary || (primaryFromArray && primaryFromArray.url) || (images[0] && images[0].url) || p.imageUrl || p.img;

          return {
            id: p._id || p.id,
            Name: p.Name || p.title || p.name || 'Unnamed Product',
            price: numericPrice,
            img: getImageUrl(imageUrlCandidate),
            images,
            imageUrlPrimary: p.imageUrlPrimary || null,
            Spec: Array.isArray(p.Spec) ? p.Spec : (Array.isArray(p.specs) ? p.specs : (p.description ? [p.description] : [])),
            category: p.category || 'Other',
            brand: p.brand || null,
            type: p.type || null,
            styles: p.styles || null
          };
        });
        
        if (append) {
          setAllProducts(prev => [...prev, ...formattedProducts]);
        } else {
          setAllProducts(formattedProducts);
          setTotalProducts(total);
        }
        
        try {
          localStorage.setItem("products", JSON.stringify(formattedProducts));
        } catch (e) {
          console.warn("[Products] Failed to cache products in localStorage", e);
        }
        
        if (page === 1) {
          setCurrentPage(1);
        }
      } else if (!append) {
        setAllProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('[Products] Failed to load products from backend:', error);
      if (!append) {
        setAllProducts([]);
        setTotalProducts(0);
      }
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Load more products when scrolling to bottom
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMoreProducts) {
      loadProducts(currentPage + 1, true);
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMoreProducts, currentPage]);

  // Filter products when category or price changes
  useEffect(() => {
    const norm = (s) => (s || "").toString().trim().toLowerCase();
    
    // First filter by category and price (robust, case-insensitive)
    let base = allProducts.filter((p) => {
      // If "All" is selected, show everything
      if (selectedCategory === "All") {
        const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        return matchPrice;
      }
      
      // For specific categories, do fuzzy matching
      const productCategory = norm(p.category);
      const productName = norm(p.Name);
      const selectedCat = norm(selectedCategory);
      
      // Match category or name (e.g., "Headset" matches products with "headset" in category or name)
      const matchCategory = productCategory.includes(selectedCat) || 
                           selectedCat.includes(productCategory) ||
                           productCategory === selectedCat ||
                           productName.includes(selectedCat) || // Also match in product name
                           selectedCat.includes(productName);
      
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchPrice;
    });

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = norm(searchQuery);
      base = base.filter((p) => {
        const nameStr = norm(p.Name);
        const specStr = Array.isArray(p.Spec) ? norm(p.Spec.join(" ")) : "";
        const catStr = norm(p.category);
        const brandStr = norm(p.brand || "");
        return nameStr.includes(query) || specStr.includes(query) || catStr.includes(query) || brandStr.includes(query);
      });

      setFilteredProducts(base);
    } else {
      setFilteredProducts(base);
    }
  }, [selectedCategory, priceRange, allProducts, selectedBrand, searchQuery]);

  // Sync selectedCategory with URL query param (?category=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search || window.location.search);
    const cat = params.get('category');
    if (cat) {
      const match = categories.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (match && match !== selectedCategory) {
        setSelectedCategory(match);
      }
    }
  }, [location.search]);

  // Reset selected brand when category changes and scroll to products
  useEffect(() => {
    setSelectedBrand(null);
    
    // Hide other categories when a specific category is selected
    if (selectedCategory !== "All") {
      setShowAllCategories(false);
    } else {
      setShowAllCategories(true);
    }
    
    // Scroll to products grid when category changes
    if (selectedCategory !== "All" && productsGridRef.current) {
      setTimeout(() => {
        productsGridRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
    
    // Reset to first page when filters change
    setCurrentPage(1);
    loadProducts(1, false);
  }, [selectedCategory, selectedBrand, searchQuery, priceRange]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  const buynow = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/products/${product.id}`);
    }, 150);
  };

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <Nav />
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-panel min-h-[calc(100vh-72px)] text-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500">Explore Our Products</h1>
          {totalProducts > 0 && (
            <p className="text-muted">
              Showing {Math.min(filteredProducts.length, PAGE_SIZE * currentPage)} of {filteredProducts.length} products
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Filters and Products Section */}
        {!isLoading && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products by name, category, or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-card border-2 border-gray-700 rounded-xl text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <p className="text-sm text-muted mt-2">
                  Searching for: <span className="font-semibold text-blue-500">{searchQuery}</span>
                </p>
              )}
            </div>

            <div ref={categoriesRef} className="flex flex-wrap gap-2 mb-8 items-center justify-center md:justify-start">
              {/* Toggle All Categories Button */}
              {!showAllCategories && selectedCategory !== "All" && (
                <button
                  onClick={() => setShowAllCategories(true)}
                  className="px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <span>Show All Categories</span>
                </button>
              )}

              {/* Category Buttons */}
              {(showAllCategories ? categories : [selectedCategory, "All"]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOpenCategory(cat === "All" ? null : cat);
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 text-sm ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "bg-card hover:bg-blue-500/10 text-muted hover:text-blue-400 border border-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Brand Filter (only show when a category is selected) */}
              {selectedCategory !== "All" && (
                <div className="relative">
                  <button
                    onClick={() => setOpenCategory(openCategory === "brands" ? null : "brands")}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 text-sm flex items-center gap-2 ${
                      selectedBrand
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "bg-card hover:bg-green-500/10 text-muted hover:text-green-400 border border-gray-700"
                    }`}
                  >
                    <span>Brand</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === "brands" ? "rotate-180" : ""}`} />
                  </button>

                  {openCategory === "brands" && (
                    <div className="absolute top-full left-0 mt-2 bg-card border border-gray-700 rounded-xl shadow-xl z-50 w-64 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedBrand(null);
                            setOpenCategory(null);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                            !selectedBrand
                              ? "bg-blue-500/20 text-blue-400"
                              : "hover:bg-gray-700/50 text-muted"
                          }`}
                        >
                          All Brands
                        </button>
                        {(brandOptionsByCategory[selectedCategory] || []).map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              setSelectedBrand(brand);
                              setOpenCategory(null);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                              selectedBrand === brand
                                ? "bg-blue-500/20 text-blue-400"
                                : "hover:bg-gray-700/50 text-muted"
                            }`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-8 bg-card p-6 rounded-2xl border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Filter by Price</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted mb-2">Min Price (PKR)</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2">Max Price (PKR)</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted">
                Showing products between {priceRange[0].toLocaleString()} PKR and {priceRange[1].toLocaleString()} PKR
              </div>
            </div>

            {/* Products Grid */}
            <div ref={productsGridRef} className="mb-12">
              {filteredProducts.length === 0 && !isLoading ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted">No products found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedBrand(null);
                      setSearchQuery("");
                      setPriceRange([0, 500000]);
                    }}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        buynow={buynow}
                        loadingId={loadingId}
                        navigate={navigate}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                      >
                        {loadingMore ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading More...
                          </>
                        ) : (
                          "Load More Products"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Back to All Products Button */}
                  {selectedCategory !== "All" && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setSelectedCategory("All")}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        View All Products
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
};

const ProductCard = ({ p, buynow, loadingId, navigate }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(p.img || "/placeholder.svg");
  const [tryingProxy, setTryingProxy] = useState(false);
  
  const handleImageError = (e) => {
    const currentSrc = e.currentTarget.src;
    
    // If we haven't tried the proxy yet and this is an external URL
    if (!tryingProxy && p.img && (p.img.startsWith('http://') || p.img.startsWith('https://'))) {
      setTryingProxy(true);
      // Try loading through proxy
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(p.img)}`;
      e.currentTarget.src = proxyUrl;
      console.log(`Trying proxy for ${p.Name}:`, proxyUrl);
      return;
    }
    
    // If proxy also failed or it's not an external URL, use placeholder
    if (!imgError) {
      setImgError(true);
      e.currentTarget.src = "/placeholder.svg";
      console.warn(`Failed to load image for ${p.Name} (tried direct and proxy):`, p.img);
    }
  };
  
  return (
    <div
      onClick={() => navigate(`/products/${p.id}`)}
      className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow border border-gray-800"
    >
      <div className="relative h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center p-2">
        <img
          src={imgSrc}
          alt={p.Name}
          className="max-h-full max-w-full object-contain"
          onError={handleImageError}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>

      <h2 className="text-lg font-semibold text-blue-400">{p.Name}</h2>
      <p className="text-blue-500 font-medium">{typeof p.price === 'number' ? p.price.toLocaleString() : 'N/A'} PKR</p>
      <p className="text-muted text-sm mt-2">{Array.isArray(p.Spec) ? p.Spec.join(", ") : ''}</p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          buynow(p);
        }}
        disabled={loadingId === p.id}
        className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      >
        {loadingId === p.id ? "Loading..." : "View Details"}
      </button>
    </div>
  );
};

export default Products;