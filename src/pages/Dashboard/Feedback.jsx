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
  const [filter, setFilter] = useState('all'); // all, positive, negative
  const [view, setView] = useState('user'); // user, admin

  useEffect(() => {
    fetchFeedbacks();
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user, filter, view]);

  useEffect(() => {
    console.log('Feedbacks data:', feedbacks);
    feedbacks.forEach((feedback, index) => {
      console.log(`Feedback ${index}:`, { id: feedback.id, is_correct: feedback.is_correct });
      if (feedback.history?.image) {
        console.log(`Feedback ${index} image path:`, {
          annotated_path: feedback.history.image.annotated_path,
          full_url: `http://localhost:8000/${feedback.history.image.annotated_path}`
        });
      }
    });
  }, [feedbacks]);

  const handleViewChange = (newView) => {
    setView(newView);
    setFilter('all'); // Reset filter khi đổi view
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    toast.info(`Đã áp dụng bộ lọc: ${newFilter === 'all' ? 'Tất cả' : newFilter === 'positive' ? 'Chính xác' : 'Không chính xác'}`);
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let data;
      let isCorrect;
      
      // SỬA: XỬ LÝ FILTER ĐÚNG CÁCH
      if (filter === 'all') {
        isCorrect = null;
      } else if (filter === 'positive') {
        isCorrect = true;
      } else if (filter === 'negative') {
        isCorrect = false;
      }
      
      console.log('Fetching feedbacks with filter:', { 
        view, 
        filter, 
        isCorrect, 
        isCorrectType: typeof isCorrect 
      });
      
      if (view === 'admin' && user?.role === 'admin') {
        data = await feedbackService.getAllFeedback(0, 50, isCorrect);
      } else {
        data = await feedbackService.getMyFeedback(0, 50, isCorrect);
      }
      
      console.log('API response:', data);
      setFeedbacks(data);
    } catch (error) {
      console.error('Lỗi khi tải feedback:', error);
      toast.error('Không thể tải lịch sử feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await feedbackService.getDetailedStats();
      setStats(data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc muốn xóa feedback này?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      toast.success('Đã xóa feedback');
      fetchFeedbacks();
      if (user?.role === 'admin') {
        fetchStats();
      }
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

  const getAccuracyColor = (isCorrect) => {
    return isCorrect ? 'text-green-600' : 'text-red-600';
  };

  const getAccuracyIcon = (isCorrect) => {
    return isCorrect ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Feedback</h1>
          <p className="text-gray-600">
            {view === 'admin' ? 'Quản lý feedback hệ thống' : 'Lịch sử đánh giá của bạn'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('user')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'user' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cá Nhân
              </button>
              <button
                onClick={() => handleViewChange('admin')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'admin' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hệ Thống
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="positive">Chính xác</option>
              <option value="negative">Không chính xác</option>
            </select>
          </div>

          <button
            onClick={fetchFeedbacks}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {view === 'admin' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.positiveFeedback}</p>
                <p className="text-sm text-gray-600">Chính xác</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.negativeFeedback}</p>
                <p className="text-sm text-gray-600">Không chính xác</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.feedbackWithComments}</p>
                <p className="text-sm text-gray-600">Có bình luận</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Chưa có feedback nào</p>
            <p className="text-sm text-gray-400 mt-2">
              {view === 'admin' ? 'Hệ thống chưa nhận được feedback nào' : 'Bạn chưa gửi feedback nào'}
            </p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

                  <div className="flex items-center gap-1">
                    {view === 'admin' && (
                      <button
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Xóa feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {feedback.comment && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                    </div>
                  </div>
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
                    alt="Kết quả nhận diện"
                    className="max-w-xs rounded-lg border border-gray-200"
                    onError={(e) => {
                      console.error('Không tải được ảnh:', feedback.history.image.annotated_path);
                      e.target.style.display = 'none';
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm';
                      fallbackDiv.innerHTML = '🖼️ Không thể tải ảnh<br><span class="text-xs">' + feedback.history.image.annotated_path + '</span>';
                      e.target.parentNode.appendChild(fallbackDiv);
                    }}
                    onLoad={() => console.log('Ảnh loaded:', feedback.history.image.annotated_path)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}