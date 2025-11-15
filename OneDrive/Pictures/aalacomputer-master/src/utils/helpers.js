// Debounce function to limit API calls
export const debounce = (func, wait) => {
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

// Image loading optimization
export const optimizeImage = (url, width = 300) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('zahcomputers.pk')) {
    // Add width parameter for server-side image optimization
    return `${url}?width=${width}`;
  }
  return url;
};

// Format price with proper commas
export const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Cache management
export const cacheData = (key, data, ttl = 3600000) => {
  const item = {
    data,
    timestamp: new Date().getTime(),
    ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key) => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const parsedItem = JSON.parse(item);
  const now = new Date().getTime();
  
  if (now - parsedItem.timestamp > parsedItem.ttl) {
    localStorage.removeItem(key);
    return null;
  }
  
  return parsedItem.data;
};