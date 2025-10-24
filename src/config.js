// config.js
// Production-ready: works on any deployed domain

const API_BASE =
  import.meta.env.MODE === 'development'
    ? '/api'                       // local dev (Vite proxy)
    : `${window.location.origin}/api`; // production: same domain

export { API_BASE };
