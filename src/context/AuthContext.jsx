import { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import profileService from '../services/profileService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      console.log('📋 Profile data received:', profile);
      setUser(prev => ({
        ...prev,
        full_name: profile.full_name || prev.full_name,
        avatar_url: profile.avatar_url || prev.avatar_url,
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth || '',
        address: profile.address || '',
        id: prev.id,
        username: prev.username,
        email: prev.email,
        role: prev.role,
        is_active: prev.is_active,
        is_verified: prev.is_verified,
        created_at: prev.created_at,
        updated_at: prev.updated_at
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        console.log('Profile not accessible, continuing without profile data');
      }
    }
  };

  useEffect(() => {
    if (isCheckingAuth) return;

    const token = localStorage.getItem('token');
    if (token) {
      setIsCheckingAuth(true);
      authService.getCurrentUser()
        .then(data => {
          console.log('🔐 Current user data:', data);
          setUser(data);
          return fetchUserProfile();
        })
        .catch((error) => {
          console.error('Error getting current user:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);

            // ✅ Chỉ chuyển hướng khi không ở trang login
            if (!['/login', '/register', '/forgot-password'].includes(location.pathname)) {
              navigate('/login', { replace: true });
            }
          }
        })
        .finally(() => {
          setLoading(false);
          setIsCheckingAuth(false);
        });
    } else {
      setUser(null);
      setLoading(false);
      // Không navigate ở đây để tránh reload khi ở /login
    }
  }, [navigate, location.pathname]);

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username });
      setIsCheckingAuth(true); // Đánh dấu đang xử lý đăng nhập
      const data = await authService.login(username, password);
      console.log('Login response data:', data);

      if (!data) {
        throw new Error('No response data from server');
      }

      const token = data?.access_token || data?.token;
      if (!token) {
        console.error('Token not found in response:', data);
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);

      const userData = {
        id: data.user?.id || data.id,
        username: data.user?.username || username,
        email: data.user?.email || data.email || '',
        full_name: data.user?.full_name || data.full_name || '',
        avatar_url: data.user?.avatar_url || data.avatar_url || '',
        phone_number: data.user?.phone_number || '',
        date_of_birth: data.user?.date_of_birth || '',
        address: data.user?.address || '',
        role: data.user?.role || data.role || 'user',
        is_active: data.user?.is_active ?? true,
        is_verified: data.user?.is_verified ?? false,
        created_at: data.user?.created_at || data.created_at,
        updated_at: data.user?.updated_at || data.updated_at
      };

      console.log('👤 Setting user data:', userData);
      setUser(userData);

      await fetchUserProfile().catch(error => {
        console.log('Profile fetch failed but continuing:', error);
      });

      toast.success('Đăng nhập thành công!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      setIsCheckingAuth(false); // Đặt lại trạng thái
    }
  };

  // Các hàm khác giữ nguyên
  const updateProfile = async (profileData) => {
    try {
      console.log('🔄 Updating profile with:', profileData);
      const updatedProfile = await profileService.updateProfile(profileData);
      console.log('✅ Profile updated:', updatedProfile);
      setUser(prev => ({
        ...prev,
        full_name: updatedProfile.full_name,
        avatar_url: updatedProfile.avatar_url,
        phone_number: updatedProfile.phone_number,
        date_of_birth: updatedProfile.date_of_birth,
        address: updatedProfile.address
      }));
      setAvatarVersion(prev => prev + 1);
      toast.success('Cập nhật thông tin thành công!');
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Cập nhật thông tin thất bại');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAvatarVersion(0);
    navigate('/');
    toast.success('Đăng xuất thành công');
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Đổi mật khẩu thành công');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      toast.success('Xác thực email thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xác thực email thất bại');
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await authService.requestPasswordReset(email);
      toast.success('Đã gửi email đặt lại mật khẩu');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi email thất bại');
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Đặt lại mật khẩu thành công');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    avatarVersion
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}