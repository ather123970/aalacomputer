import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Nav from "../nav";
import { API_BASE } from '../config'

// Helper function to get image URL
const getImageUrl = (path) => {
  if (path.startsWith('http')) return path;
  return path;
};

// Sample product data
const productList = [
  { id: 1, Name: "Gaming Beast", price: 150000, img: getImageUrl('/images/pcmain.png'), Spec: ["RTX 4080", "32GB RAM", "1TB SSD"], category: "PC" },
  { id: 2, Name: "Mechanical Pro", price: 15000, img: getImageUrl('/images/keyboard.png'), Spec: ["RGB", "Mechanical", "Wireless"], category: "Keyboard" },
  { id: 3, Name: "Precision Mouse", price: 8000, img: getImageUrl('/images/mouse.png'), Spec: ["16000 DPI", "RGB", "Wireless"], category: "Mouse" },
  { id: 4, Name: "RTX 4080", price: 120000, img: getImageUrl('/images/gpu.png'), Spec: ["16GB VRAM", "Ray Tracing", "DLSS"], category: "GPU" },
  { id: 5, Name: "DDR5 Pro", price: 25000, img: getImageUrl('/images/rgbram.png'), Spec: ["32GB", "DDR5", "RGB"], category: "RAM" },
  { id: 6, Name: "NVMe SSD", price: 18000, img: getImageUrl('/images/ssd.png'), Spec: ["1TB", "NVMe", "3500MB/s"], category: "SSD" },
  { id: 7, Name: "RGB Case", price: 12000, img: getImageUrl('/images/rgb.png'), Spec: ["ATX", "RGB Fans", "Tempered Glass"], category: "Case" },
  { id: 8, Name: "ThunderStorm", price: 32000, img: getImageUrl('/images/luxeries.png'), Spec: ["ATX", "Tempered Glass"], category: "Case" },
];

const categories = ["All", "PC", "Keyboard", "Mouse", "GPU", "RAM", "SSD", "Case"];

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filteredProducts, setFilteredProducts] = useState(productList);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(productList));
    } catch (e) {
      console.warn("Failed to cache products", e);
    }

    const filtered = productList.filter((p) => {
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCategory && matchPrice;
    });
    setFilteredProducts(filtered);
  }, [selectedCategory, priceRange]);

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

        {/* Filters */}
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

        {/* Product Grid */}
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