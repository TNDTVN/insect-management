// pages/Dashboard.jsx
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bug, Camera, CheckCircle, Cpu, History as HistoryIcon, LogIn, MessageSquare, Scan, Search, UserPlus, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import useAuth from '../../hooks/useAuth';
import speciesService from '../../services/speciesService';
import statisticsService from '../../services/statisticsService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user) {
          const data = await statisticsService.getDashboardStatistics();
          setStats(data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecies = async () => {
      try {
        setSpeciesLoading(true);
        // Gọi API lấy loài, Backend đã tự lọc theo Active Model
        // Lấy 12 loài để hiển thị trang chủ
        const data = await speciesService.getAllSpecies(0, 12);
        setSpecies(data);
      } catch (error) {
        console.error('Lỗi khi lấy loài:', error);
        setSpecies([]);
      } finally {
        setSpeciesLoading(false);
      }
    };

    fetchStats();
    // Luôn fetch species để hiển thị ở trang public (khi chưa login) hoặc phần danh sách loài bên dưới
    fetchSpecies();
  }, [user]);

  useEffect(() => {
    if (user && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleStartDetection = () => {
    if (user) {
      navigate('/detection-protected');
    } else {
      navigate('/detection');
    }
  };

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  const filteredSpecies = Array.isArray(species)
    ? species.filter((sp) =>
        sp?.name_vi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp?.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Card cho user thường
  const userCards = [
    {
      title: 'Tổng số lần nhận diện',
      value: stats?.totalDetections || 0,
      icon: Camera,
      color: 'bg-blue-500',
      link: '/detection-protected',
    },
    {
      title: 'Tháng này',
      value: stats?.monthlyDetections || 0,
      icon: HistoryIcon,
      color: 'bg-green-500',
      link: '/history',
    },
    {
      title: 'Số lượng phản hồi',
      value: stats?.totalFeedback || 0,
      icon: MessageSquare,
      color: 'bg-purple-500',
      link: '/feedback',
    },
  ];

  // Card cho admin
  const adminCards = [
    {
      title: 'Tổng số lần nhận diện',
      value: stats?.totalDetections || 0,
      icon: Camera,
      color: 'bg-blue-500',
      link: '/detection-history',
    },
    {
      title: 'Tổng số người dùng',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      link: '/user-management',
    },
    {
      title: 'Số lượng mô hình',
      value: stats?.modelCount || 0,
      icon: Cpu,
      color: 'bg-purple-500',
      link: '/model-management',
    },
    {
      title: 'Tổng số phản hồi',
      value: stats?.totalFeedback || 0,
      icon: MessageSquare,
      color: 'bg-indigo-500',
      link: '/feedback-management',
    },
    {
      title: 'Phản hồi tích cực',
      value: stats?.positiveFeedback || 0,
      icon: CheckCircle,
      color: 'bg-teal-500',
      link: '/feedback-management',
    },
    {
      title: 'Phản hồi tiêu cực',
      value: stats?.negativeFeedback || 0,
      icon: XCircle,
      color: 'bg-red-500',
      link: '/feedback-management',
    },
  ];

  const cards = user?.role === 'admin' ? adminCards : userCards;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent leading-[1.6]">
              MeKong InsectVision
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Hệ thống nhận diện côn trùng thông minh sử dụng mô hình máy học <br /> Phát hiện và phân loại các loài côn trùng một cách chính xác
            </p>
            
            <div className="max-w-md mx-auto mb-12">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-green-100 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bắt đầu nhận diện</h2>
                <p className="text-gray-600 mb-6">
                  Tải lên hình ảnh côn trùng và để mô hình phân tích, nhận diện loài côn trùng một cách chính xác
                </p>
                <button
                  onClick={handleStartDetection}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Scan className="h-5 w-5" />
                  Bắt đầu nhận diện
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Đăng nhập để lưu lịch sử và theo dõi kết quả
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Đăng ký
              </Link>
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bug className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Các Loài Côn Trùng</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Khám phá thông tin về các loài côn trùng có trong cơ sở dữ liệu của chúng tôi
              </p>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm loài côn trùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>

            {speciesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {filteredSpecies.map((sp) => {
                    const isError = imageErrors[sp.id] || false;
                    
                    return (
                      <div key={sp.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 overflow-hidden rounded-t-xl">
                          <img
                            src={isError ? placeholderImage : `http://localhost:8000/public/species_images/${sp.image_path}`}
                            alt={sp.name_vi}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.log(`❌ Hình ảnh không tải được: ${sp.image_path}`);
                              setImageErrors((prev) => ({ ...prev, [sp.id]: true }));
                            }}
                            onLoad={() => {
                              console.log(`✅ Hình ảnh tải thành công: ${sp.image_path}`);
                              setImageErrors((prev) => ({ ...prev, [sp.id]: false }));
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {sp.name_vi}
                          </h3>
                          <p className="text-sm text-gray-500 italic mb-3">
                            {sp.name_en}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {sp.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Lớp: {sp.class_id}
                            </span>
                            <button
                              onClick={() => navigate(`/species/${sp.id}`)}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredSpecies.length === 0 && !speciesLoading && (
                  <div className="text-center py-12">
                    <Bug className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Không tìm thấy loài côn trùng nào phù hợp</p>
                  </div>
                )}

                <div className="text-center">
                  <Link
                    to="/species"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <Bug className="h-5 w-5" />
                    Xem tất cả loài côn trùng
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhận diện thông minh</h3>
              <p className="text-gray-600">Sử dụng mô hình máy học để nhận diện và phân loại côn trùng với độ chính xác cao</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lịch sử phân tích</h3>
              <p className="text-gray-600">Theo dõi lịch sử nhận diện và kết quả phân tích qua thời gian</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phản hồi chi tiết</h3>
              <p className="text-gray-600">Nhận thông tin chi tiết và đặc điểm của từng loài côn trùng</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{user?.role === 'admin' ? 'Bảng điều khiển Admin' : 'Bảng điều khiển'}</h1>
        <button
          onClick={handleStartDetection}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
        >
          <Scan className="h-5 w-5" />
          Bắt đầu nhận diện
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {stats?.speciesData && stats.speciesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-80">
            <Bar 
              data={{
                labels: stats.speciesData.map((item) => item.name) || [],
                datasets: [
                  {
                    label: 'Số lần phát hiện',
                    data: stats.speciesData.map((item) => item.count) || [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: user?.role === 'admin' ? 'Phát hiện theo loài (Tất cả người dùng)' : 'Phát hiện theo loài',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {stats?.recentHistory && stats.recentHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {user?.role === 'admin' ? 'Lịch sử gần đây (Tất cả người dùng)' : 'Lịch sử gần đây'}
            </h2>
            <Link to={user?.role === 'admin' ? '/detection-history' : '/history'} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.recentHistory.map((item) => {
              const fullImageUrl = item.imageUrl
                ? `http://localhost:8000${item.imageUrl}`
                : placeholderImage;

              const objectCount = item.objectCount || 1;
              const speciesCount = item.speciesCount || 1;
              
              let displayTitle = item.species;
              if (speciesCount > 1) {
                displayTitle = `${item.species} (+${speciesCount - 1} loài) (${objectCount} đối tượng)`;
              } else if (objectCount > 1) {
                displayTitle = `${item.species} (${objectCount} đối tượng)`;
              }

              return (
                <div 
                    key={item.id} 
                    className="relative group cursor-pointer"
                    onClick={() => navigate(`/history/${item.imageId || item.id}`, {
                      state: { fromAdmin: user?.role === 'admin' }
                    })}
                  >
                  <img
                    src={fullImageUrl}
                    alt={`Phát hiện của ${displayTitle}`}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="font-medium">{displayTitle}</p>
                      {user?.role === 'admin' && (
                        <p className="text-sm">Người dùng: {item.username || 'Unknown'}</p>
                      )}
                      <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm">Độ tin cậy: {(item.confidence * 100).toFixed(1)}%</p>
                      <p className="text-xs mt-1">Nhấn để xem chi tiết</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}