// services/speciesService.js
import api from './api';

const speciesService = {
  getAllSpecies: async (skip = 0, limit = 20, distinctOnly = true) => {
    try {
      const response = await api.get(`/species/?skip=${skip}&limit=${limit}&distinct_only=${distinctOnly}`);
      return response?.data || []; // Bây giờ response.data mới có dữ liệu
    } catch (error) {
      console.error('Error fetching species:', error);
      return [];
    }
  },

  getDistinctSpecies: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/species/distinct?skip=${skip}&limit=${limit}`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching distinct species:', error);
      return [];
    }
  },

  getSpeciesCount: async (distinctOnly = true) => {
    try {
      const response = await api.get(`/species/count?distinct_only=${distinctOnly}`);
      return response?.data?.total || 0;
    } catch (error) {
      console.error('Error fetching species count:', error);
      return 0;
    }
  },

  getSpeciesById: async (speciesId) => {
    try {
      const response = await api.get(`/species/${speciesId}`);
      return response?.data;
    } catch (error) {
      console.error('Error fetching species by ID:', error);
      throw error;
    }
  },

  getSpeciesByClass: async (classId) => {
    try {
      const response = await api.get(`/species/class/${classId}`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching species by class:', error);
      return [];
    }
  },
};

export default speciesService;