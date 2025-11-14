import api from './api';

const historyService = {
  getAll: async (page = 1, limit = 12, userId = null) => {
    try {
      const skip = (page - 1) * limit;
      const params = { skip, limit };
      if (userId) params.user_id = userId;

      const [historyRes, countRes] = await Promise.all([
        api.get('/history/', { params }),
        api.get('/history/count', { params: userId ? { user_id: userId } : {} }),
      ]);

      console.log('📡 History API Response:', historyRes.data);
      return {
        items: historyRes.data,
        total: countRes.data.total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

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
      console.log('📡 Object counts API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching object counts:', error);
      return {};
    }
  },

  getImageDetail: async (imageId) => {
    try {
      const response = await api.get(`/history/image/${imageId}/detail`);
      console.log('📡 History Detail API Response:', response.data);
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
      console.log('✅ Export history response:', response.data);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi xuất lịch sử:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
};

export default historyService;