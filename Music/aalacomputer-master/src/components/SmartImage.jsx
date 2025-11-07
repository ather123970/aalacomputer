import React, { useState, useEffect, useCallback } from 'react';
import { getSmartFallback } from '../utils/imageFallback';

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
  loading = 'lazy',
  priority = false, // High priority images load immediately
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src || '/placeholder.svg');
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [inView, setInView] = useState(priority); // Priority images are always "in view"

  // Reset when src changes
  useEffect(() => {
    setImageSrc(src || '/placeholder.svg');
    setIsError(false);
    setRetryCount(0);
    setIsLoading(true);
  }, [src]);

  const handleError = useCallback((e) => {
    console.log(`[SmartImage] Error loading: ${imageSrc}`);
    
    // Retry Strategy:
    // 0: Try API endpoint (if product ID available)
    // 1: Try category-based placeholder
    // 2: Show generated fallback
    
    // Try #1: API endpoint fallback (if product ID is available)
    if (retryCount === 0 && product?.id) {
      const apiUrl = `/api/product-image/${product.id}`;
      if (imageSrc !== apiUrl) {
        console.log(`[SmartImage] Retry 1: Trying API endpoint: ${apiUrl}`);
        setImageSrc(apiUrl);
        setRetryCount(1);
        return;
      }
    }
    
    // Try #2: Category-based placeholder image
    if (retryCount <= 1 && product?.category) {
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
    const fallback = getSmartFallback(product);
    console.log(`[SmartImage] Final fallback: Using generated SVG for ${product?.category || 'unknown'}`);
    setImageSrc(fallback);
    setIsError(true);
    setIsLoading(false);
  }, [imageSrc, product, retryCount]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Intersection Observer for lazy loading
  const imgRef = useCallback((node) => {
    if (node && !priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '50px' } // Start loading 50px before visible
      );
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [priority]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Skeleton loader - faster than spinner */}
      {isLoading && !isError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      )}
      {/* Only load image when in view or priority */}
      {(inView || priority) && (
        <img
          src={imageSrc}
          alt={alt || product?.name || product?.Name || 'Product image'}
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}`}
          {...props}
        />
      )}
      {!inView && !priority && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg"></div>
      )}
    </div>
  );
};

export default SmartImage;
