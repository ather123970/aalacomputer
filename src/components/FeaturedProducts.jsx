import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimpleImage from './SimpleImage';
import { getImageFromProduct } from '../utils/simpleImageLoader';
import { API_CONFIG } from '../config/api';

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

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define premium product categories to feature - ONE from each
  const premiumCategories = [
    { name: 'Processors', keywords: ['cpu', 'processor', 'intel', 'amd', 'core', 'ryzen'], count: 1 },
    { name: 'Graphics Cards', keywords: ['gpu', 'graphics', 'rtx', 'gtx', 'radeon'], count: 1 },
    { name: 'Keyboards', keywords: ['keyboard'], count: 1 },
    { name: 'Headsets', keywords: ['headset', 'headphone'], count: 1 },
    { name: 'Laptops', keywords: ['laptop', 'notebook'], count: 1 },
    { name: 'Monitors', keywords: ['monitor', 'display'], count: 1 },
    { name: 'RAM', keywords: ['ram', 'memory', 'ddr'], count: 1 },
    { name: 'Storage', keywords: ['ssd', 'hdd', 'storage', 'nvme'], count: 1 }
  ];

  // Fetch premium products from different categories
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL ? API_CONFIG.BASE_URL.replace(/\/+$/, '') : '';
        const response = await fetch(`${base}/api/products?limit=10000`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Handle different response formats
          let allProducts = [];
          if (Array.isArray(data)) {
            allProducts = data;
          } else if (data.products) {
            allProducts = data.products;
          } else if (data.data) {
            allProducts = data.data;
          }
          
          // Define the 8 specific products to feature
          const targetProducts = [
            'AMD Ryzen 5 3600 Desktop Processor',
            'AULA F75 Gasket Structure, Fully Hot-Swappable Keys, 75% Layout Gray Wood Switch Mechanical Keyboard Gradient Gray',
            'G.SKILL Trident Z5 Royal Series 32GB (2 x 16GB) 288-Pin PC RAM DDR5 6400 (PC5 51200) Desktop Memory Silver',
            'HyperX Cloud Gaming Headset – PS4 – Box Open',
            'MSI MAG CoreLiquid A13 360mm ARGB AIO Liquid CPU Cooler White',
            'MSI MAG PANO M100R PZ Premium Mid-Tower Gaming PC Case – White',
            'MSI Clutch GM11 Gaming Mouse White',
            'Samsung 27″ LC27RG50FQMXUE CRG50 240Hz Curved Gaming Monitor'
          ];
          
          // Find and map the target products
          const featuredProducts = targetProducts
            .map(targetName => {
              const found = allProducts.find(p => {
                const productName = (p.name || p.title || p.Name || '').toLowerCase();
                return productName.includes(targetName.toLowerCase().substring(0, 20));
              });
              
              if (found) {
                return {
                  id: found._id || found.id,
                  Name: found.name || found.title || found.Name || targetName,
                  name: found.name || found.title || found.Name || targetName,
                  price: parsePrice(found.price),
                  img: getImageFromProduct(found) || '/placeholder.svg',
                  imageUrl: getImageFromProduct(found) || '/placeholder.svg',
                  category: found.category || 'Premium',
                  brand: found.brand || 'Premium Brand',
                  description: found.description || targetName,
                  ...found
                };
              }
              return null;
            })
            .filter(p => p !== null);
          
          console.log(`[FeaturedProducts] Loaded ${featuredProducts.length} featured products`);
          setProducts(featuredProducts);
        } else {
          console.warn('[FeaturedProducts] API returned non-OK response');
          setProducts([]);
        }
      } catch (error) {
        console.error('[FeaturedProducts] Failed to fetch:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const goToDetail = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/product/${product.id}`, { state: { product } });
      setLoadingId(null);
    }, 120);
  };


  if (loading) {
    return (
      <div className="w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Premium Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Premium Products</h2>
          <p className="text-gray-600">No premium products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Premium Products</h2>
          <p className="text-gray-600 mt-2">Handpicked premium components from top categories</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => goToDetail(product)}
            >
              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {product.category}
                </span>
              </div>

              {/* Premium Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              </div>

              {/* Image */}
              <div className="relative aspect-square bg-gray-100 group-hover:bg-blue-50 transition-colors">
                <SimpleImage
                  src={product.img || product.imageUrl}
                  alt={product.Name}
                  product={product}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.Name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.brand}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {product.category}
                  </span>
                </div>

                <p className="text-gray-600 text-xs mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-gray-900">
                    Rs. {Number(product.price || 0).toLocaleString()}
                  </div>
                  
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      loadingId === product.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetail(product);
                    }}
                    disabled={loadingId === product.id}
                  >
                    {loadingId === product.id ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Loading</span>
                      </div>
                    ) : (
                      'View'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Premium Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
