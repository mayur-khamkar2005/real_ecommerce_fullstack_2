/**
 * getImageUrl — resolve a product image to a displayable URL.
 *
 * Rules (in priority order):
 * 1. Already an absolute https:// URL (e.g. placehold.co, picsum) → use directly
 * 2. Relative path /uploads/... or /images/... → prefix with backend origin
 * 3. Null / empty → return PLACEHOLDER_IMG constant
 *
 * The backend origin is derived from VITE_API_URL by stripping the /api suffix.
 * This handles both dev (localhost:5000/api → localhost:5000) and prod URLs.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Strip trailing /api or /api/ to get the raw origin (e.g. https://myapp.com)
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');

// Fallback placeholder when image is missing or fails
export const PLACEHOLDER_IMG = 'https://placehold.co/400x400/1e293b/94a3b8?text=No+Image';

// Tiny transparent gif base64 for lazy-loading placeholder
export const LAZY_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Build a full URL for a product image path.
 * @param {string|null|undefined} imagePath
 * @returns {string} A fully-qualified URL or PLACEHOLDER_IMG
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return PLACEHOLDER_IMG;

  // Already a full external URL — use as-is (picsum, placehold.co, CDN, etc.)
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Normalise to a path that starts with /
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Paths that the backend serves statically
  if (normalized.startsWith('/uploads') || normalized.startsWith('/images')) {
    return `${BACKEND_ORIGIN}${normalized}`;
  }

  // Fallback: treat as a relative path on the backend
  return `${BACKEND_ORIGIN}${normalized}`;
}
