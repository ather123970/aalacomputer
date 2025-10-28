// API Configuration for multiple environments with automatic domain detection
const getApiBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';
  }
  
  // Production environment detection - works on ANY domain
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Build the base URL dynamically
  let baseUrl = `${protocol}//${hostname}`;
  
  // Add port if it's not the default port
  if (port && port !== '80' && port !== '443') {
    baseUrl += `:${port}`;
  }
  
  return baseUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_STATS: '/api/admin/stats',
    ADMIN_ORDERS: '/api/admin/orders'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get admin token
export const getAdminToken = () => {
  return localStorage.getItem('aalacomp_admin_token');
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = getAdminToken();
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('aalacomp_admin_token');
      // Use history API instead of direct window.location to avoid full page reload
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
      throw new Error('Please login again to continue');
    }
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export default API_CONFIG;
