// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (imgElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    imageObserver.observe(imgElement);
  } else {
    // Fallback for older browsers
    imgElement.src = imgElement.dataset.src;
  }
};

// Cache API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const clearCache = () => {
  cache.clear();
};

// Batch API calls
export const batchApiCalls = async (calls) => {
  try {
    const results = await Promise.allSettled(calls);
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`API call ${index} failed:`, result.reason);
        return null;
      }
    });
  } catch (error) {
    console.error('Batch API calls failed:', error);
    return [];
  }
};

// Optimize image URLs
export const optimizeImageUrl = (url, width = 800) => {
  if (!url) return null;
  
  // If using external CDN, add optimization parameters
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  
  return url;
};

// Preload critical resources
export const preloadResource = (url, type = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

// Measure performance
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

// Chunk large arrays for rendering
export const chunkArray = (array, size = 20) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
