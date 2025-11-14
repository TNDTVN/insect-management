import { ArrowLeft, Bug, CheckCircle, Eye, EyeOff, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setErrors({ token: 'Token reset password không hợp lệ' })
    }
  }, [token])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await resetPassword(token, formData.newPassword)
      setSuccess(true)
    } catch (error) {
      console.error('Reset password failed:', error)
      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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

        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md border border-green-100"
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
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Mật khẩu của bạn đã được thay đổi thành công
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-50 text-center">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Bây giờ bạn có thể đăng nhập với mật khẩu mới.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <Bug className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-700 bg-clip-text text-transparent">
              Token không hợp lệ
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-red-50 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng yêu cầu gửi lại email đặt lại mật khẩu.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center gap-2"
              >
                Gửi lại email
              </Link>
              
              <Link
                to="/login"
                className="w-full text-red-600 hover:text-red-700 font-medium text-sm py-2 transition-colors duration-200 flex justify-center items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm hover:shadow-md border border-green-100"
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
            Đặt lại mật khẩu
          </p>
        </div>

        <form className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-50" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới *
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pr-10 ${
                    errors.newPassword ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 placeholder-gray-400 pr-10 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-green-200'
                  }`}
                  placeholder="Xác nhận mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Đặt lại mật khẩu</span>
              </>
            )}
          </button>

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
      </div>
    </div>
  )
}