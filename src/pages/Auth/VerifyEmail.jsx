import { Bug, Home } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'; // Thêm useRef
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const isMounted = useRef(false); // Thêm useRef để theo dõi lần chạy đầu tiên
  const { verifyEmail, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (isMounted.current) return; // Nếu đã chạy, thoát ngay
    isMounted.current = true; // Đánh dấu là đã chạy

    const verify = async () => {
      if (!token) {
        setError('Không tìm thấy mã xác minh.');
        setLoading(false);
        return;
      }

      if (verified) {
        setLoading(false);
        return;
      }

      try {
        // Kiểm tra trạng thái tài khoản
        try {
          const user = await getCurrentUser();
          if (user.is_verified) {
            setVerified(true);
            setLoading(false);
            toast.info('Tài khoản đã được xác minh. Bạn sẽ được chuyển hướng đến trang đăng nhập.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        } catch (err) {
          console.log('Chưa đăng nhập hoặc không lấy được thông tin người dùng:', err);
        }

        await verifyEmail(token);
        setVerified(true);
        setLoading(false);
        toast.success('Xác minh email thành công.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        const errorMessage = err.message || 'Xác minh email thất bại.';
        if (err.response?.status === 400 && err.response?.data?.detail.includes('đã được sử dụng')) {
          setError('Mã xác minh đã được sử dụng. Vui lòng đăng nhập nếu tài khoản đã được xác minh.');
          toast.info('Mã xác minh đã được sử dụng. Vui lòng đăng nhập.');
        } else if (err.response?.status === 400) {
          setError('Mã xác minh không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập nếu tài khoản đã được xác minh.');
          toast.error('Mã xác minh không hợp lệ hoặc đã hết hạn.');
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
        setLoading(false);
      }
    };

    verify();
  }, [token, verifyEmail, getCurrentUser, navigate, verified]);

  const handleBackToDashboard = () => {
    navigate('/');
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
            Xác minh tài khoản của bạn
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md border border-green-50 text-center">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
              <span className="ml-2 text-sm text-gray-600">Đang xác minh...</span>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <p className="text-xs text-gray-600">
                Vui lòng liên hệ hỗ trợ tại{' '}
                <a href="mailto:0022410169@student.dthu.edu.vn" className="text-green-600 hover:text-green-500">
                  0022410169@student.dthu.edu.vn
                </a>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-green-600 text-sm mb-4">
                Xác minh email thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
              </p>
              <p className="text-xs text-gray-600">
                Nếu không được chuyển hướng,{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  nhấp vào đây để đăng nhập
                </Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}