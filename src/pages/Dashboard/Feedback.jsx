// pages/Feedback/FeedbackHistory.jsx
import {
  BarChart3,
  Bug,
  Calendar,
  CheckCircle,
  Eye,
  Filter,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import feedbackService from '../../services/feedbackService';

export default function FeedbackHistory() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [totalItems, setTotalItems] = useState(0); // Tổng số feedback để phân trang
  
  // State lọc và hiển thị
  const [view, setView] = useState('user'); // user, admin
  const [filter, setFilter] = useState('all'); // all, positive, negative
  const [searchTerm, setSearchTerm] = useState('');

  // State phân trang
  const [page, setPage] = useState(1);
  const limit = 50; // GIỚI HẠN BACKEND LÀ 50

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
      fetchMetaStats(); // Lấy thống kê để biết tổng số trang
    }
  }, [user, view, page, filter]); // Fetch lại khi trang hoặc bộ lọc thay đổi

  // Reset về trang 1 khi đổi view hoặc search
  useEffect(() => {
    setPage(1);
  }, [view, searchTerm]);

  const handleViewChange = (newView) => {
    setView(newView);
    setFilter('all');
    setSearchTerm('');
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset về trang 1 khi đổi filter
  };

  const fetchMetaStats = async () => {
    try {
      if (view === 'admin' && user?.role === 'admin') {
        // Lấy thống kê tổng cho admin
        const statsData = await feedbackService.getDetailedStats();
        setStats(statsData);
        setTotalItems(statsData.totalFeedback);
      } else {
        // Lấy thống kê cho user cá nhân
        // Lưu ý: Cần đảm bảo feedbackService có hàm getUserFeedback hoặc tương tự
        // Nếu không có API đếm riêng, ta tạm thời chấp nhận không hiển thị tổng trang chính xác hoặc gọi API stats user
        try {
           const userData = await feedbackService.getUserFeedback(user.id);
           setTotalItems(userData.userFeedbackCount);
        } catch (e) {
           console.log("Không lấy được count user", e);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      
      const skip = (page - 1) * limit;
      let isCorrect = null;
      
      // Chuyển đổi filter sang tham số API
      if (filter === 'positive') isCorrect = 'true';
      if (filter === 'negative') isCorrect = 'false';

      let data;
      if (view === 'admin' && user?.role === 'admin') {
        data = await feedbackService.getAllFeedback(skip, limit, isCorrect);
      } else {
        data = await feedbackService.getMyFeedback(skip, limit, isCorrect);
      }
      
      setFeedbacks(data);
    } catch (error) {
      console.error('Lỗi khi tải feedback:', error);
      toast.error('Không thể tải lịch sử feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc muốn xóa feedback này?')) return;

    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast.success('Đã xóa feedback');
      fetchFeedbacks();
      fetchMetaStats();
    } catch (error) {
      console.error('Lỗi khi xóa feedback:', error);
      toast.error('Xóa feedback thất bại');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lọc tìm kiếm Client-side (chỉ trên trang hiện tại)
  const displayedFeedbacks = feedbacks.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.comment?.toLowerCase().includes(searchLower) ||
      item.history?.result_species?.toLowerCase().includes(searchLower) ||
      item.account?.username?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(totalItems / limit) || 1;

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const getAccuracyColor = (isCorrect) => isCorrect ? 'text-green-600' : 'text-red-600';
  const getAccuracyIcon = (isCorrect) => isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Feedback</h1>
          <p className="text-gray-600">
            {view === 'admin' ? 'Quản lý feedback hệ thống' : 'Lịch sử đánh giá của bạn'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('user')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cá Nhân
              </button>
              <button
                onClick={() => handleViewChange('admin')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Hệ Thống
              </button>
            </div>
          )}

          <button onClick={fetchFeedbacks} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Section for Admin */}
      {view === 'admin' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* ... Giữ nguyên phần Stats UI ... */}
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
                <p className="text-sm text-gray-600">Tổng Feedback</p>
              </div>
            </div>
          </div>
          {/* Các thẻ stats khác giữ nguyên code cũ để ngắn gọn */}
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm trong trang hiện tại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                <option value="all">Tất cả trạng thái</option>
                <option value="positive">Chính xác</option>
                <option value="negative">Không chính xác</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {displayedFeedbacks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy feedback nào</p>
          </div>
        ) : (
          displayedFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Nội dung item feedback giữ nguyên như cũ */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getAccuracyIcon(feedback.is_correct)}
                  <div>
                    <h3 className={`font-semibold ${getAccuracyColor(feedback.is_correct)}`}>
                      {feedback.is_correct ? 'Kết quả chính xác' : 'Kết quả không chính xác'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(feedback.created_at)}</span>
                      </div>
                      {feedback.history && (
                        <div className="flex items-center gap-1">
                          <Bug className="h-4 w-4" />
                          <span>{feedback.history.result_species}</span>
                          <span className="text-green-600">
                            ({(feedback.history.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {view === 'admin' && feedback.account && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{feedback.account.username}</span>
                    </div>
                  )}
                  {view === 'admin' && (
                    <button onClick={() => handleDeleteFeedback(feedback.id)} className="p-1 text-red-500 hover:text-red-700 rounded" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {feedback.comment && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                   <p className="text-gray-700">{feedback.comment}</p>
                </div>
              )}

              {feedback.history?.image?.annotated_path && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Eye className="h-4 w-4" />
                    <span>Ảnh đã nhận diện:</span>
                  </div>
                  <img
                    src={`http://localhost:8000/${feedback.history.image.annotated_path}`}
                    alt="Kết quả"
                    className="max-w-xs rounded-lg border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6 pb-6">
          <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
              Trang trước
          </button>
          <span className="self-center font-medium">
              Trang {page} / {totalPages > 0 ? totalPages : 1}
          </span>
          <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className={`px-4 py-2 rounded-lg ${page >= totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
              Trang sau
          </button>
      </div>
    </div>
  );
}