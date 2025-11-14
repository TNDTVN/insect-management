// pages/User/Profile.jsx
import { Calendar, Camera, Check, Edit2, Mail, MapPin, Phone, Send, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'
import profileService from '../../services/profileService'

export default function Profile() {
  const { user, updateProfile, setUser } = useAuth()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    address: ''
  })
  const [avatarPreview, setAvatarPreview] = useState('')
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [toastShown, setToastShown] = useState(false)

  useEffect(() => {
    if (user) {
      console.log('👤 User data in Profile:', user)
      
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        address: user.address || ''
      })

      if (user.avatar_url) {
        setAvatarPreview(`http://localhost:8000${user.avatar_url}`)
      }
      
      setNewEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleResendVerificationEmail = async () => {
    setEmailLoading(true)
    try {
      await profileService.resendVerificationEmail()
      toast.success('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gửi email xác minh thất bại.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      !toastShown && toast.error('Vui lòng chọn file ảnh')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      !toastShown && toast.error('Kích thước ảnh không được vượt quá 5MB')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
      return
    }

    setAvatarLoading(true)

    try {
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      await updateProfile({
        ...formData,
        avatar: file
      })
    } catch (error) {
      console.error('Failed to update avatar:', error)
      setAvatarPreview(user?.avatar_url ? `http://localhost:8000${user.avatar_url}` : '')
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      await profileService.deleteAvatar()
      setAvatarPreview('')
      !toastShown && toast.success('Đã xóa ảnh đại diện')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
    } catch (error) {
      console.error('Failed to remove avatar:', error)
      !toastShown && toast.error('Xóa ảnh đại diện thất bại')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
    }
  }

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === user.email) {
      setEditingEmail(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      !toastShown && toast.error('Email không hợp lệ')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
      return
    }

    setEmailLoading(true)
    try {
      await profileService.updateEmail(newEmail)
      
      setUser(prev => ({
        ...prev,
        email: newEmail
      }))
      
      !toastShown && toast.success('Cập nhật email thành công!')
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
      setEditingEmail(false)
    } catch (error) {
      if (error.response?.status === 400) {
        !toastShown && toast.error(error.response.data.detail || 'Email đã được sử dụng')
      } else {
        !toastShown && toast.error('Cập nhật email thất bại')
      }
      setToastShown(true)
      setTimeout(() => setToastShown(false), 1000)
      setNewEmail(user.email)
    } finally {
      setEmailLoading(false)
    }
  }

  const cancelEmailEdit = () => {
    setNewEmail(user.email)
    setEditingEmail(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getDefaultAvatar = () => {
    return user?.role === 'admin' 
      ? 'http://localhost:8000/public/avatars/admin.jpg'
      : 'http://localhost:8000/public/avatars/profile.jpg'
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-sm sm:text-base text-gray-600">Quản lý thông tin tài khoản và cập nhật hồ sơ của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full max-h-[calc(100vh-120px)] flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 flex-1 min-h-0">
            {/* Sidebar - Avatar và thông tin tài khoản */}
            <div className="lg:col-span-1 bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-6 lg:p-8 overflow-y-auto">
              <div className="flex flex-col items-center text-center h-full">
                {/* Avatar Section */}
                <div className="relative group mb-6">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    {avatarLoading ? (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-white" />
                      </div>
                    ) : (
                      <img
                        src={avatarPreview || getDefaultAvatar()}
                        alt="Avatar"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = getDefaultAvatar()
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/30 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden group-hover:flex">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="p-2 lg:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                        title="Đổi ảnh"
                      >
                        <Camera className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </button>
                      {(avatarPreview || user.avatar_url) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="p-2 lg:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                          title="Xóa ảnh"
                        >
                          <X className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="mb-4">
                  <h2 className="text-lg lg:text-xl font-semibold truncate max-w-full">
                    {user.full_name || 'Chưa cập nhật'}
                  </h2>
                  <p className="text-blue-100 opacity-90 text-sm lg:text-base">{user.username}</p>
                </div>

                <div className="w-full space-y-4 flex-1">
                  {/* Username Field */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Tên đăng nhập</span>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <span className="text-white text-sm lg:text-base">{user.username}</span>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-100">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <div className="flex gap-1">
                        {!user.is_verified && !editingEmail && (
                          <button
                            type="button"
                            onClick={handleResendVerificationEmail}
                            disabled={emailLoading}
                            className="text-yellow-300 hover:text-yellow-200 disabled:opacity-50 p-1 transition-colors flex items-center gap-1"
                            title="Gửi lại email xác minh"
                          >
                            <Send className="h-3 w-3" />
                            <span className="text-xs">Xác minh ngay</span>
                          </button>
                        )}
                        {!editingEmail ? (
                          <button
                            type="button"
                            onClick={() => setEditingEmail(true)}
                            className="text-blue-100 hover:text-white p-1 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={handleEmailUpdate}
                              disabled={emailLoading}
                              className="text-green-300 hover:text-green-200 disabled:opacity-50 p-1 transition-colors"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEmailEdit}
                              className="text-red-300 hover:text-red-200 p-1 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingEmail ? (
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm lg:text-base"
                        disabled={emailLoading}
                        placeholder="Nhập email mới"
                      />
                    ) : (
                      <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm flex items-center justify-between">
                        <span className="text-white text-sm lg:text-base break-all">{user.email}</span>
                        {!user.is_verified && (
                          <span className="text-yellow-300 text-xs ml-2">Chưa xác minh</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Form thông tin chi tiết */}
            <div className="lg:col-span-3 p-6 lg:p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Thông tin chi tiết
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="full_name" className="text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Nhập họ và tên của bạn"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone_number" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Ngày sinh
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Địa chỉ
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-auto">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm lg:text-base"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 text-sm lg:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Avatar Upload Hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Nhấn vào ảnh để thay đổi ảnh đại diện • 
            <span className="text-gray-400"> Hỗ trợ: JPG, PNG, JPEG (tối đa 5MB)</span>
          </p>
        </div>
      </div>
    </div>
  )
}