// Dynamic API Configuration for multiple environments
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

export const API_BASE = getApiBaseUrl();