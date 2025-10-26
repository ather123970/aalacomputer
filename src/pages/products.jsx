import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Nav from "../nav";
import { API_BASE } from '../config'

// Helper function to get image URL
const getImageUrl = (path) => {
  if (!path) return "/images/placeholder.svg";
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const categories = ["All", "PC", "Keyboard", "Mouse", "GPU", "RAM", "SSD", "Case"];

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const filtered = allProducts.filter((p) => {
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchPrice;
    });
    setFilteredProducts(filtered);
  }, [selectedCategory, priceRange, allProducts]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
  // Fetch from backend using configured API base so env/deployments work consistently
  const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
  const url = `${base}/api/products`;
  const response = await fetch(url);
  const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedProducts = data.map(p => ({
          id: p.id,
          Name: p.title || p.name || 'Unnamed Product',
          price: typeof p.price === 'number' ? p.price : 0,
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
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
                    selectedCategory === cat
                      ? "btn-accent text-white shadow-lg shadow-blue-700/40"
                      : "bg-card text-muted hover:bg-card/90"
                  }`}
                >
                  {cat}
                </button>
              ))}

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
      <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-800">
        <img
          src={p.img || "/images/placeholder.svg"}
          alt={p.Name}
          className="object-contain w-full h-full hover:scale-110 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "/images/placeholder.svg")}
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