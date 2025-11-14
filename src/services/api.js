// services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      // ✅ Không redirect nếu user đang ở trang login / register
      if (!['/login', '/register', '/forgot-password'].includes(window.location.pathname)) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        // ✅ redirect bằng history API, không reload
        window.history.pushState({}, '', '/login');
        // Gửi 1 event để AuthContext xử lý
        window.dispatchEvent(new Event("auth-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;