import React, { useMemo } from 'react';
import { colors, shadows, typography, spacing } from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import SimpleImage from './SimpleImage';
import { getImageFromProduct } from '../utils/simpleImageLoader';
import { useProductContext } from '../context/ProductContext';
import WireLoadingAnimation from './WireLoadingAnimation';

export const ProductCard = ({ product, onClick, priority = false }) => {
  const { getUpdatedProduct } = useProductContext();
  
  // Check if product was updated globally
  const updatedProductData = useMemo(() => {
    return getUpdatedProduct(product._id || product.id);
  }, [getUpdatedProduct, product._id, product.id]);
  
  // Use updated data if available, otherwise use original
  const displayProduct = useMemo(() => {
    return updatedProductData || product;
  }, [updatedProductData, product]);

  const amount = typeof displayProduct?.price === 'number' ? displayProduct.price : (displayProduct?.price?.amount ?? 0);
  const marketPrice = typeof displayProduct?.price === 'number' ? displayProduct.price : (displayProduct?.price?.marketPrice ?? amount);
  const discount = typeof displayProduct?.price === 'number' ? 0 : (displayProduct?.price?.discount ?? 0);
  const stockStatus = displayProduct?.stock?.status || 'in_stock';
  
  // Get image URL from product - checks ALL possible image fields
  const initialSrc = getImageFromProduct(displayProduct) || '/placeholder.svg';
  
  // Generate urgency data (would come from backend in production)
  const viewingCount = React.useMemo(() => Math.floor(Math.random() * 50) + 20, [product?.id]);
  const boughtCount = React.useMemo(() => Math.floor(Math.random() * 30) + 10, [product?.id]);
  const leftCount = React.useMemo(() => Math.floor(Math.random() * 40) + 15, [product?.id]);
  
  // Varied urgency UI styles based on dynamic product stats
  const getUrgencyStyle = () => {
    const urgencyMessages = [
      { bg: 'from-red-500 to-orange-500', text: `🔥 ${viewingCount} viewing • ${boughtCount} bought • ${leftCount} left` },
      { bg: 'from-orange-500 to-red-500', text: `🔥 Trending • ${boughtCount} bought today` },
      { bg: 'from-red-500 to-pink-500', text: `🔥 Hot Sale • Only ${leftCount} left!` },
      { bg: 'from-red-600 to-orange-600', text: `🔥 ${viewingCount} viewing • Low Stock!` },
      { bg: 'from-orange-600 to-red-600', text: `🔥 Most Sold • ${boughtCount} bought` }
    ];
    
    // Select urgency message based on product ID hash
    const productId = product?.id || product?._id || '';
    const hash = productId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return urgencyMessages[hash % urgencyMessages.length];
  };
  
  const urgencyStyle = getUrgencyStyle();
  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 transition-transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Urgency Badge with Fire Animation */}
      <div className={`absolute top-2 left-2 bg-gradient-to-r ${urgencyStyle.bg} backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 z-10 shadow-lg animate-pulse`}>
        <span className="font-semibold">{urgencyStyle.text}</span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <SimpleImage
          src={initialSrc}
          alt={product?.name || product?.title || 'Product image'}
          product={product}
          className="object-contain w-full h-full transition-transform hover:scale-105 bg-white p-2"
        />
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-primary-600 font-semibold mb-1">{displayProduct?.brand || ''}</div>
        <h3 className="product-name text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{displayProduct?.name || displayProduct?.Name || 'Unnamed Product'}</h3>
        
        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(star => {
            // Generate random rating between 3-5 stars for each product
            const rating = React.useMemo(() => Math.floor(Math.random() * 3) + 3, [product?.id]);
            return (
              <span key={star} className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ⭐
              </span>
            );
          })}
          <span className="text-gray-500 text-xs ml-1">(4.{Math.floor(Math.random() * 9) + 1})</span>
        </div>
        
        {/* Enhanced Urgency Indicators */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
            👁️ {viewingCount} viewing
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            🛒 {boughtCount} bought
          </span>
        </div>
        
        <div className="text-xs text-orange-600 font-medium mb-3">
          ⚡ Only {leftCount} left in stock!
        </div>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 line-through">{marketPrice > amount ? `PKR ${marketPrice.toLocaleString()}` : ''}</p>
              <p className="text-xl font-bold text-primary-600">PKR {(typeof displayProduct?.price === 'number' ? displayProduct.price : amount).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className={`text-sm font-medium ${
          stockStatus === 'in_stock' ? 'text-success' :
          stockStatus === 'low_stock' ? 'text-warning' :
          'text-error'
        }`}>
          {stockStatus === 'in_stock' ? 'In Stock' :
           stockStatus === 'low_stock' ? 'Low Stock' :
           'Out of Stock'}
        </div>

        <div className="mt-4">
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart directly
              const cartItem = {
                id: product?.id || product?._id,
                name: product?.name || product?.title,
                price: Number(product?.price || 0),
                img: product?.img || product?.imageUrl || '/placeholder.svg',
                spec: product?.description || '',
                qty: 1
              };
              
              // Use the global addToCart function if available
              if (window.addToCart) {
                window.addToCart(cartItem);
              } else {
                // Fallback: directly update localStorage
                try {
                  const raw = localStorage.getItem("aala_cart");
                  const arr = raw ? JSON.parse(raw) : [];
                  const idx = arr.findIndex((i) => i.id === cartItem.id);
                  if (idx === -1) arr.push(cartItem);
                  else arr[idx] = { ...arr[idx], qty: (arr[idx].qty || 1) + 1 };
                  localStorage.setItem("aala_cart", JSON.stringify(arr));
                } catch (e) {
                  console.error('Cart update error:', e);
                }
              }
              
              // Navigate to cart
              if (window.location.pathname !== '/cart') {
                window.location.href = '/cart';
              }
            }}
          >
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
};

export const ProductGrid = ({ products }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onClick={() => navigate(`/products/${product._id || product.id}`)}
          priority={index < 8}
        />
      ))}
    </div>
  );
};

export const PremiumButton = ({ children, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
    secondary: "bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8 w-full">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const PageHeader = ({ title, description }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h1>
    {description && (
      <p className="text-lg text-neutral-600">{description}</p>
    )}
  </div>
);

export const SectionContainer = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const CategoryPill = ({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
      isSelected
        ? 'bg-primary-600 text-white'
        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
    }`}
  >
    {category}
  </button>
);

export const PriceTag = ({ amount, marketPrice, discount }) => (
  <div className="flex flex-col">
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-neutral-900">
        Rs. {Number(amount || 0).toLocaleString()}
      </span>
      {Number(discount || 0) > 0 && (
        <span className="text-sm text-neutral-500 line-through">
          Rs. {Number(marketPrice || 0).toLocaleString()}
        </span>
      )}
    </div>
    {Number(discount || 0) > 0 && (
      <span className="text-accent-600 text-sm font-medium">
        Save {discount}%
      </span>
    )}
  </div>
);