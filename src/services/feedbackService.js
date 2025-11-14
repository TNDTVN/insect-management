import api from './api';

const feedbackService = {
  submit: async (feedbackData) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      const response = await api.post('/feedback/', feedbackData);
      console.log('Feedback response:', response.data);
      return response?.data;
    } catch (error) {
      console.error('Lỗi khi gửi feedback:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getFeedbackStats: async () => {
    try {
      const response = await api.get('/feedback/');
      return response?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy thống kê feedback:', error);
      return {
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        averageRating: 0,
      };
    }
  },

  getUserFeedback: async (userId) => {
    try {
      const response = await api.get(`/feedback/user/${userId}`);
      return response?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy feedback người dùng:', error);
      return {
        userFeedbackCount: 0,
        lastFeedbackDate: null,
      };
    }
  },

  getAllFeedback: async (skip = 0, limit = 10, isCorrect = null) => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (typeof isCorrect === 'boolean') {
        params.append('is_correct', isCorrect.toString());
      }

      console.log('📡 Fetching all feedback with params:', params.toString());
      const response = await api.get(`/feedback/all?${params.toString()}`);
      console.log('✅ All feedback response:', response.data);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi lấy tất cả feedback:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getMyFeedback: async (skip = 0, limit = 10, isCorrect = null) => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (isCorrect !== null && isCorrect !== undefined) {
        params.append('is_correct', isCorrect.toString());
      }

      console.log('📡 Fetching my feedback with params:', params.toString());
      const response = await api.get(`/feedback/my-feedback?${params.toString()}`);
      console.log('✅ My feedback response:', response.data);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi lấy lịch sử feedback:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getDetailedStats: async () => {
    try {
      const response = await api.get('/feedback/stats/detailed');
      return response?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy thống kê chi tiết:', error);
      throw error;
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      return response?.data;
    } catch (error) {
      console.error('Lỗi khi xóa feedback:', error);
      throw error;
    }
  },

  exportFeedback: async () => {
    try {
      const response = await api.get('/feedback/admin/export');
      console.log('✅ Export feedback response:', response.data);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi xuất feedback:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  getFeedbackAnalytics: async () => {
    try {
      const response = await api.get('/feedback/admin/analytics');
      return response?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy analytics feedback:', error);
      throw error;
    }
  },
};

export default feedbackService;