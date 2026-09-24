// Centralized API configuration (Uses Vite proxy in dev, direct in prod)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

