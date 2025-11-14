// services/profileService.js
import api from './api'

const profileService = {
  // Lấy thông tin profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile/me')
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  // Cập nhật profile với avatar
  updateProfile: async (profileData) => {
    try {
      const formData = new FormData()
      
      // Thêm các trường thông tin
      if (profileData.full_name !== undefined) {
        formData.append('full_name', profileData.full_name)
      }
      if (profileData.phone_number !== undefined) {
        formData.append('phone_number', profileData.phone_number)
      }
      if (profileData.date_of_birth !== undefined) {
        formData.append('date_of_birth', profileData.date_of_birth)
      }
      if (profileData.address !== undefined) {
        formData.append('address', profileData.address)
      }
      
      // Thêm avatar nếu có
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar)
      }

      const response = await api.put('/profile/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Cập nhật email - SỬA: GỬI JSON THAY VÌ FORM DATA
  updateEmail: async (newEmail) => {
    try {
      const response = await api.put('/profile/email', {
        new_email: newEmail
      })
      return response.data
    } catch (error) {
      console.error('Error updating email:', error)
      throw error
    }
  },

  // Cập nhật username - SỬA: GỬI JSON THAY VÌ FORM DATA
  updateUsername: async (newUsername) => {
    try {
      const response = await api.put('/profile/account', {
        username: newUsername
      })
      return response.data
    } catch (error) {
      console.error('Error updating username:', error)
      throw error
    }
  },

  resendVerificationEmail: async () => {
    try {
      const response = await api.post('/auth/resend-verification-email')
      return response.data
    } catch (error) {
      console.error('Lỗi gửi lại email xác minh:', error)
      throw error
    }
  },

  // Xóa avatar
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/profile/avatar')
      return response.data
    } catch (error) {
      console.error('Error deleting avatar:', error)
      throw error
    }
  }
}

export default profileService