// components/Navbar.jsx
import { LogOut, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react'; // THÊM useEffect
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const { user, logout, avatarVersion } = useAuth() // THÊM avatarVersion
  const [avatarError, setAvatarError] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  // THÊM: avatarVersion vào dependency
  useEffect(() => {
    if (user?.avatar_url) {
      let url = user.avatar_url
      if (url.startsWith('/public/')) {
        url = url.substring(1)
      } else if (url.startsWith('public/')) {
        // Giữ nguyên
      } else {
        url = `public/avatars/${url}`
      }
      const newUrl = `http://localhost:8000/${url}`
      console.log('🔄 Setting avatar URL:', newUrl, 'Version:', avatarVersion)
      setAvatarUrl(newUrl)
    } else {
      setAvatarUrl('')
    }
    setAvatarError(false)
  }, [user?.avatar_url, avatarVersion])

  const getDefaultAvatar = () => {
    return user?.role === 'admin' 
      ? 'http://localhost:8000/public/avatars/admin.jpg'
      : 'http://localhost:8000/public/avatars/profile.jpg'
  }

  return (
    <nav className={`fixed top-0 z-40 bg-white border-b border-gray-200 transition-all duration-300 ${
      sidebarOpen ? 'lg:left-64' : 'lg:left-20'
    } left-0 right-0`}>
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-2 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">
                MeKong InsectVision
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3">
              {/* Avatar section - SỬA URL */}
              {avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                  onError={() => {
                    console.error('❌ Avatar load error:', avatarUrl)
                    setAvatarError(true)
                  }}
                  onLoad={() => {
                    console.log('✅ Avatar loaded:', avatarUrl)
                    setAvatarError(false)
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              )}
              
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <Link
              to="/profile"
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Hồ sơ"
            >
              <User className="h-5 w-5" />
            </Link>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}