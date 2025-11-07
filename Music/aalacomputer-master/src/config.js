// Dynamic API Configuration for multiple environments with automatic domain detection
const getApiBaseUrl = () => {
  // Priority 1: Environment variable override (for cross-domain deployments)
  const override = (import.meta.env.VITE_BACKEND_URL || '').trim();
  if (override) return override;
  
  // Priority 2: Development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }
  
  // Priority 3: Production - same origin (backend serves frontend)
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