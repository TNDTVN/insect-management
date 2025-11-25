// src/services/historyService.js
import api from './api';

const historyService = {
  getAll: async (skip = 0, limit = 12, userId = null) => {
    try {
      const params = { skip, limit };
      if (userId) params.user_id = userId;

      // SỬA: Gọi API getAll trả về danh sách history
      const response = await api.get('/history/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // --- THÊM HÀM NÀY ĐỂ SỬA LỖI "is not a function" ---
  getHistoryCount: async (userId) => {
    try {
      const params = userId ? { user_id: userId } : {};
      const response = await api.get('/history/count', { params });
      return response.data; // Trả về { total: number }
    } catch (error) {
      console.error('Error fetching history count:', error);
      throw error;
    }
  },
  // ----------------------------------------------------

  getObjectCounts: async (imageIds) => {
    try {
      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        return {};
      }
      const response = await api.post('/history/object-counts', imageIds, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching object counts:', error);
      return {};
    }
  },

  getImageDetail: async (imageId) => {
    try {
      const response = await api.get(`/history/image/${imageId}/detail`);
      return response;
    } catch (error) {
      console.error('Error fetching history detail:', error);
      throw error;
    }
  },

  delete: async (id) => {
    await api.delete(`/history/${id}`);
  },

  getAdminHistory: async (page = 1, limit = 50) => {
    const response = await api.get(`/history/admin/all?skip=${(page - 1) * limit}&limit=${limit}`);
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/history/admin/stats');
    return response.data;
  },

  deleteImageHistory: async (imageId) => {
    const response = await api.delete(`/history/admin/image/${imageId}`);
    return response.data;
  },

  exportHistory: async () => {
    try {
      const response = await api.get('/history/admin/export');
      return response?.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi xuất lịch sử:', error);
      throw error;
    }
  },
};

export default historyService;