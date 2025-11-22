import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { ProductGrid, LoadingSpinner } from "../components/PremiumUI";
import { API_CONFIG } from "../config/api";
import { PC_HARDWARE_CATEGORIES } from "../data/categoriesData";
import { categoriesMatch, normalizeCategory } from "../utils/categoryMatcher";
import SimpleImage from '../components/SimpleImage';
import { getImageFromProduct } from '../utils/simpleImageLoader';
import { ChevronDown, ArrowUp } from 'lucide-react';
import Nav from '../nav';

const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg";
  
  // For base64 images, return directly
  if (path.startsWith('data:image/')) {
    return path;
  }
  
  // For external URLs, return them directly (no proxy)
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

// Get image from product - more robust version for modal
const getProductImage = (product) => {
  if (!product) return '/placeholder.svg';
  
  // Check all possible image fields
  const imageFields = [
    'img', 'imageUrl', 'image', 'image_url', 'imageLink', 'image_link',
    'photo', 'photoUrl', 'photo_url', 'picture', 'pictureUrl', 'picture_url',
    'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'src', 'url', 
    'imageUrl1', 'image1', 'image1_url'
  ];
  
  for (const field of imageFields) {
    const value = product[field];
    if (value && typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      // Skip placeholder values
      if (trimmed === 'empty' || trimmed === 'null' || trimmed === 'undefined') continue;
      // Return valid URLs
      if (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
        return trimmed;
      }
    }
  }
  
  return '/placeholder.svg';
};

// Get product name - more robust version
const getProductName = (product) => {
  if (!product) return 'Unnamed Product';
  
  // Check all possible name fields
  const nameFields = ['Name', 'name', 'title', 'productName', 'product_name', 'productTitle', 'product_title'];
  
  for (const field of nameFields) {
    const value = product[field];
    if (value && typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== 'empty' && trimmed !== 'null' && trimmed !== 'undefined') {
        return trimmed;
      }
    }
  }
  
  // If no name field found, log the product structure for debugging
  console.log('[Modal] Product has no name field. Available fields:', Object.keys(product).slice(0, 20));
  
  return 'Unnamed Product';
};

// Enhanced categories with better organization
const defaultCategories = [
  "All",
  "Processors",
  "Motherboards", 
  "Graphics Cards",
  "RAM",
  "Storage",
  "Power Supplies",
  "CPU Coolers",
  "PC Cases",
  "Monitors",
  "Keyboards",
  "Mouse",
  "Headsets",
  "Laptops",
  "Gaming Chairs",
  "Cables & Accessories",
  "Deals"
];

// Enhanced brand mapping with more comprehensive coverage
const brandOptionsByCategory = {
  "All": [],
  "Processors": ["Intel", "AMD"],
  "Motherboards": ["ASUS", "MSI", "Gigabyte", "ASRock", "Biostar"],
  "Graphics Cards": ["ASUS", "MSI", "Gigabyte", "ZOTAC", "PNY", "XFX", "Sapphire", "PowerColor"],
  "RAM": ["Corsair", "Kingston", "G.Skill", "ADATA", "Crucial", "XPG", "TeamGroup", "T-Force"],
  "Storage": ["Samsung", "Western Digital", "WD", "Seagate", "Kingston", "Crucial", "XPG", "Hikvision"],
  "Power Supplies": ["Cooler Master", "Corsair", "Thermaltake", "DeepCool", "Gigabyte", "MSI"],
  "CPU Coolers": ["Cooler Master", "DeepCool", "NZXT", "Thermalright", "ID-COOLING", "Arctic"],
  "PC Cases": ["Lian Li", "Cooler Master", "DeepCool", "NZXT", "Cougar", "Thermaltake"],
  "Monitors": ["Samsung", "ASUS", "Dell", "Acer", "LG", "ViewSonic", "HP"],
  "Keyboards": ["Logitech", "Redragon", "Fantech", "Razer", "Corsair", "HyperX", "Bloody"],
  "Mouse": ["Razer", "Logitech", "Bloody", "Fantech", "Redragon", "A4Tech"],
  "Headsets": ["HyperX", "Logitech", "Razer", "Redragon", "Fantech", "Bloody"],
  "Laptops": ["Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI"],
  "Gaming Chairs": ["DXRacer", "Secretlab", "Noblechairs", "Corsair"],
  "Cables & Accessories": ["UGREEN", "Orico", "Vention", "CableMod", "Generic"],
  "Deals": []
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 200;
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
  const [categories, setCategories] = useState(defaultCategories);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsWithoutImages, setProductsWithoutImages] = useState([]);
  

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        const response = await fetch(`${base}/api/categories`);
        
        if (response.ok) {
          const data = await response.json();
          let categoriesData = [];
          
          if (Array.isArray(data)) {
            categoriesData = data;
          } else if (data.categories) {
            categoriesData = data.categories;
          }
          
          // Extract category names and add "All" at the beginning
          // Filter out prebuild categories since they have their own page
          const categoryNames = categoriesData
            .filter(cat => {
              // Handle both string and object formats
              const catName = (typeof cat === 'string' ? cat : (cat.name || '')).toLowerCase();
              return catName && 
                     !catName.includes('prebuild') && 
                     !catName.includes('pre-build') &&
                     catName !== 'gaming pc' &&
                     catName !== 'pc build';
            })
            .map(cat => typeof cat === 'string' ? cat : cat.name)
            .filter(Boolean);
          
          if (categoryNames.length > 0) {
            const finalCategories = ['All', ...categoryNames];
            setCategories(finalCategories);
            console.log('[Products] Loaded categories from database:', finalCategories);
          } else {
            console.log('[Products] Using default categories');
            setCategories(defaultCategories);
          }
        }
      } catch (error) {
        console.error('[Products] Failed to load categories:', error);
        console.log('[Products] Using default categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load ALL products on mount (only once)
  useEffect(() => {
    const loadAllProducts = async () => {
      console.log(`[Products] Loading ALL products...`);
      
      setIsLoading(true);
      
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        console.log(`[Products] API Base URL: ${base}`);
        
        // Load ALL products at once - NO filters, NO pagination
        // Use very high limit to get all products
        const url = `${base}/api/products?limit=50000`;
        console.log(`[Products] Fetching: ${url}`);
        
        const resp = await fetch(url, {
          signal: AbortSignal.timeout(30000)
        });
        
        if (!resp.ok) {
          throw new Error(`API returned status ${resp.status}`);
        }
        
        const json = await resp.json();
        console.log(`[Products] API Response:`, json);
        
        let batchData = [];
        let total = 0;
        
        // Handle different response formats
        if (Array.isArray(json)) {
          batchData = json;
          total = json.length;
          console.log(`[Products] Response is array with ${batchData.length} items`);
        } else if (json && Array.isArray(json.products)) {
          batchData = json.products;
          total = json.total || batchData.length;
          console.log(`[Products] Response has products array with ${batchData.length} items`);
        } else {
          console.warn(`[Products] Unexpected response format:`, json);
          batchData = [];
        }
        
        console.log(`[Products] Got ${batchData.length} products, total: ${total}`);
        
        if (batchData && batchData.length > 0) {
          // Format all products - preserve ALL fields from database
          const formattedProducts = batchData.map(p => ({
            // IDs
            id: p._id || p.id,
            _id: p._id,
            
            // Names
            Name: p.Name || p.title || p.name || 'Unnamed Product',
            name: p.Name || p.title || p.name || 'Unnamed Product',
            title: p.title || p.Name || p.name,
            
            // Price
            price: Number(p.priceAmount ?? p.price ?? 0) || 0,
            
            // Images - preserve ALL image fields from database
            img: p.img,
            imageUrl: p.imageUrl,
            image: p.image,
            image_url: p.image_url,
            imageLink: p.imageLink,
            image_link: p.image_link,
            photo: p.photo,
            photoUrl: p.photoUrl,
            photo_url: p.photo_url,
            picture: p.picture,
            pictureUrl: p.pictureUrl,
            picture_url: p.picture_url,
            thumbnail: p.thumbnail,
            thumbnailUrl: p.thumbnailUrl,
            thumbnail_url: p.thumbnail_url,
            src: p.src,
            url: p.url,
            imageUrl1: p.imageUrl1,
            image1: p.image1,
            image1_url: p.image1_url,
            
            // Category & Brand
            category: p.category || 'Other',
            brand: p.brand || null,
            
            // Specs
            Spec: Array.isArray(p.Spec) ? p.Spec : (Array.isArray(p.specs) ? p.specs : []),
            
            // Preserve all other fields
            ...p
          }));
          
          console.log(`[Products] Formatted ${formattedProducts.length} products`);
          setAllProducts(formattedProducts);
          setTotalProducts(formattedProducts.length);
          
          try {
            localStorage.setItem("products", JSON.stringify(formattedProducts));
            console.log(`[Products] Cached products to localStorage`);
          } catch (e) {
            console.warn("[Products] Failed to cache products in localStorage", e);
          }
        } else {
          console.warn(`[Products] No products in response`);
          setAllProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error('[Products] Failed to load products from backend:', error);
        setAllProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllProducts();
  }, []); // Empty dependency array - only run once on mount



  // Filter products when category, brand, or price changes
  useEffect(() => {
    console.log(`[Products] Filter Effect - allProducts: ${allProducts.length}, category: ${selectedCategory}`);
    
    const norm = (s) => (s || "").toString().trim().toLowerCase();
    
    // First filter by category and price (robust, case-insensitive)
    let base = allProducts.filter((p) => {
      // Price filter
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      
      // If "All" is selected, show everything (with price filter)
      if (selectedCategory === "All") {
        return matchPrice;
      }
      
      // For specific categories, use smart category matching
      // This handles variations like "processor type" vs "processors"
      const matchCategory = categoriesMatch(p.category, selectedCategory);
      
      return matchCategory && matchPrice;
    });

    // Apply brand filter if selected
    if (selectedBrand) {
      const brandNorm = norm(selectedBrand);
      base = base.filter((p) => {
        const productBrand = norm(p.brand || "");
        const productName = norm(p.Name);
        // Match brand in brand field or product name
        return productBrand.includes(brandNorm) || 
               brandNorm.includes(productBrand) ||
               productName.includes(brandNorm);
      });
    }

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
    }

    console.log(`[Products] Filtering: allProducts=${allProducts.length}, selectedCategory=${selectedCategory}, filtered=${base.length}`);
    setFilteredProducts(base);
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

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle products with missing images
  const handleMissingImage = useCallback((product) => {
    setProductsWithoutImages(prev => {
      // Check if product already exists in the list
      if (prev.some(p => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const buynow = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/products/${product.id}`);
    }, 150);
  };


  // Pagination derived values - use filtered products for display
  const paginatedProducts = filteredProducts;

  return (
    <>
      <Nav />
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-panel min-h-[calc(100vh-72px)] text-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500">Explore Our Products</h1>
          <div className="flex items-center gap-4">
            {totalProducts > 0 && (
              <p className="text-muted text-sm">
                Showing {allProducts.length} products
              </p>
            )}
            <a
              href="/quick-category-update"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Quick Category Update</span>
            </a>
          </div>
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
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => navigate(`/products/${product.id}`)}
                        priority={index < 8} // First 8 products load immediately
                        onMissingImage={handleMissingImage}
                        categories={categories}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-4 mt-8 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                    >
                      ← Previous
                    </button>
                    
                    <span className="text-muted font-semibold">
                      Page {currentPage}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasMoreProducts || isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                    >
                      Next →
                    </button>
                  </div>

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

            {/* Not Found Products Section */}
            {productsWithoutImages.length > 0 && (
              <div className="mt-16 bg-gradient-to-r from-orange-50/10 to-red-50/10 border border-orange-500/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-orange-400">Products Without Images</h3>
                    <p className="text-sm text-muted mt-1">These products need image uploads</p>
                  </div>
                  <div className="ml-auto bg-orange-500/20 px-4 py-2 rounded-lg">
                    <span className="text-lg font-bold text-orange-400">{productsWithoutImages.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsWithoutImages.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card rounded-2xl p-4 border border-orange-500/30 hover:border-orange-500/60 transition-all group"
                    >
                      {/* No Image Placeholder */}
                      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-orange-900/20 to-red-900/20 flex items-center justify-center border border-orange-500/30">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-orange-500/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-orange-400/60">No Image Available</p>
                        </div>
                      </div>

                      <h2 className="product-name text-lg font-semibold text-orange-400 line-clamp-2 min-h-[3.5rem]">{product.Name}</h2>
                      <p className="text-blue-500 font-medium text-xl mt-2">{typeof product.price === 'number' ? product.price.toLocaleString() : 'N/A'} PKR</p>
                      
                      {/* Specs */}
                      {Array.isArray(product.Spec) && product.Spec.length > 0 && (
                        <p className="text-muted text-sm mt-2 line-clamp-2">{product.Spec.join(", ")}</p>
                      )}
                      
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="w-full mt-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-muted">
                    <span className="text-orange-400 font-semibold">Note:</span> These products are still available for purchase but need product images to be added. Contact admin to upload images for better visibility.
                  </p>
                </div>
              </div>
            )}
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

const ProductCard = ({ product, onClick, priority = false, onMissingImage, categories = [] }) => {
  // Get image URL from product - checks ALL possible image fields
  const imageUrl = getImageFromProduct(product) || '/placeholder.svg';
  const [hasNoImage, setHasNoImage] = useState(false);

  // Generate random urgency data (in production, this would come from backend)
  const viewingCount = Math.floor(Math.random() * 50) + 20;
  const boughtCount = Math.floor(Math.random() * 30) + 10;
  const leftCount = Math.floor(Math.random() * 40) + 15;
  
  // Show urgency indicator on only ~33% of products to look more realistic
  const showUrgency = Math.random() < 0.33;

  // Handle image load error
  const handleImageError = useCallback(() => {
    setHasNoImage(true);
    if (onMissingImage) {
      onMissingImage(product);
    }
  }, [product, onMissingImage]);

  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow border relative overflow-hidden group ${
        hasNoImage ? 'border-orange-500/50' : 'border-gray-800'
      }`}
    >
      {/* Missing Image Badge */}
      {hasNoImage && (
        <div className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">No Image</span>
        </div>
      )}

      {/* Urgency Indicator - Only show on ~33% of products */}
      {showUrgency && !hasNoImage && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
          <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{viewingCount} viewing • {boughtCount} bought • {leftCount} left</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden mt-6 bg-gray-100">
        <SimpleImage
          src={imageUrl}
          alt={product.Name}
          product={product}
          className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <h2 className="product-name text-lg font-semibold text-blue-400 line-clamp-2">{product.Name}</h2>
        {product.category && (
          <p className="text-xs text-gray-400 mt-1">📂 {product.category}</p>
        )}
      </div>
      
      <p className="text-blue-500 font-medium text-xl">{typeof product.price === 'number' ? product.price.toLocaleString() : 'N/A'} PKR</p>
      
      {/* Specs as fallback */}
      {Array.isArray(product.Spec) && product.Spec.length > 0 && (
        <p className="text-muted text-sm mt-2 line-clamp-2">{product.Spec.join(", ")}</p>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        View Details
      </button>
    </div>
  );
};

export default Products;