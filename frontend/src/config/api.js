// Centralized API configuration for Local Development & Production
const isLocal = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '0.0.0.0' ||
   window.location.hostname.startsWith('192.168.') ||
   window.location.hostname.startsWith('10.') ||
   window.location.hostname.endsWith('.local'));

export const API_BASE_URL = isLocal
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
