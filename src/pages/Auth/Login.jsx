// Login.jsx
import { Bug, Eye, EyeOff, Home, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.', {
        toastId: 'login-error' // Đảm bảo chỉ hiển thị một toast
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <button
        onClick={handleBackToDashboard}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md border border-green-100"
        title="Trở về trang chủ"
      >
        <Home className="h-4 w-4" />
        <span className="text-sm font-medium">Trang chủ</span>
      </button>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-3">
            <Bug className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            MeKong InsectVision
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Đăng nhập vào hệ thống
          </p>
        </div>

        <form className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-50" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pr-10"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 mb-4">
            <div className="flex items-center">
  
            </div>

            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-500 font-medium transition-colors">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
          <div className="bg-white/50 backdrop-blur-sm p-2 rounded-lg border border-green-100">
            <div className="w-4 h-4 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Chính xác
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-2 rounded-lg border border-green-100">
            <div className="w-4 h-4 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Đa dạng
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-2 rounded-lg border border-green-100">
            <div className="w-4 h-4 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            Chi tiết
          </div>
        </div>
      </div>
    </div>
  );
}