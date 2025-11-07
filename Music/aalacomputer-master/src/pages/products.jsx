import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "../nav";
import { API_CONFIG } from '../config/api';
import { ChevronDown, ArrowUp } from 'lucide-react';
import SmartImage from '../components/SmartImage';

const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg";
  
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

// Categories will be loaded from database (excluding prebuilds)
const defaultCategories = [
  "All",
  "Processors",
  "Motherboards",
  "Graphics Cards",
  "RAM",
  "Power Supply",
  "CPU Coolers",
  "PC Cases",
  "Storage",
  "Peripherals",
  "Monitors",
  "Laptops",
  "Prebuilt PCs",
  "Cables & Accessories",
  "Audio Devices",
  "Gaming Chairs",
  "Deals"
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
  const [selectedCategory, setSelectedCategory] = useState("All"); // Default to "All" to show all products
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
  const [categories, setCategories] = useState(defaultCategories);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
            .filter(cat => cat.published !== false)
            .filter(cat => {
              const catName = (cat.name || '').toLowerCase();
              return !catName.includes('prebuild') && 
                     !catName.includes('pre-build') &&
                     catName !== 'gaming pc' &&
                     catName !== 'pc build';
            })
            .map(cat => cat.name);
          
          if (categoryNames.length > 0) {
            setCategories(['All', ...categoryNames]);
            console.log('[Products] Loaded categories from database (excluding prebuilds):', categoryNames.length);
          } else {
            console.log('[Products] Using default categories');
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

  // Load products with pagination support (MUST be defined before useEffect that uses it)
  const loadProducts = useCallback(async (page = 1, append = false) => {
    console.log(`[Products] loadProducts called - page: ${page}, append: ${append}`);
    
    if (page === 1) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      console.log(`[Products] API Base URL: ${base}`);
      
      const endpoints = [`${base}/api/products`]; // Use only the main endpoint
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
            console.log(`[Products] API Response type:`, Array.isArray(json) ? 'Array' : 'Object');
            let batchData = [];
            
            if (Array.isArray(json)) {
              batchData = json;
              total = json.length;
              console.log(`[Products] Got ${json.length} products as array`);
            } else if (json && Array.isArray(json.products)) {
              batchData = json.products;
              total = json.total || batchData.length;
              setHasMoreProducts(json.hasMore || batchData.length === PAGE_SIZE);
              console.log(`[Products] Got ${batchData.length} products from json.products`);
            }
            
            if (batchData.length > 0) {
              allProductsData = batchData;
              console.log(`[Products] Loaded page ${page}: ${batchData.length} products`);
              break;
            } else {
              console.warn(`[Products] No products in response for page ${page}`);
              setHasMoreProducts(false);
            }
          } else {
            console.error(`[Products] API returned status ${resp.status}`);
          }
        } catch (error) {
          console.warn(`[Products] Failed to load products from ${url}:`, error.message);
        }
      }
      
      console.log(`[Products] Total products fetched: ${allProductsData.length}`);
      
      if (allProductsData.length > 0) {
        // Filter out prebuild products - they should only show on /prebuild page
        const nonPrebuildProducts = allProductsData.filter(p => {
          const category = (p.category || '').toLowerCase();
          // Exclude any product with prebuild-related category
          return !category.includes('prebuild') && 
                 !category.includes('pre-build') && 
                 !category.includes('gaming pc') &&
                 category !== 'pc build';
        });
        
        console.log(`[Products] After filtering prebuilds: ${nonPrebuildProducts.length} products (filtered out ${allProductsData.length - nonPrebuildProducts.length})`);
        
        const formattedProducts = nonPrebuildProducts.map(p => {
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
            name: p.Name || p.title || p.name || 'Unnamed Product',
            price: numericPrice,
            img: p.img || p.imageUrl || imageUrlCandidate,
            imageUrl: p.imageUrl || p.img || imageUrlCandidate,
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
          console.log(`[Products] Setting allProducts state with ${formattedProducts.length} products`);
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
  }, [selectedCategory, selectedBrand, searchQuery]);

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
  }, [loadProducts]);

  // Load more products when scrolling to bottom
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMoreProducts) {
      loadProducts(currentPage + 1, true);
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMoreProducts, currentPage, loadProducts]);

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
      
      // For specific categories, do flexible matching
      const productCategory = norm(p.category);
      const selectedCat = norm(selectedCategory);
      
      // Define category groups for flexible matching based on product names
      const categoryGroups = {
        'monitors': ['monitor', 'display', 'screen', 'lcd', 'led', 'oled'],
        'laptops': ['laptop', 'notebook', 'probook', 'thinkpad', 'macbook'],
        'audio devices': ['headset', 'headphone', 'speaker', 'microphone', 'audio', 'sound'],
        'cases': ['case', 'chassis', 'tower', 'mid-tower', 'mini-itx', 'atx'],
        'cooling': ['cooler', 'cooling', 'fan', 'liquid', 'aio', 'thermal'],
        'graphics cards': ['graphics', 'gpu', 'video card', 'rtx', 'gtx', 'radeon', 'nvidia', 'amd'],
        'keyboards': ['keyboard', 'mechanical', 'gaming keyboard'],
        'memory': ['ram', 'memory', 'ddr4', 'ddr5', 'dimm'],
        'mice': ['mouse', 'gaming mouse', 'optical mouse', 'wireless mouse'],
        'motherboards': ['motherboard', 'mainboard', 'mobo', 'socket', 'chipset'],
        'processors': ['processor', 'cpu', 'intel', 'amd', 'ryzen', 'core i'],
        'storage': ['ssd', 'hdd', 'nvme', 'storage', 'hard drive', 'solid state'],
        'power supplies': ['power supply', 'psu', 'watt', 'modular', '80 plus'],
        'cables & adapters': ['cable', 'adapter', 'usb', 'hdmi', 'connector', 'wire']
      };
      
      // Get synonyms for selected category
      const synonyms = categoryGroups[selectedCat] || [selectedCat];
      
      // Check if product matches category by checking both category field and product name
      const productName = norm(p.Name || p.title || '');
      const matchCategory = synonyms.some(syn => {
        // Check category field
        const categoryMatch = productCategory.includes(syn) || syn.includes(productCategory);
        // Check product name (more important since categories are often empty)
        const nameMatch = productName.includes(syn);
        return categoryMatch || nameMatch;
      });
      
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

            {/* New Category & Brand Selection */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              {/* Category Button */}
              <div className="relative">
                <button
                  onClick={() => setOpenCategory(openCategory === "categories" ? null : "categories")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    selectedCategory !== "All"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    selectedCategory !== "All" ? "bg-white" : "bg-blue-500"
                  }`}></div>
                  <span>{selectedCategory === "All" ? "Select Category" : selectedCategory}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openCategory === "categories" ? "rotate-180" : ""}`} />
                </button>
                
                {openCategory === "categories" && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 min-w-80 max-h-96 overflow-y-auto">
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-400 mb-2 px-3">CATEGORIES</div>
                      {[
                        { name: "All Products", count: "5000+" },
                        { name: "Monitors", count: "782" },
                        { name: "Laptops", count: "220" },
                        { name: "Audio Devices", count: "150+" },
                        { name: "Cases", count: "100+" },
                        { name: "Cooling", count: "80+" },
                        { name: "Graphics Cards", count: "60+" },
                        { name: "Keyboards", count: "50+" },
                        { name: "Memory", count: "40+" },
                        { name: "Mice", count: "30+" },
                        { name: "Motherboards", count: "25+" },
                        { name: "Processors", count: "20+" },
                        { name: "Storage", count: "15+" },
                        { name: "Power Supplies", count: "10+" },
                        { name: "Cables & Adapters", count: "5+" }
                      ].map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name === "All Products" ? "All" : cat.name);
                            setOpenCategory(null);
                            setSelectedBrand(null);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between transition-all group ${
                            selectedCategory === (cat.name === "All Products" ? "All" : cat.name)
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "hover:bg-gray-800 text-gray-300 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedCategory === (cat.name === "All Products" ? "All" : cat.name) ? "bg-blue-400" : "bg-gray-500 group-hover:bg-gray-400"
                            }`}></div>
                            <span className="font-medium">{cat.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{cat.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Button - Only appears when category is selected */}
              {selectedCategory !== "All" && (
                <div className="relative">
                  <button
                    onClick={() => setOpenCategory(openCategory === "brands" ? null : "brands")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                      selectedBrand
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      selectedBrand ? "bg-white" : "bg-green-500"
                    }`}></div>
                    <span>{selectedBrand || "Select Brand"}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openCategory === "brands" ? "rotate-180" : ""}`} />
                  </button>
                  
                  {openCategory === "brands" && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 min-w-64 max-h-80 overflow-y-auto">
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-400 mb-2 px-3">BRANDS</div>
                        <button
                          onClick={() => {
                            setSelectedBrand(null);
                            setOpenCategory(null);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all ${
                            !selectedBrand
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "hover:bg-gray-800 text-gray-300 hover:text-white"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            !selectedBrand ? "bg-green-400" : "bg-gray-500"
                          }`}></div>
                          <span className="font-medium">All Brands</span>
                        </button>
                        {["HP", "Dell", "Lenovo", "ASUS", "Acer", "MSI", "Apple", "Samsung", "LG", "Sony", "Intel", "AMD", "NVIDIA", "Corsair", "Logitech", "Razer", "SteelSeries"].map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              setSelectedBrand(brand);
                              setOpenCategory(null);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all ${
                              selectedBrand === brand
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "hover:bg-gray-800 text-gray-300 hover:text-white"
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              selectedBrand === brand ? "bg-green-400" : "bg-gray-500"
                            }`}></div>
                            <span className="font-medium">{brand}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clear Filters Button */}
              {(selectedCategory !== "All" || selectedBrand) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedBrand(null);
                    setOpenCategory(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium transition-all duration-200"
                >
                  Clear Filters
                </button>
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
                    {paginatedProducts.map((p, index) => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        buynow={buynow}
                        loadingId={loadingId}
                        navigate={navigate}
                        priority={index < 8} // First 8 products load immediately
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                      >
                        Load More Products
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

const ProductCard = ({ p, buynow, loadingId, navigate, priority = false }) => {
  // Use actual image URL from product data
  const imageUrl = p.img || p.imageUrl || p.images?.[0]?.url;

  // Generate random urgency data (in production, this would come from backend)
  const viewingCount = Math.floor(Math.random() * 50) + 20;
  const boughtCount = Math.floor(Math.random() * 30) + 10;
  const leftCount = Math.floor(Math.random() * 40) + 15;

  return (
    <div
      onClick={() => navigate(`/products/${p.id}`)}
      className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow border border-gray-800 relative overflow-hidden group"
    >
      {/* Urgency Indicator */}
      <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">{viewingCount} viewing • {boughtCount} bought • {leftCount} left</span>
      </div>

      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden mt-6">
        <SmartImage
          src={imageUrl}
          alt={p.Name}
          product={p}
          priority={priority}
          className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
        />
      </div>

      <h2 className="text-lg font-semibold text-blue-400 line-clamp-2 min-h-[3.5rem]">{p.Name}</h2>
      <p className="text-blue-500 font-medium text-xl mt-2">{typeof p.price === 'number' ? p.price.toLocaleString() : 'N/A'} PKR</p>
      <p className="text-muted text-sm mt-2 line-clamp-2">{Array.isArray(p.Spec) ? p.Spec.join(", ") : ''}</p>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          buynow(p);
        }}
        disabled={loadingId === p.id}
        className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
      >
        {loadingId === p.id ? "Loading..." : "View Details"}
      </button>
    </div>
  );
};

export default Products;