// Centralized API configuration (Uses Vite proxy in local dev, VITE_API_URL in prod)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalhost ? '' : (import.meta.env.VITE_API_URL || '');

