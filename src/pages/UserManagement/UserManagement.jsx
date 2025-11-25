// src/pages/UserManagement.jsx
import {
  Calendar,
  Camera,
  Check,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../../services/userService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State cho Modal và chỉnh sửa
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    email: '',
    username: '',
    role: 'user',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- STATE PHÂN TRANG (THÊM MỚI) ---
  const [page, setPage] = useState(1);
  const limit = 10; // Giới hạn 10 user mỗi trang

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset về trang 1 khi thay đổi bộ lọc (THÊM MỚI)
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId, activate) => {
    try {
      await userService.updateUserStatus(userId, activate);
      toast.success(`Đã ${activate ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.detail || 'Lỗi khi cập nhật trạng thái người dùng');
    }
  };

  const handleEditUser = (user) => {
    console.log('Editing user:', user);
    setSelectedUser(user);
    
    setEditFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      date_of_birth: user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split('T')[0]
        : '',
      address: user.address || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'user',
    });
    
    setAvatarPreview(user.avatar_url ? `http://localhost:8000/${user.avatar_url}` : '');
    setAvatarFile(null);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'username') {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarFile(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      await userService.deleteUserAvatar(selectedUser.id);
      setAvatarPreview('');
      setAvatarFile(null);
      toast.success('Đã xóa ảnh đại diện');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Xóa ảnh đại diện thất bại');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const updateData = {
        full_name: editFormData.full_name,
        phone_number: editFormData.phone_number,
        date_of_birth: editFormData.date_of_birth,
        address: editFormData.address,
        email: editFormData.email,
        // XÓA DÒNG NÀY: role: editFormData.role, 
        avatar: avatarFile,
      };

      // THÊM ĐOẠN NÀY: Chỉ gửi role nếu giá trị bị thay đổi
      // Nếu role mới khác role cũ thì mới thêm vào updateData
      if (editFormData.role !== selectedUser.role) {
          updateData.role = editFormData.role;
      }

      console.log('Submitting update data:', updateData);
      await userService.updateUser(selectedUser.id, updateData);
      toast.success('Cập nhật thông tin người dùng thành công');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.detail || 'Cập nhật thông tin người dùng thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const stats = await userService.getUserStats(userId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setUserStats({
        detection_count: 0,
        feedback_count: 0,
        image_count: 0,
        recent_activity: 0,
      });
    }
  };

  const handleViewUserDetail = async (user) => {
    setSelectedUser(user);
    await fetchUserStats(user.id);
    setShowUserDetail(true);
  };

  // 1. Lọc dữ liệu tổng
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 2. Tính toán phân trang (THÊM MỚI)
  const totalPages = Math.ceil(filteredUsers.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

  // 3. Hàm điều khiển trang (THÊM MỚI)
  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin').length,
    verified: users.filter((u) => u.is_verified).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-sm text-gray-600">Quản trị viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              <p className="text-sm text-gray-600">Đã xác thực</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="user">Người dùng</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sử dụng paginatedUsers thay vì filteredUsers */}
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost:8000/${user.avatar_url}`}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Chưa cập nhật'}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone_number || 'Chưa cập nhật'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.address || 'Chưa cập nhật'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUserDetail(user)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {user.role !== 'admin' ? (
                        user.is_active ? (
                          <button
                            onClick={() => handleActivateUser(user.id, false)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Vô hiệu hóa"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id, true)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Kích hoạt"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )
                      ) : (
                        <button
                          className="text-gray-400 p-1 cursor-not-allowed"
                          title="Không thể thay đổi trạng thái admin"
                          disabled
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Chỉnh sửa người dùng"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {/* Pagination Controls - THÊM MỚI */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-center gap-4 mt-6 pb-6">
            <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                Trang trước
            </button>
            <span className="self-center">
                Trang {page} / {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded-lg ${page >= totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                Trang sau
            </button>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa Người dùng</h2>
                  <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin cho @{selectedUser.username}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="relative group w-24 h-24">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <UserCheck className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay buttons - chỉ hiện khi hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden group-hover:flex">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-colors"
                          title="Đổi ảnh"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-colors"
                            title="Xóa ảnh"
                          >
                            <X className="h-4 w-4 text-white" />
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
                  
                  <p className="text-xs text-gray-500 text-center">
                    Ảnh phải nhỏ hơn 5MB. Định dạng: JPG, PNG, GIF
                  </p>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={editFormData.username}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={editFormData.full_name}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone_number" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={editFormData.phone_number}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0123 456 789"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={editFormData.date_of_birth}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Vai trò
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>

                {/* Address - Full Width */}
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditFormChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Nhập địa chỉ đầy đủ..."
                  />
                </div>
              </form>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
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
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chi tiết Người dùng</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              {selectedUser.avatar_url ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={`http://localhost:8000/${selectedUser.avatar_url}`}
                  alt="Avatar"
                  onError={(e) => { e.target.src = '/path/to/fallback-image.jpg'; }}
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.full_name || 'Chưa cập nhật'}
                </h3>
                <p className="text-gray-600">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Thông tin liên hệ</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{selectedUser.email || 'Chưa cập nhật'}</span>
                  </div>
                  {selectedUser.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{selectedUser.phone_number}</span>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Trạng thái</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tài khoản:</span>
                    <span
                      className={`text-sm font-medium ${
                        selectedUser.is_active ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {selectedUser.is_active ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Xác thực:</span>
                    <span
                      className={`text-sm font-medium ${
                        selectedUser.is_verified ? 'text-blue-600' : 'text-yellow-600'
                      }`}
                    >
                      {selectedUser.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ngày tham gia:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Thông tin bổ sung</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {selectedUser.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Sinh nhật:{' '}
                      {new Date(selectedUser.date_of_birth).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {selectedUser.full_name && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Họ tên: {selectedUser.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            {userStats && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thống kê</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{userStats.detection_count}</div>
                    <div className="text-xs text-blue-800">Lần nhận diện</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{userStats.feedback_count}</div>
                    <div className="text-xs text-green-800">Feedback</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{userStats.image_count}</div>
                    <div className="text-xs text-purple-800">Ảnh đã upload</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{userStats.recent_activity}</div>
                    <div className="text-xs text-orange-800">Hoạt động (30 ngày)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowUserDetail(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}