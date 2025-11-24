// API Configuration for multiple environments with automatic domain detection
const getApiBaseUrl = () => {
  // Allow override in both dev and prod for multi-domain deployments
  const override = (import.meta.env.VITE_BACKEND_URL || '').trim();
  if (override) return override;
  
  // Check if we're in development
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
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

// Helper function to get admin token (from sessionStorage - expires on browser close)
export const getAdminToken = () => {
  return sessionStorage.getItem('aalacomp_admin_token');
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = getAdminToken();
  const url = getApiUrl(endpoint);
  
  console.log(`[API] Making ${options.method || 'GET'} request to: ${url}`);
  console.log(`[API] Token present: ${!!token}`);
  
  // Check if token is expired before making request
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      if (now > expiresAt) {
        // Token expired
        console.log('[API] Token expired - removing and redirecting to login');
        sessionStorage.removeItem('aalacomp_admin_token');
        window.location.href = '/admin/login';
        throw new Error('Session expired. Please login again.');
      }
    } catch (error) {
      if (error.message.includes('Session expired')) throw error;
      console.warn('[API] Could not verify token expiration:', error);
    }
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    credentials: 'include' // Add credentials for CORS
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  console.log(`[API] Response status: ${response.status}`);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      console.log('[API] 401 Unauthorized - removing token and redirecting');
      sessionStorage.removeItem('aalacomp_admin_token');
      // Redirect to login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
      throw new Error('Session expired. Please login again.');
    }
    
    // Try to get error message from response
    let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export default API_CONFIG;