// Centralized API configuration
const isLocalDev = import.meta.env.DEV && typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalDev 
  ? '' 
  : (import.meta.env.VITE_API_URL || 'https://backend.wingrootechnologies.com');

