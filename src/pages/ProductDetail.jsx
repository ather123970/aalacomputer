import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion as FM } from "framer-motion";
import Nav from "../nav";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { API_BASE } from '../config'
const API_URL = API_BASE.replace(/\/+$/, '') + '/api/v1/cart';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    const tryLoad = async () => {
      setNotFound(false);
      try {
        // 1) check location.state (navigate with state)
        if (location?.state?.product) {
          if (!alive) return;
          setProduct(location.state.product);
          return;
        }

        // 2) Fetch from API with appropriate headers
        const base = (typeof API_BASE === 'string' ? API_BASE.replace(/\/+$/, '') : window.location.origin).replace(/\/+$/, '');
        console.log('[DEBUG] Fetching product from database, id:', id);
        
        // Only try official API endpoints with auth
        const endpoints = [
          `${base}/api/products/${id}`,
          `${base}/api/prebuilds/${id}`,
          `${base}/api/v1/products/${id}`,
        ];

        for (const url of endpoints) {
          try {
            console.log('[DEBUG] Trying endpoint:', url);
            const res = await fetch(url, {
              credentials: 'include',
              headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (!res.ok) {
              console.log('[DEBUG] Failed from', url, 'with status:', res.status);
              continue;
            }

            const data = await res.json();
            const src = data.product || data;
            if (src) {
              const formatted = {
                id: src._id || src.id || id,
                _id: src._id || src.id || id,
                Name: src.title || src.name || src.Name || 'Unnamed Product',
                price: typeof src.price === 'number' ? src.price : parsePrice(src.price || src.cost || 0),
                img: src.imageUrl || src.img || src.image || src.photo || '',
                Spec: Array.isArray(src.specs) ? src.specs : (src.Spec || (src.description ? [src.description] : [])),
                category: src.category || src.type || 'PC',
                description: src.description || src.longDescription || ''
              };
              if (!alive) return;
              console.log('[DEBUG] Found and formatted product:', formatted);
              setProduct(formatted);
              return;
            }
          } catch (e) {
            console.warn('[DEBUG] Error fetching from', url, ':', e.message);
          }
        }

        if (!alive) return;
        setNotFound(true);
      } catch (e) {
        console.warn("Failed to load product", e);
        if (alive) setNotFound(true);
      }
    };

    tryLoad();

    return () => { alive = false; };
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const payload = {
        id: (product._id || product.id).toString(),
        name: product.Name,
        price: parsePrice(product.price),
        img: product.img,
        specs: product.Spec,
        type: product.type || "Pre-Build",
        qty: 1,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server returned ${res.status}`
        try { const j = await res.json(); if (j && (j.error || j.message)) errMsg = j.error || j.message } catch(e){}
        throw new Error(errMsg)
      }
      await res.json();

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <>
        <Nav />
        <div className="min-h-screen bg-panel text-primary flex items-center justify-center">
          {notFound ? <p>Product not found</p> : <p>Loading product...</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-panel text-primary px-4 py-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-primary mb-6"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <FM.div
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 sm:p-10 rounded-2xl border border-gray-800 shadow-lg"
          >
            {/* Image Section */}
            <div className="flex items-center justify-center bg-card rounded-xl p-6 sm:p-8">
              <img
                src={product.img || "/images/placeholder.svg"}
                alt={product.Name}
                className="max-h-80 sm:max-h-[400px] w-full object-contain rounded-lg transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {product.Name}
                  </h1>
                </div>
                <p className="text-2xl font-semibold text-blue-400 mb-4">
                  PKR {parsePrice(product.price).toLocaleString()}
                </p>

                <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                <ul className="space-y-2 text-muted mb-8">
                  {product.Spec?.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 text-blue-400">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addToCart}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl btn-accent text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {loading ? "Adding..." : "Add to Cart"}
                </button>

                {/* AI Ask button removed */}
              </div>
            </div>
          </FM.div>

          <div className="mt-12 border-t border-gray-800 pt-6">
            <h2 className="text-2xl font-bold mb-3">Product Details</h2>
            <p className="text-gray-400">
              {product.description ||
                `Experience premium performance with the ${product.Name}. Built for reliability and power.`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
