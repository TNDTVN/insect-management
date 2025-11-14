// services/passwordService.js
import api from './api'

const passwordService = {
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

export default passwordService