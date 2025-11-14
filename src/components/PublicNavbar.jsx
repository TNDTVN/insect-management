// components/PublicNavbar.jsx
import { Link } from 'react-router-dom'

export default function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              MeKong InsectVision
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}