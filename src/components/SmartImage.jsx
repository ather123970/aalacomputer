import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSmartFallback } from '../utils/imageFallback';

// Simple in-memory cache for image loading status
const imageCache = new Map();

/**
 * SmartImage Component
 * Automatically handles image loading errors with intelligent fallbacks
 * based on product category and brand
 */
const SmartImage = ({ 
  src, 
  alt, 
  product, 
  className = '', 
  fallback = '/placeholder.svg', 
  loading = 'lazy',
  priority = false,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Generate a cache key based on product ID or image URL
  const cacheKey = useMemo(() => {
    if (product?.id) return `product-${product.id}`;
    if (product?._id) return `product-${product._id}`;
    return `img-${src}`;
  }, [src, product]);
  
  // Handle image loading with retry logic
  const loadImage = useCallback((url, isRetry = false, useProxy = false) => {
    // Validate URL
    if (!url || url === 'undefined' || url === 'null' || url === '' || url === ' ') {
      const smartFallback = getSmartFallback(product);
      setImageSrc(smartFallback);
      setLoadingState(false);
      return;
    }

    // If it's a relative path, ensure it starts with /
    let imageUrl = url;
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      imageUrl = `/${url}`;
    }
    
    // In production, convert local paths to absolute URLs
    // This is needed because the frontend is static and can't access backend paths directly
    const isProduction = import.meta.env.PROD;
    if (isProduction && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      // Get the current origin (e.g., https://aalacomputer.onrender.com)
      const baseUrl = window.location.origin;
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // If proxy is requested for external images, use it
    if (useProxy && (url.startsWith('http://') || url.startsWith('https://'))) {
      const baseUrl = isProduction ? window.location.origin : '';
      imageUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    // Check cache first for successful loads
    const cachedUrl = imageCache.get(cacheKey);
    if (cachedUrl && cachedUrl !== url) {
      setImageSrc(cachedUrl);
      setLoadingState(false);
      setError(false);
      return;
    }

    // Try to load the image
    const img = new Image();
    
    // Set timeout for slow-loading images
    const timeout = setTimeout(() => {
      console.warn(`[SmartImage] Image load timeout for ${imageUrl}`);
      img.src = ''; // Cancel loading
      
      // Try fallback
      if (!isRetry) {
        const smartFallback = getSmartFallback(product);
        setImageSrc(smartFallback);
        setLoadingState(false);
        setError(true);
      }
    }, 5000); // 5 second timeout (faster failover)
    
    img.onload = () => {
      clearTimeout(timeout);
      // Cache the successful URL
      imageCache.set(cacheKey, imageUrl);
      setImageSrc(imageUrl);
      setLoadingState(false);
      setError(false);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      
      // For external images, try proxy if not already using it
      if (!useProxy && !isRetry && (url.startsWith('http://') || url.startsWith('https://'))) {
        console.log(`[SmartImage] External image failed, trying proxy: ${url}`);
        loadImage(url, true, true);
        return;
      }
      
      // For local images that failed, try different paths
      if (!isRetry && !url.startsWith('http')) {
        console.log(`[SmartImage] Local image failed, trying alternative: ${url}`);
        // Try with /images/ prefix if not already there
        if (!url.includes('/images/')) {
          const fileName = url.split('/').pop();
          const altPath = `/images/${fileName}`;
          loadImage(altPath, true);
          return;
        }
      }
      
      // All attempts failed - use smart fallback
      const smartFallback = getSmartFallback(product);
      console.log(`[SmartImage] All attempts failed, using smart fallback`);
      setImageSrc(smartFallback);
      setLoadingState(false);
      setError(true);
    };
    
    img.src = imageUrl;
  }, [fallback, cacheKey, product]);
  
  // Load image when component mounts or src changes
  useEffect(() => {
    if (src) {
      loadImage(src);
    } else {
      setImageSrc(fallback);
      setLoadingState(false);
    }
    
    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [src, fallback, loadImage]);

  // Handle image error
  const handleError = useCallback((e) => {
    if (!imageSrc || imageSrc === fallback) return;
    
    // If we've already retried too many times, give up
    if (retryCount >= 2) {
      setError(true);
      setLoadingState(false);
      return;
    }
    
    setRetryCount(prev => prev + 1);
    
    // If this was a direct URL, try with proxy
    if ((imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) && 
        !imageSrc.includes('/api/proxy-image')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
      loadImage(proxyUrl, true);
      return;
    }
    
      // For internal images, try API endpoint if product ID available
    if (product?.id && !imageSrc.includes('/api/product-image/')) {
      const apiUrl = `/api/product-image/${product.id}`;
      loadImage(apiUrl, true);
      return;
    }
    
    // Try category-based placeholder image
    if (product?.category) {
      const category = product.category.toLowerCase();
      const categoryPlaceholders = {
        'monitor': '/fallback/monitor.svg',
        'display': '/fallback/monitor.svg',
        'gpu': '/fallback/gpu.svg',
        'graphics card': '/fallback/gpu.svg',
        'graphics': '/fallback/gpu.svg',
        'cpu': '/fallback/cpu.svg',
        'processor': '/fallback/cpu.svg',
        'motherboard': '/fallback/motherboard.svg',
        'mobo': '/fallback/motherboard.svg',
        'ram': '/fallback/ram.svg',
        'memory': '/fallback/ram.svg',
        'storage': '/fallback/storage.svg',
        'ssd': '/fallback/storage.svg',
        'hdd': '/fallback/storage.svg',
        'nvme': '/fallback/storage.svg',
        'mouse': '/fallback/mouse.svg',
        'keyboard': '/fallback/keyboard.svg',
        'headset': '/fallback/headset.svg',
        'headphone': '/fallback/headset.svg',
        'case': '/fallback/pc.svg',
        'casing': '/fallback/pc.svg',
        'pc case': '/fallback/pc.svg',
        'cabinet': '/fallback/pc.svg',
        'tower': '/fallback/pc.svg',
        'psu': '/fallback/pc.svg',
        'power supply': '/fallback/pc.svg',
        'cooling': '/fallback/pc.svg',
        'cooler': '/fallback/pc.svg',
        'fan': '/fallback/pc.svg',
        'prebuild': '/fallback/pc.svg',
        'prebuild pc': '/fallback/pc.svg',
        'prebuilt': '/fallback/pc.svg',
        'desktop': '/fallback/pc.svg',
        'pc': '/fallback/pc.svg',
        'laptop': '/fallback/pc.svg',
      };
      
      // Try to find a matching category placeholder
      // First try exact match
      let placeholder = categoryPlaceholders[category];
      
      // If no exact match, try partial match (category contains keyword or keyword contains category)
      if (!placeholder) {
        const match = Object.entries(categoryPlaceholders).find(([key]) => 
          category.includes(key) || key.includes(category)
        );
        placeholder = match?.[1];
      }
      
      // Also check product name for additional clues
      if (!placeholder && product?.name) {
        const productName = (product.name || '').toLowerCase();
        const nameMatch = Object.entries(categoryPlaceholders).find(([key]) => 
          productName.includes(key)
        );
        placeholder = nameMatch?.[1];
      }
      
      if (placeholder && imageSrc !== placeholder) {
        console.log(`[SmartImage] Retry 2: Trying category placeholder for ${category}`);
        setImageSrc(placeholder);
        setRetryCount(2);
        return;
      }
    }
    
    // Final fallback: Generate smart SVG fallback
    const smartFallback = getSmartFallback(product);
    console.log(`[SmartImage] Final fallback: Using generated SVG for ${product?.category || 'unknown'}`);
    setImageSrc(smartFallback);
    setError(true);
    setLoadingState(false);
  }, [imageSrc, product, retryCount, src, fallback, loadImage]);

  const handleLoad = useCallback(() => {
    setLoadingState(false);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton loader - shows while image is loading */}
      {loadingState && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt || product?.name || product?.title || 'Product image'}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loadingState ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={() => setLoadingState(false)}
        loading={loading}
        {...props}
      />
      
      {/* Loading spinner - shows if image takes too long to load */}
      {loadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SmartImage;
