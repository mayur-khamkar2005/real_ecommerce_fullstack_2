import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'https://real-ecommerce-fullstack-2.onrender.com';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000, // 15s timeout prevents hanging requests
});

// --- Deduplication guards ---
let networkErrorShownAt = 0;
let sessionExpiredShownAt = 0;
const TOAST_COOLDOWN_MS = 4000;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const now = Date.now();

    if (error.response) {
      const { status } = error.response;
      const reqUrl = error.config?.url || '';

      if (status >= 500) {
        // Only show server error once per 4s to avoid spam on retry storms
        if (now - networkErrorShownAt > TOAST_COOLDOWN_MS) {
          networkErrorShownAt = now;
          toast.error('Server error. Please try again later.');
        }
      } else if (status === 401) {
        // Suppress 401 on auth check and login routes — those components handle it
        const isSilent = reqUrl.includes('/auth/me') || reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');
        if (!isSilent && now - sessionExpiredShownAt > TOAST_COOLDOWN_MS) {
          sessionExpiredShownAt = now;
          toast.error('Session expired. Please log in again.');
        }
      } else if (status === 403) {
        toast.error('You do not have permission for this action.');
      }
      // 400 and 404 are intentionally silent — let components handle them
    } else if (error.request) {
      // Network error (no response) — only show once per 4s
      if (now - networkErrorShownAt > TOAST_COOLDOWN_MS) {
        networkErrorShownAt = now;
        toast.error('Network error. Please check your connection.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
