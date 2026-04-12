const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string): string => {
  if (!value) return '';
  return value.startsWith('/') ? value : `/${value}`;
};

const normalizePath = (value: string | undefined): string => {
  if (!value) return '';
  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed || trimmed === '/') return '';
  return ensureLeadingSlash(trimmed);
};

const resolveAbsoluteUrl = (value: string | undefined, origin: string): string => {
  if (!value) return '';
  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${origin}${ensureLeadingSlash(trimmed)}`;
};

const getConfiguredFrontendBasePath = () => {
  const explicitBasePath = normalizePath(import.meta.env.VITE_FRONTEND_BASE_PATH);
  if (explicitBasePath) {
    return explicitBasePath;
  }

  const frontendUrl = resolveAbsoluteUrl(import.meta.env.VITE_FRONTEND_URL, window.location.origin);
  if (!frontendUrl) {
    return '';
  }

  const pathname = normalizePath(new URL(frontendUrl).pathname);
  return pathname;
};

export const BASE_PATH = getConfiguredFrontendBasePath();

const getBackendPublicUrl = () => {
  const configuredAbsoluteUrl = resolveAbsoluteUrl(import.meta.env.VITE_BACKEND_PUBLIC_URL, window.location.origin);
  if (configuredAbsoluteUrl) {
    return configuredAbsoluteUrl;
  }

  const configuredRelativePath = normalizePath(import.meta.env.VITE_BACKEND_PUBLIC_PATH);
  if (configuredRelativePath) {
    return `${window.location.origin}${configuredRelativePath}`;
  }

  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:8000`;
  }

  return `${window.location.origin}${BASE_PATH}`;
};

export const BASE_URL = getBackendPublicUrl();

export const API_BASE_URL = `${BASE_URL}/api`.replace(/\/$/, '');
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;

export const STORAGE_BASE_URL = `${BASE_URL}/storage`.replace(/\/$/, '');

const extractStorageRelativePath = (path: string): string | null => {
  const normalized = path.replace(/\\/g, "/");

  if (normalized.includes('/storage/')) {
    return normalized.split('/storage/')[1] || null;
  }

  if (normalized.startsWith('/storage/')) {
    return normalized.slice('/storage/'.length);
  }

  if (normalized.startsWith('storage/')) {
    return normalized.slice('storage/'.length);
  }

  return null;
};

// Utility to get full storage URL for relative paths
export const getStorageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Clean path: remove trailing slash if any
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;

  // إذا كان المسار يحتوي على كلمة storage، نقوم باستخلاص الجزء الذي يليها ودمجه مع عنوان السيرفر الحالي
  // هذا يحل مشكلة الروابط المخزنة كـ localhost في قاعدة البيانات
  const relativePath = extractStorageRelativePath(cleanPath);
  if (relativePath) {
    return `${STORAGE_BASE_URL}/${relativePath}`;
  }

  if (cleanPath === 'logo.webp' || cleanPath === '/logo.webp') return `${window.location.origin}${BASE_PATH}/logo.webp`;
  if (cleanPath.startsWith('http')) return cleanPath;
  if (cleanPath.startsWith('/storage')) return `${BASE_URL}${cleanPath}`;
  if (cleanPath.startsWith('storage')) return `${BASE_URL}/${cleanPath}`;
  if (cleanPath.startsWith('/')) return `${window.location.origin}${BASE_PATH}${cleanPath}`;
  
  return `${STORAGE_BASE_URL}/${cleanPath}`;
};

export const FACEBOOK_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || '';
