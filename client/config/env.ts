// Dynamic base URL detection for XAMPP/Local environments
const getBaseUrl = () => {
  if (!import.meta.env.DEV) return window.location.origin + '/backend/public';

  // If running via Vite dev server, we usually expect backend on 8000
  // But if accessing via XAMPP (port 80), we should adjust
  const host = window.location.hostname;
  const port = window.location.port;

  // Common Vite/React dev server ports → backend is on artisan serve (8000)
  const viteDevPorts = ['3000', '4173', '5173', '5174', '8080', '8081', '8082', '8083'];
  if (viteDevPorts.includes(port)) {
    return `http://${host}:8000`;
  }

  // Likely accessing via Apache (XAMPP) on port 80/443
  return `http://${host}/V1/backend/public`;
};

export const BASE_URL = getBaseUrl();

export const API_BASE_URL = `${BASE_URL}/api`.replace(/\/$/, '');
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;
export const STORAGE_BASE_URL = `${BASE_URL}/storage`.replace(/\/$/, '');

// Utility to get full storage URL for relative paths
export const getStorageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // Clean path: remove trailing slash if any
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;

  if (cleanPath.startsWith('http')) return cleanPath;
  if (cleanPath.startsWith('/storage')) return `${BASE_URL}${cleanPath}`;
  if (cleanPath.startsWith('storage')) return `${BASE_URL}/${cleanPath}`;
  return cleanPath;
};

export const FACEBOOK_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || '';
