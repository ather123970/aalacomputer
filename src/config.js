// Dynamic API Configuration for multiple environments with automatic domain detection
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

export const API_BASE = getApiBaseUrl();