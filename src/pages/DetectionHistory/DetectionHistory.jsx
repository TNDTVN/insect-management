// pages/DetectionHistory/DetectionHistory.jsx
import {
  BarChart3,
  Bug,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import historyService from '../../services/historyService';
import userService from '../../services/userService';

export default function DetectionHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  
  // State dữ liệu phụ
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  // --- STATE PHÂN TRANG CLIENT-SIDE ---
  const [page, setPage] = useState(1);
  const limit = 10; // Giới hạn số dòng mỗi trang (có thể chỉnh lên 20 hoặc 50)

  useEffect(() => {
    fetchDetectionHistory();
    fetchUsers();
    fetchStats();
  }, []);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterUser]);

  const fetchDetectionHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getAdminHistory();
      
      const groupedByImage = {};
      data.forEach(item => {
        if (!groupedByImage[item.image_id]) {
          groupedByImage[item.image_id] = {
            ...item, 
            total_objects: 0,
            unique_species: new Set(),
            all_detections: []
          };
        }
        
        groupedByImage[item.image_id].total_objects += 1;
        groupedByImage[item.image_id].unique_species.add(item.result_species);
        groupedByImage[item.image_id].all_detections.push(item);
      });

      const uniqueImages = Object.values(groupedByImage).map(imageGroup => ({
        ...imageGroup,
        unique_species_count: imageGroup.unique_species.size,
        result_species: Array.from(imageGroup.unique_species).join(', '),
        confidence: imageGroup.all_detections[0]?.confidence || 0,
        detected_at: imageGroup.all_detections[0]?.detected_at,
        account: imageGroup.account
      }));

      console.log('📊 Grouped history data:', uniqueImages);
      setHistory(uniqueImages);
    } catch (error) {
      console.error('Error fetching detection history:', error);
      toast.error('Lỗi khi tải lịch sử nhận diện');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const userData = await userService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await historyService.getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử nhận diện cho ảnh này?')) {
      return;
    }

    try {
      await historyService.deleteImageHistory(imageId);
      toast.success('Đã xóa lịch sử nhận diện');
      fetchDetectionHistory();
      fetchStats();
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error('Lỗi khi xóa lịch sử');
    }
  };

  const handleExport = async () => {
    try {
      const data = await historyService.exportHistory();
      if (!data || data.length === 0) {
        toast.warn('Không có dữ liệu lịch sử để xuất.');
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `detection-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã xuất dữ liệu lịch sử');
    } catch (error) {
      console.error('Error exporting history:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    }
  };

  // 1. Lọc dữ liệu tổng (Search + Filter)
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.result_species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.account?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || item.account_id === filterUser;

    return matchesSearch && matchesUser;
  });

  // 2. Tính toán phân trang Client-side
  const totalPages = Math.ceil(filteredHistory.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limit);

  // 3. Hàm điều khiển trang
  const handleNextPage = () => {
    if (page < totalPages) {
        setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
        setPage(prev => prev - 1);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử Nhận diện Hệ thống</h1>
          <p className="text-gray-600">Quản lý toàn bộ lịch sử nhận diện trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Xuất dữ liệu
          </button>
          <button
            onClick={fetchDetectionHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDetections}</p>
                <p className="text-sm text-gray-600">Tổng đối tượng</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Người dùng</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bug className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpecies}</p>
                <p className="text-sm text-gray-600">Loài khác nhau</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDetections}</p>
                <p className="text-sm text-gray-600">Hôm nay</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo loài, người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả người dùng</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kết quả nhận diện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* SỬA: Map qua paginatedHistory thay vì filteredHistory */}
              {paginatedHistory.map((item) => (
                <tr key={item.image_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image?.annotated_path ? (
                      <img
                        src={`http://localhost:8000/${item.image.annotated_path}`}
                        alt="Kết quả nhận diện"
                        className="h-12 w-12 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'h-12 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center';
                          placeholder.innerHTML = '<Eye className="h-5 w-5 text-gray-400" />';
                          e.target.parentNode.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.unique_species_count > 1 
                        ? `${item.unique_species_count} loài` 
                        : item.result_species}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.total_objects} đối tượng
                    </div>
                    {item.confidence && (
                      <div className="text-sm text-gray-500">
                        Độ tin cậy: {(item.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.account?.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.account?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.detected_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/history/${item.image_id}`, { 
                            state: { fromAdmin: true } 
                        })}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                        >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.image_id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa lịch sử"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy lịch sử nhận diện nào</p>
          </div>
        )}
      </div>

      {/* Pagination Controls - THÊM MỚI */}
      {filteredHistory.length > 0 && (
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
    </div>
  );
}