import { Bug, Eye, EyeOff, Home, Mail, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ và tên là bắt buộc';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password
      });
      navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <button
        onClick={handleBackToDashboard}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md border border-green-100"
        title="Trở về trang chủ"
      >
        <Home className="h-4 w-4" />
        <span className="text-sm font-medium">Trang chủ</span>
      </button>

      <div className="max-w-md w-full space-y-4 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-2">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            MeKong InsectVision
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Tạo tài khoản mới
          </p>
        </div>

        <form className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-green-50" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                Tên đăng nhập *
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pl-9 ${
                    errors.username ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                />
                <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pl-9 ${
                    errors.email ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pl-9 ${
                    errors.full_name ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Nhập họ và tên"
                  value={formData.full_name}
                  onChange={handleChange}
                />
                <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pr-9 ${
                    errors.password ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pr-9 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                <span>Đang đăng ký...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Đăng ký</span>
              </>
            )}
          </button>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Đăng nhập
              </Link>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Sau khi đăng ký, vui lòng kiểm tra email để xác minh tài khoản.
            </p>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-1 text-center text-xs text-gray-600">
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded border border-green-100">
            <div className="w-3 h-3 mx-auto mb-0.5 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Dễ dùng
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded border border-green-100">
            <div className="w-3 h-3 mx-auto mb-0.5 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Bảo mật
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded border border-green-100">
            <div className="w-3 h-3 mx-auto mb-0.5 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Miễn phí
          </div>
        </div>
      </div>
    </div>
  );
}