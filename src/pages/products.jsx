import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Nav from "../nav";
import { API_BASE } from '../config'
import { ChevronDown } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const categories = ["All", "PC", "Keyboard", "Mouse", "GPU", "RAM", "SSD", "Case"];

const brandOptionsByCategory = {
  GPU: ["NVIDIA", "ASUS", "MSI", "Gigabyte", "ZOTAC", "PNY"],
  RAM: ["Corsair", "Kingston", "G.Skill", "ADATA", "Crucial"],
  SSD: ["Samsung", "WD (Western Digital)", "Seagate", "Kingston"],
  Case: ["Cougar", "Cooler Master", "Thermaltake", "NZXT"],
  PC: [],
  Keyboard: [],
  Mouse: [],
  All: [],
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Fetch products from backend on component mount
  useEffect(() => {
    loadProducts();

    // Listen for product updates from admin (same-tab) and storage events (cross-tab)
    const onProductsUpdated = () => {
      loadProducts();
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
  }, []);

  // Filter products when category or price changes
  useEffect(() => {
    const norm = (s) => (s || "").toString().trim().toLowerCase();
    const aliasMap = {
      gpu: ["gpu", "graphics card", "graphic card", "graphics", "vga"],
      ram: ["ram", "memory", "ddr", "ddr4", "ddr5"],
      ssd: ["ssd", "nvme", "m2", "m.2"],
      case: ["case", "casing", "pc case", "chassis"],
      keyboard: ["keyboard", "key board"],
      mouse: ["mouse", "mice", "pointer"],
      pc: ["pc", "computer", "desktop", "pre-built", "prebuilt", "system"],
      all: ["all"]
    };
    const canon = (s) => {
      const v = norm(s);
      const direct = norm(s);
      const catSet = categories.map((c) => norm(c));
      if (catSet.includes(direct)) return direct;
      for (const key in aliasMap) {
        if (aliasMap[key].includes(v)) return key;
      }
      return v;
    };

    // First filter by category and price (robust, case-insensitive)
    const base = allProducts.filter((p) => {
      const matchCategory = selectedCategory === "All" || canon(p.category) === canon(selectedCategory);
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchPrice;
    });

    // Then apply brand match (lenient). If nothing matches brand, fall back to base.
    if (selectedBrand) {
      const brand = norm(selectedBrand);
      const brandFiltered = base.filter((p) => {
        const nameStr = norm(p.Name);
        const specStr = Array.isArray(p.Spec) ? norm(p.Spec.join(" ")) : "";
        return nameStr.includes(brand) || specStr.includes(brand);
      });
      setFilteredProducts(brandFiltered.length > 0 ? brandFiltered : base);
    } else {
      setFilteredProducts(base);
    }
  }, [selectedCategory, priceRange, allProducts, selectedBrand]);

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

  // Reset selected brand when category changes
  useEffect(() => {
    setSelectedBrand(null);
  }, [selectedCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
  const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
  const endpoints = [`${base}/api/v1/products`, `${base}/api/products`];
  let data = [];
  for (const url of endpoints) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const json = await resp.json();
        if (Array.isArray(json)) {
          data = json;
          break;
        }
        if (json && Array.isArray(json.products)) {
          data = json.products;
          break;
        }
      }
    } catch (_) {
    }
  }
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedProducts = data.map(p => ({
          id: p._id || p.id,
          Name: p.title || p.name || 'Unnamed Product',
          price: (typeof p.price === 'number' ? p.price : Number(p.price)) || 0,
          img: getImageUrl(p.imageUrl || p.img),
          Spec: Array.isArray(p.specs) ? p.specs : (p.description ? [p.description] : []),
          category: p.category || 'Other'
        }));
        setAllProducts(formattedProducts);
        try {
          localStorage.setItem("products", JSON.stringify(formattedProducts));
        } catch (e) {
          console.warn("Failed to cache products", e);
        }
      } else {
        // Fallback to sample data if backend returns empty
        const productList = [
        ];
        setAllProducts(productList);
      }
    } catch (error) {
      console.error('Failed to load products from backend:', error);
      // Use fallback data
      const productList = [
      ];
      setAllProducts(productList);
    } finally {
      setIsLoading(false);
    }
  };

  const buynow = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/products/${product.id}`);
    }, 150);
  };

  return (
    <>
      <Nav />
      <div className="p-6 md:px-20 bg-panel min-h-[calc(100vh-72px)] text-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-500">Explore Our Products</h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Filters and Products Section */}
        {!isLoading && (
          <>
            <div className="flex flex-wrap gap-3 mb-8 items-center justify-center md:justify-start">
              {categories.map((cat) => (
                <div key={cat} className="relative">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setOpenCategory((prev) => (prev === cat ? null : cat));
                    }}
                    onTouchEnd={() => {
                      setSelectedCategory(cat);
                      setOpenCategory((prev) => (prev === cat ? null : cat));
                    }}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === cat
                        ? "btn-accent text-white shadow-lg shadow-blue-700/40"
                        : "bg-card text-muted hover:bg-card/90"
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openCategory === cat ? "rotate-180" : "rotate-0"}`}
                    />
                  </button>

                  {openCategory === cat && (brandOptionsByCategory[cat] || []).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 mt-2 w-48 bg-card border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
                    >
                      <ul className="py-1">
                        {brandOptionsByCategory[cat].map((brand) => (
                          <li key={brand}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBrand(brand);
                                setOpenCategory(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              {brand}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              ))}

              {selectedBrand && (
                <div className="flex items-center gap-2 bg-card border border-gray-700 px-3 py-1 rounded-full text-sm">
                  <span>Brand: <span className="font-semibold">{selectedBrand}</span></span>
                  <button
                    type="button"
                    onClick={() => setSelectedBrand(null)}
                    className="text-muted hover:text-white"
                    aria-label="Clear selected brand"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2 bg-card p-2 rounded-lg">
                <span className="text-muted text-sm">Price:</span>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                  className="w-20 p-1 bg-card rounded text-primary border border-gray-700"
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 500000)])}
                  className="w-20 p-1 bg-card rounded text-primary border border-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p, idx) => (
                <AnimatedProductCard key={p.id} p={p} buynow={buynow} loadingId={loadingId} navigate={navigate} delay={idx * 0.1} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 mt-10 text-lg">
                No products found in this range or category.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Single Product Card — Animated with Intersection Observer
const AnimatedProductCard = ({ p, buynow, loadingId, navigate, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, scale: 1 });
    } else {
      controls.start({ opacity: 0, y: 50, scale: 0.95 });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={controls}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={() => navigate(`/products/${p.id}`)}
      className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-800"
    >
      <div className="relative h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center p-2">
        <img
          src={p.img || "/placeholder.svg"}
          alt={p.Name}
          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      </div>

      <h2 className="text-lg font-semibold text-blue-400">{p.Name}</h2>
      <p className="text-blue-500 font-medium">{p.price.toLocaleString()} PKR</p>
      <p className="text-muted text-sm mt-2">{p.Spec.join(", ")}</p>
      
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
    </motion.div>
  );
};

export default Products;