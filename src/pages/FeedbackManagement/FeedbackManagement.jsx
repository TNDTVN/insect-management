// pages/FeedbackManagement/FeedbackManagement.jsx
import {
    Calendar,
    CheckCircle,
    Download,
    Eye,
    MessageCircle,
    RefreshCw,
    Search,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import feedbackService from '../../services/feedbackService';
import userService from '../../services/userService';

export default function FeedbackManagement() {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccuracy, setFilterAccuracy] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1); // Thêm state cho trang hiện tại
    const limit = 50; // Giới hạn mỗi trang

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchFeedbacks(),
                    fetchUsers(),
                    fetchStats()
                ]);
            } catch (error) {
                console.error('❌ Error initializing data:', error);
                toast.error('Lỗi khi khởi tạo dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [filterAccuracy, filterUser, page]); // Thêm page và filterUser vào dependency

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching feedbacks with filter:', filterAccuracy, 'page:', page);

            let isCorrectParam = null;
            if (filterAccuracy === 'positive') {
                isCorrectParam = true;
            } else if (filterAccuracy === 'negative') {
                isCorrectParam = false;
            }

            console.log('📊 isCorrectParam:', isCorrectParam, 'type:', typeof isCorrectParam);
            const skip = (page - 1) * limit;
            const data = await feedbackService.getAllFeedback(skip, limit, isCorrectParam);
            console.log('✅ Feedbacks fetched:', data);
            setFeedbacks(data);
        } catch (error) {
            console.error('❌ Error fetching feedbacks:', error);
            toast.error(`Lỗi khi tải danh sách feedback: ${error.response?.data?.detail || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            console.log('🔄 Fetching users...');
            const userData = await userService.getAllUsers();
            console.log('✅ Users fetched:', userData);
            setUsers(userData);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            toast.error('Lỗi khi tải danh sách người dùng');
        }
    };

    const fetchStats = async () => {
        try {
            console.log('🔄 Fetching stats...');
            const statsData = await feedbackService.getDetailedStats();
            console.log('✅ Stats fetched:', statsData);
            setStats(statsData);
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            toast.error('Lỗi khi tải thống kê');
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Bạn có chắc muốn xóa feedback này?')) {
            return;
        }

        try {
            await feedbackService.deleteFeedback(feedbackId);
            toast.success('Đã xóa feedback');
            await Promise.all([fetchFeedbacks(), fetchStats()]);
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error('Lỗi khi xóa feedback');
        }
    };

    const handleExport = async () => {
    try {
        const data = await feedbackService.exportFeedback();
        console.log('Export data received:', data); // Log dữ liệu nhận được
        if (!data || data.length === 0) {
        toast.warn('Không có dữ liệu feedback để xuất.');
        return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Đã xuất dữ liệu feedback');
    } catch (error) {
        console.error('Error exporting feedback:', error);
        console.error('Error details:', error.response?.data);
        toast.error('Lỗi khi xuất dữ liệu');
    }
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        const matchesSearch =
            feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.history?.result_species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.account?.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUser = filterUser === 'all' || feedback.account_id === filterUser;

        return matchesSearch && matchesUser;
    });

    const handleNextPage = () => {
        setPage(prev => prev + 1);
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Feedback</h1>
                    <p className="text-gray-600">Quản lý toàn bộ feedback trong hệ thống</p>
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
                        onClick={fetchFeedbacks}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Tổng feedback: {stats.totalFeedback}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Feedback tích cực: {stats.positiveFeedback}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Feedback tiêu cực: {stats.negativeFeedback}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Feedback có bình luận: {stats.feedbackWithComments}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Feedback gần đây: {stats.recentFeedback}</p>
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
                                placeholder="Tìm kiếm theo bình luận, loài, người dùng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={filterAccuracy}
                            onChange={(e) => {
                                console.log('🎛️ Filter accuracy changed:', e.target.value);
                                setFilterAccuracy(e.target.value);
                                setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả độ chính xác</option>
                            <option value="positive">Chính xác</option>
                            <option value="negative">Không chính xác</option>
                        </select>

                        <select
                            value={filterUser}
                            onChange={(e) => {
                                setFilterUser(e.target.value);
                                setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                            }}
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

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedbacks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Không tìm thấy feedback nào</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Hiện tại hệ thống chưa có feedback nào hoặc bộ lọc không phù hợp
                        </p>
                    </div>
                ) : (
                    filteredFeedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    {feedback.is_correct ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    )}
                                    <div>
                                        <h3 className={`font-semibold ${
                                            feedback.is_correct ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {feedback.is_correct ? 'Kết quả chính xác' : 'Kết quả không chính xác'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>{feedback.account?.username}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(feedback.created_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {feedback.history && (
                                                <div className="flex items-center gap-1">
                                                    <span>Loài: {feedback.history.result_species}</span>
                                                    <span className="text-green-600">
                                                        ({(feedback.history.confidence * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {feedback.history?.image_id ? (
                                        <button
                                            onClick={() => navigate(`/history/${feedback.history.image_id}`)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Xem chi tiết nhận diện"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="text-gray-400 p-1 cursor-not-allowed"
                                            title="Không có chi tiết nhận diện"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteFeedback(feedback.id)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Xóa feedback"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
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
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    Trang trước
                </button>
                <span className="self-center">Trang {page}</span>
                <button
                    onClick={handleNextPage}
                    disabled={filteredFeedbacks.length < limit} // Vô hiệu hóa nếu không còn dữ liệu
                    className={`px-4 py-2 rounded-lg ${filteredFeedbacks.length < limit ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}