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
  const [imageSrc, setImageSrc] = useState(fallback || '/placeholder.svg');
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
    // Validate URL - reject empty, null, undefined, and literal "empty" string
    if (!url || url === 'undefined' || url === 'null' || url === '' || url === ' ' || url === 'empty' || url.toLowerCase() === 'empty') {
      const smartFallback = getSmartFallback(product);
      setImageSrc(smartFallback);
      setLoadingState(false);
      return;
    }

    console.log(`[SmartImage] Loading image: ${url.substring(0, 80)}...`);
    
    // Use URL directly from database - no processing, no proxy
    let imageUrl = url;
    
    // Add cache-busting for non-cached requests to allow updates (but NOT for base64 or data URLs)
    if (!imageUrl.includes('?') && !imageUrl.startsWith('data:')) {
      imageUrl = `${imageUrl}?t=${Date.now()}`;
    }

    // DISABLED: Don't use cache for images - always fetch fresh
    // This ensures updated product images show immediately
    // Cache-busting is handled via URL parameters instead
    imageCache.delete(cacheKey);

    // Try to load the image
    const img = new Image();
    
    // Set timeout for slow-loading images  
    // Database images timeout after 10 seconds
    const timeoutDuration = 10000; // 10s timeout for all images
    
    const timeout = setTimeout(() => {
      console.warn(`[SmartImage] ⏱️ Image load timeout after ${timeoutDuration}ms for ${imageUrl.substring(0, 80)}...`);
      img.src = ''; // Cancel loading
      
      // Show fallback immediately instead of trying more retries
      // This prevents the long wait times users are experiencing
      const smartFallback = getSmartFallback(product);
      setImageSrc(smartFallback);
      setLoadingState(false);
      setError(true);
    }, timeoutDuration);
    
    img.onload = () => {
      clearTimeout(timeout);
      // DISABLED: Don't cache - always fetch fresh for updated images
      // imageCache.set(cacheKey, {
      //   originalUrl: url,
      //   processedUrl: imageUrl
      // });
      setImageSrc(imageUrl);
      setLoadingState(false);
      setError(false);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.log(`[SmartImage] ❌ Image failed to load from database: ${imageUrl}`);
      
      // Image from database failed to load - use smart fallback
      const smartFallback = getSmartFallback(product);
      console.log(`[SmartImage] Using category fallback for: ${product?.category || 'unknown'}`);
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
    
    // Reset error state when src changes
    setError(false);
  }, [src, loadImage, fallback]);

  // Listen for cache clearing events from admin updates
  useEffect(() => {
    const handleClearCache = (event) => {
      console.log('[SmartImage] Cache clear event received, clearing image cache');
      // Clear the in-memory cache
      imageCache.clear();
      // Force reload of this image
      if (src) {
        setRetryCount(0);
        loadImage(src);
      }
    };
    
    window.addEventListener('clear-image-cache', handleClearCache);
    return () => window.removeEventListener('clear-image-cache', handleClearCache);
  }, [src, loadImage]);

  // Handle image error - use fallback immediately
  const handleError = useCallback((e) => {
    if (!imageSrc || imageSrc === fallback) return;
    
    // Image failed - use smart fallback immediately
    const smartFallback = getSmartFallback(product);
    console.log(`[SmartImage] Image failed, using fallback for: ${product?.category || 'unknown'}`);
    setImageSrc(smartFallback);
    setError(true);
    setLoadingState(false);
  }, [imageSrc, product, fallback]);

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
