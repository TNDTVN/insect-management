// src/services/userService.js
import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/user/admin/users');
    console.log('API Response structure:', response.data[0]); // Log first user
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    if (isActive === null || isActive === undefined) {
      console.error(`Invalid isActive value for user ${userId}: ${isActive}`);
      throw new Error('isActive must be a boolean');
    }
    const body = { is_active: Boolean(isActive) };
    console.log(`Sending PATCH request for user ${userId} with body:`, body);
    try {
      const response = await api.patch(`/user/admin/users/${userId}/status`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`Response for user ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in updateUserStatus for user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/user/admin/users/${userId}`);
    return response.data;
  },

  getUserStats: async (userId) => {
    const response = await api.get(`/user/admin/users/${userId}/stats`);
    return response.data;
  },

  updateUser: async (userId, updateData) => {
    try {
      const formData = new FormData();
      
      // Thêm các trường profile
      if (updateData.full_name !== undefined) {
        formData.append('full_name', updateData.full_name);
      }
      if (updateData.phone_number !== undefined) {
        formData.append('phone_number', updateData.phone_number);
      }
      if (updateData.date_of_birth !== undefined) {
        formData.append('date_of_birth', updateData.date_of_birth);
      }
      if (updateData.address !== undefined) {
        formData.append('address', updateData.address);
      }
      if (updateData.avatar) {
        formData.append('avatar', updateData.avatar);
      }

      // Update profile
      let profileResponse;
      if ([...formData.entries()].length > 0) {
        profileResponse = await api.put(`/user/admin/users/${userId}/profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Update email
      if (updateData.email) {
        await api.put(`/user/admin/users/${userId}/email`, { 
          new_email: updateData.email 
        });
      }

      // Update role
      if (updateData.role) {
        await api.put(`/user/admin/users/${userId}/role`, { 
          role: updateData.role 
        });
      }

      return profileResponse ? profileResponse.data : { message: 'Cập nhật thành công' };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUserAvatar: async (userId) => {
    try {
      const response = await api.delete(`/user/admin/users/${userId}/avatar`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user avatar:', error);
      throw error;
    }
  },
};

export default userService;