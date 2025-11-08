import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SmartImage from '../components/SmartImage';

// Helper to build image URLs respecting Vite base path.
function getImageUrl(path) {
  if (!path) return '/placeholder.svg';
  
  // For external URLs, return them directly
  // Fallback logic will be handled in the component
  if (/^https?:\/\//i.test(path) || /^\/\//.test(path)) {
    return path;
  }
  
  // For local paths:
  // If it starts with /images/, return as is
  if (path.startsWith('/images/')) return path;
  // If it starts with / but not /images/, prepend /images/
  if (path.startsWith('/')) return `/images${path}`;
  
  // Get Vite base path for relative paths
  const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  const normalized = path.replace(/^\/images\//, '').replace(/^\//, '');
  return `${base}/images/${normalized}`;
}

function parsePrice(price) {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const s = String(price).trim().toUpperCase();
  if (s.endsWith("K")) {
    const n = Number(s.replace("K", "").replace(/[^0-9.]/g, "")) || 0;
    return Math.round(n * 1000);
  }
  const num = Number(s.replace(/[^0-9.]/g, "")) || 0;
  return num;
}

export default function Product() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [tryingProxy, setTryingProxy] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Try to get products from state first (when navigating from products page)
        const stateProduct = location.state?.product;
        if (stateProduct) {
          setProducts([stateProduct]);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const response = await fetch('/api/products?limit=50'); // Load first 50 products
        if (response.ok) {
          const data = await response.json();
          const formattedProducts = Array.isArray(data) ? data.map(p => {
            const productId = p._id || p.id;
            return {
              id: productId,
              Name: p.title || p.name || p.Name || 'Product',
              price: p.price || 0,
              img: productId ? `/api/product-image/${productId}` : '/placeholder.svg',
              Spec: p.Spec || p.specs || p.description || [],
              type: p.type || 'Product',
              category: p.category || 'Other'
            };
          }) : [];
          
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // No fallback data - only show real products from backend
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.state]);

  useEffect(() => {
    try {
      if (products.length > 0) {
        localStorage.setItem("products", JSON.stringify(products));
      }
    } catch (e) {
      console.warn("Failed to cache products", e);
    }
  }, [products]);

  const goToDetail = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/products/${product.id}`, { state: { product } });
      setLoadingId(null);
    }, 120);
  };

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 relative bg-panel min-h-screen text-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 relative bg-panel min-h-screen text-primary">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Products - PreBuild
      </h1>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex space-x-5 overflow-x-auto py-4 px-2 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-none w-[85vw] sm:w-[380px] md:w-[420px] h-auto rounded-2xl p-4 bg-card/10 border border-blue-600/10 text-primary transform hover:-translate-y-1 transition-all duration-300 snap-start cursor-pointer"
            onClick={() => goToDetail(p)}
          >
            <div className="relative h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center p-2">
              <SmartImage
                src={p.img}
                alt={p.Name}
                product={p}
                className="max-h-full max-w-full object-contain"
              />
              {loadingId === p.id && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">{p.Name}</h2>
            <p className="text-2xl font-bold text-blue-500 mb-3">
              Rs. {parsePrice(p.price).toLocaleString()}
            </p>
            <div className="space-y-2">
              {Array.isArray(p.Spec) ? (
                p.Spec.map((spec, idx) => (
                  <p key={idx} className="text-sm text-muted flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>{spec}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted">{p.Spec}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToDetail(p);
              }}
              disabled={loadingId === p.id}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingId === p.id ? "Loading..." : "View Details"}
            </button>
          </div>
        ))}
      </div>

      {/* Scroll to End Button */}
      <button
        onClick={scrollToEnd}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
