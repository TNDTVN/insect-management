import { ArrowLeft, Bug, CheckCircle, Home, Mail } from 'lucide-react'; // Thêm Home icon
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import useAuth from '../../hooks/useAuth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const { requestPasswordReset } = useAuth()
  const navigate = useNavigate() // Thêm navigate

  // Hàm xử lý quay lại dashboard
  const handleBackToDashboard = () => {
    navigate('/')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSuccess(true)
    } catch (error) {
      console.error('Password reset request failed:', error)
      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }))
    }
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        {/* Nút trở về dashboard - Success State */}
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Email đã được gửi!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-50 text-center">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn trong email để đặt lại mật khẩu.
              </p>
              <p className="text-xs text-gray-500">
                Nếu không thấy email, vui lòng kiểm tra thư mục spam hoặc thử lại sau vài phút.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full text-green-600 hover:text-green-700 font-medium text-sm py-2 transition-colors duration-200"
              >
                Gửi lại email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      {/* Nút trở về dashboard */}
      <button
        onClick={handleBackToDashboard}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md border border-green-100"
        title="Trở về trang chủ"
      >
        <Home className="h-4 w-4" />
        <span className="text-sm font-medium">Trang chủ</span>
      </button>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-3">
            <Bug className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            MeKong InsectVision
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Quên mật khẩu
          </p>
        </div>

        {/* Forgot Password Form */}
        <form className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-50" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
              </p>
              
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pl-10 ${
                    errors.email ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleChange}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Gửi liên kết đặt lại</span>
              </>
            )}
          </button>

          {/* Back to Login Link */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-green-600 hover:text-green-500 font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </form>

        {/* Information Box */}
        <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ</span>
              </div>
            </div>
            <div className="text-xs text-blue-700">
              <p className="font-medium">Lưu ý:</p>
              <p>Liên kết đặt lại mật khẩu sẽ hết hạn sau 1 giờ. Vui lòng kiểm tra cả thư mục spam nếu không thấy email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}