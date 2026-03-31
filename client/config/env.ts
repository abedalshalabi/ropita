const getBasePath = () => {
  if (!import.meta.env.DEV) {
    const host = window.location.origin;
    const path = window.location.pathname;
    // قائمة ببعض المسارات المعروفة للتفريق بينها وبين اسم المجلد الفرعي
    const knownRoutes = ['admin', 'products', 'cart', 'checkout', 'product', 'categories', 'brands', 'login', 'register', 'dashboard', 'about', 'contact', 'shipping', 'returns', 'warranty', 'order-success', 'offers'];
    const segments = path.split('/').filter(p => p !== "");
    
    // إذا كان الجزء الأول من المسار ليس من الصفحات المعروفة، فهو اسم المجلد الفرعي
    const subfolder = (segments.length > 0 && !knownRoutes.includes(segments[0])) ? `/${segments[0]}` : "";
    return subfolder;
  }
  return "";
};

export const BASE_PATH = getBasePath();
export const BASE_URL = !import.meta.env.DEV 
  ? window.location.origin + BASE_PATH + '/backend/public'
  : (window.location.port === '8080' || window.location.port === '5173' ? `http://${window.location.hostname}:8000` : `http://${window.location.hostname}/ropita/backend/public`);

export const API_BASE_URL = !import.meta.env.DEV 
  ? `${BASE_URL}/index.php/api`.replace(/\/$/, '')
  : `${BASE_URL}/api`.replace(/\/$/, '');
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
