// API Configuration for multiple environments
const getApiBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';
  }
  
  // Production environment detection
  const hostname = window.location.hostname;
  
  // Render deployment pattern
  if (hostname.includes('onrender.com')) {
    return `https://${hostname}`;
  }
  
  // Custom domain
  if (hostname.includes('aalacomputer.com')) {
    return `https://${hostname}`;
  }
  
  // Vercel deployment
  if (hostname.includes('vercel.app')) {
    return `https://${hostname}`;
  }
  
  // Default fallback
  return window.location.origin;
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
      // Token expired or invalid, redirect to login
      localStorage.removeItem('aalacomp_admin_token');
      window.location.href = '/admin/login';
      throw new Error('Authentication failed');
    }
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export default API_CONFIG;
