// pages/User/ChangePassword.jsx
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'
import passwordService from '../../services/passwordService'

export default function ChangePassword() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  })

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'new_password') {
      checkPasswordStrength(value)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return false
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return false
    }

    if (formData.new_password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return false
    }

    if (formData.old_password === formData.new_password) {
      toast.error('Mật khẩu mới phải khác mật khẩu cũ')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      await passwordService.changePassword(formData.old_password, formData.new_password)
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      
      // Đăng xuất và chuyển đến trang login
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to change password:', error)
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || 'Đổi mật khẩu thất bại')
      } else {
        toast.error('Đổi mật khẩu thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đổi mật khẩu</h1>
            <p className="text-gray-600">Bảo vệ tài khoản của bạn với mật khẩu mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mật khẩu cũ */}
            <div>
              <label htmlFor="old_password" className="form-label text-sm">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  id="old_password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="form-input pr-10 text-sm py-2.5"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label htmlFor="new_password" className="form-label text-sm">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="form-input pr-10 text-sm py-2.5"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.new_password && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Độ mạnh mật khẩu:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center text-xs">
                      <CheckCircle 
                        className={`h-3 w-3 mr-1 ${
                          passwordStrength.length ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={passwordStrength.length ? 'text-green-700' : 'text-gray-500'}>
                        ≥ 6 ký tự
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CheckCircle 
                        className={`h-3 w-3 mr-1 ${
                          passwordStrength.uppercase ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={passwordStrength.uppercase ? 'text-green-700' : 'text-gray-500'}>
                        Chữ hoa (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CheckCircle 
                        className={`h-3 w-3 mr-1 ${
                          passwordStrength.lowercase ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={passwordStrength.lowercase ? 'text-green-700' : 'text-gray-500'}>
                        Chữ thường (a-z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CheckCircle 
                        className={`h-3 w-3 mr-1 ${
                          passwordStrength.number ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={passwordStrength.number ? 'text-green-700' : 'text-gray-500'}>
                        Số (0-9)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label htmlFor="confirm_password" className="form-label text-sm">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`form-input pr-10 text-sm py-2.5 ${
                    formData.confirm_password && formData.new_password !== formData.confirm_password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-red-600 text-xs mt-1">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Lưu ý bảo mật:</strong> Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất và cần đăng nhập lại với mật khẩu mới.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !isPasswordStrong}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Đổi mật khẩu'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}