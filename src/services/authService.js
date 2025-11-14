import { toast } from 'react-toastify';
import api from './api';

const authService = {
  login: async (username, password) => {
    try {
      console.log('Gửi yêu cầu đăng nhập tới /auth/login với:', { username });
      const response = await api.post('/auth/login', { username, password });
      console.log('Kết quả đăng nhập:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi dịch vụ đăng nhập:', error);
      console.error('Toàn bộ phản hồi lỗi:', error.response?.data);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (error.response) {
        errorMessage = error.response.data.detail || error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại.';
      }
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Kết quả đăng ký:', response.data);
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.');
      return response.data;
    } catch (error) {
      console.error('Lỗi dịch vụ đăng ký:', error);
      if (error.response) {
        toast.error(error.response.data.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
        throw new Error(error.response.data.detail || 'Đăng ký thất bại.');
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
        throw new Error('Không thể kết nối đến server.');
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng hiện tại:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi cập nhật hồ sơ:', error);
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', { oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công.');
      return response.data;
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      if (error.response) {
        toast.error(error.response.data.detail || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        throw new Error(error.response.data.detail || 'Đổi mật khẩu thất bại.');
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
        throw new Error('Không thể kết nối đến server.');
      }
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi xác minh email:', error);
      if (error.response) {
        const errorMessage = error.response.data.detail || 'Xác minh email thất bại.';
        throw new Error(errorMessage);
      } else {
        throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
      }
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success('Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.');
      return response.data;
    } catch (error) {
      console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
      if (error.response) {
        toast.error(error.response.data.detail || 'Gửi yêu cầu đặt lại mật khẩu thất bại.');
        throw new Error(error.response.data.detail || 'Gửi yêu cầu thất bại.');
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
        throw new Error('Không thể kết nối đến server.');
      }
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        new_password: newPassword 
      });
      toast.success('Đặt lại mật khẩu thành công.');
      return response.data;
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error);
      if (error.response) {
        toast.error(error.response.data.detail || 'Đặt lại mật khẩu thất bại.');
        throw new Error(error.response.data.detail || 'Đặt lại mật khẩu thất bại.');
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
        throw new Error('Không thể kết nối đến server.');
      }
    }
  }
};

export default authService;