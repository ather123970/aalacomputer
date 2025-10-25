// Use Vite's import.meta.env for client-side environment variables.
// Vite exposes variables prefixed with VITE_ to the browser. This file provides
// a single export for the app to consume and falls back to localhost.
// Prefer Vite variable VITE_BACKEND_URL, then VITE_API_URL for compatibility, then fallback.
// When running Vite in development the dev server usually proxies `/api` to the backend.
// Use '/api' as the default base in development so client code can call the proxied path
// (avoids CORS during local dev). In production prefer an explicit VITE_BACKEND_URL or fallback to the localhost URL.
// Default to '/api' in dev (so Vite proxy works). In production, prefer an explicit VITE_BACKEND_URL
// or VITE_API_URL. If those are not provided fall back to 'http://localhost:3000/api' so client
// code that appends `/v1/...` keeps the expected `/api/v1/...` shape.
// For production (Vercel) prefer relative '/api' so client calls hit serverless functions.
// Prefer explicit VITE_API_BASE_URL (new recommended name). Fall back to other
// names for compatibility, otherwise use '/api' in dev and window.location.origin+'/api' in production.
const explicit = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
export const API_BASE = explicit || (import.meta.env.MODE === 'production' ? (window.location.origin + '/api') : '/api');