import React, { useState, useCallback } from 'react';
import { getFallbackImage } from '../utils/simpleImageLoader';

/**
 * SimpleImage Component
 * Loads ANY image URL directly without complex logic
 * Supports: HTTP/HTTPS URLs, relative paths, data URIs, base64
 */
const SimpleImage = ({ 
  src, 
  alt = 'Product image',
  product = null,
  className = '',
  fallback = '/placeholder.svg',
  priority = false,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src || fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle image load success
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Handle image load error - use fallback
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    // Log broken image for debugging
    console.warn(`[SimpleImage] Image failed to load: ${src}`);
    
    // Use category-based fallback if available
    if (product?.category) {
      const categoryFallback = getFallbackImage(product.category);
      console.log(`[SimpleImage] Using category fallback for ${product.category}`);
      setImageSrc(categoryFallback);
    } else {
      setImageSrc(fallback);
    }
  }, [product, fallback, src]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg" />
      )}

      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...props}
      />

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImage;
