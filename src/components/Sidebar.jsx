// components/Sidebar.jsx
import {
  BarChart2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cpu, // THÊM ICON CHO Model Management
  History,
  Key,
  LayoutDashboard,
  MessageSquare,
  User
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // THÊM IMPORT useAuth

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth(); // Lấy thông tin người dùng

  // Navigation cho admin
  const adminNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Model Management', to: '/model-management', icon: Cpu },
    { name: 'User Management', to: '/user-management', icon: User },
    { name: 'Detection History', to: '/detection-history', icon: History },
    { name: 'Feedback Management', to: '/feedback-management', icon: MessageSquare },
  ];

  // Navigation cho user thường
  const userNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Detection', to: '/detection-protected', icon: Camera },
    { name: 'History', to: '/history', icon: History },
    { name: 'Statistics', to: '/statistics', icon: BarChart2 },
    { name: 'Feedback', to: '/feedback', icon: MessageSquare },
  ];

  // Chọn navigation dựa trên vai trò người dùng
  const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

  // Settings navigation (giữ nguyên cho tất cả người dùng)
  const settingsNavigation = [
    { name: 'Hồ sơ', to: '/profile', icon: User },
    { name: 'Đổi mật khẩu', to: '/change-password', icon: Key },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar chính */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 
          transform transition-all duration-300 ease-in-out
          ${open ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
          {open ? (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">MI</span>
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  InsectVision
                </span>
              </div>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                onClick={onClose}
                title="Thu gọn sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-sm font-bold">MI</span>
              </div>
              <button
                type="button"
                className="hidden lg:block p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded absolute -right-3 top-6 bg-white border border-gray-200 shadow-sm"
                onClick={onClose}
                title="Mở rộng sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation - Main Menu */}
        <nav className="mt-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center py-3 text-sm font-medium mx-2 rounded-lg transition-all group
                  ${isActive 
                    ? 'text-green-600 bg-green-50 border border-green-200' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }
                  ${open ? 'px-4' : 'px-3 justify-center'}
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                title={!open ? item.name : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {open && (
                  <span className="ml-3 whitespace-nowrap">{item.name}</span>
                )}
                
                {!open && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Navigation - Settings */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="space-y-1">
            {settingsNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center py-2 text-sm font-medium rounded-lg transition-all group
                    ${isActive 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }
                    ${open ? 'px-4' : 'px-3 justify-center'}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  title={!open ? item.name : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {open && (
                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                  )}
                  
                  {!open && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nút mở sidebar khi đã thu gọn */}
      {!open && window.innerWidth >= 1024 && (
        <button
          className="fixed left-5 top-20 z-20 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-md shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
          onClick={onClose}
          title="Mở rộng sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </>
  );
}