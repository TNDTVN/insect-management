import api from './api';

const statisticsService = {
  getDashboardStatistics: async (timeframe = 'monthly') => {
    try {
      const response = await api.get('/statistics/dashboard', {
        params: { timeframe },
      });
      
      const data = response?.data || {};
      return {
        totalDetections: data.totalDetections || 0,
        monthlyDetections: data.monthlyDetections || 0,
        totalFeedback: data.totalFeedback || 0,
        positiveFeedback: data.positiveFeedback || 0,
        negativeFeedback: data.negativeFeedback || 0,
        totalUsers: data.totalUsers || 0,
        modelCount: data.modelCount || 0,
        speciesData: Array.isArray(data.speciesData) ? data.speciesData : [],
        recentHistory: Array.isArray(data.recentHistory) ? data.recentHistory : [],
        timeData: Array.isArray(data.timeData) ? data.timeData : [],
        uniqueSpecies: data.uniqueSpecies || 0,
        averageConfidence: data.averageConfidence || 0,
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
      return {
        totalDetections: 0,
        monthlyDetections: 0,
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        totalUsers: 0,
        modelCount: 0,
        speciesData: [],
        recentHistory: [],
        timeData: [],
        uniqueSpecies: 0,
        averageConfidence: 0,
      };
    }
  },

  getUserStatistics: async (userId) => {
    try {
      const response = await api.get(`/statistics/user/${userId}`);
      return response?.data || {};
    } catch (error) {
      console.error('Lỗi khi lấy thống kê người dùng:', error);
      return {
        totalDetections: 0,
        monthlyDetections: 0,
        avgConfidence: 0,
        topSpecies: [],
      };
    }
  },
};

export default statisticsService;