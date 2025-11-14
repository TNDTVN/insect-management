// services/detectionService.js
import api from './api';

const detectionService = {
  // Preview: không cần login
  detectPreview: async (formData) => {
    return api.post('/detection/detect-preview', formData);
  },

  // Chính thức: cần login → api tự thêm token
  detect: async (formData) => {
    return api.post('/detection/detect', formData);
  },
};

export default detectionService;