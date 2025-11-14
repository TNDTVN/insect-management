import api from './api';

const modelService = {
  // Lấy tất cả models
  getAllModels: async () => {
    const response = await api.get('/models/');
    return response.data;
  },

  // Lấy model theo ID
  getModelById: async (id) => {
    const response = await api.get(`/models/${id}`);
    return response.data;
  },

  // Thêm model mới
  createModel: async (modelData) => {
    const formData = new FormData();
    
    formData.append('name', modelData.name);
    formData.append('version', modelData.version);
    formData.append('description', modelData.description || '');
    formData.append('is_active', modelData.is_active || false);
    
    if (modelData.model_file) {
      formData.append('uploaded_file', modelData.model_file);
    }
    
    if (modelData.species_file) {
      formData.append('species_file', modelData.species_file);
    }

    if (modelData.species_images) {
      modelData.species_images.forEach((image, index) => {
        if (image) {
          formData.append('species_images', image);
        }
      });
    }

    const response = await api.post('/models/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cập nhật model
  updateModel: async (id, modelData) => {
    const formData = new FormData();
    
    // Thêm các trường cơ bản của model
    if (modelData.name) formData.append('name', modelData.name);
    if (modelData.version) formData.append('version', modelData.version);
    if (modelData.description !== undefined) formData.append('description', modelData.description);
    if (modelData.is_active !== undefined) formData.append('is_active', modelData.is_active);
    
    // Thêm file model nếu có
    if (modelData.model_file) {
      formData.append('uploaded_file', modelData.model_file);
    }
    
    // Thêm file JSON nếu có
    if (modelData.species_file) {
      formData.append('species_file', modelData.species_file);
    }

    // Thêm species_data dưới dạng JSON string nếu có
    if (modelData.species_data && modelData.species_data.length > 0) {
      // Loại bỏ image_file khỏi species_data trước khi gửi
      const speciesDataToSend = modelData.species_data.map(species => ({
        name_en: species.name_en,
        name_vi: species.name_vi,
        description: species.description,
        harm: species.harm,
        benefit: species.benefit,
        prevention: species.prevention,
        class_id: species.class_id,
        image_path: species.image_path || ''
      }));
      formData.append('species_data', JSON.stringify(speciesDataToSend));
    }

    // Thêm species_images, bao gồm placeholder nếu không có file ảnh mới
    if (modelData.species_data && modelData.species_data.length > 0) {
      modelData.species_images.forEach((image, index) => {
        if (image && !image.name.startsWith('placeholder_')) {
          formData.append('species_images', image);
        } else {
          // Gửi placeholder để giữ thứ tự
          formData.append('species_images', new Blob([]), `placeholder_${index}`);
        }
      });
    }

    const response = await api.put(`/models/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Kích hoạt model
  activateModel: async (id) => {
    const response = await api.patch(`/models/${id}/activate`);
    return response.data;
  },

  // Lấy species của model
  getModelSpecies: async (modelId) => {
    const response = await api.get(`/models/${modelId}/species`);
    return response.data;
  },
};

export default modelService;