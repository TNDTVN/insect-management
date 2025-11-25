// src/pages/Dashboard/History.jsx
import { Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import historyService from '../../services/historyService';

export default function History() {
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [objectCounts, setObjectCounts] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 100; // Khớp với Backend limit (<= 100)

  // Fetch dữ liệu khi page hoặc user thay đổi
  useEffect(() => {
    if (user) {
        // Đảm bảo page >= 1
        if (page < 1) setPage(1);
        else {
            fetchHistory();
            // Chỉ fetch total count một lần hoặc khi user đổi, 
            // nhưng để đơn giản ta gọi luôn ở đây để đồng bộ
            fetchTotalCount();
        }
    }
  }, [page, user]);

  // Load object counts khi history thay đổi
  useEffect(() => {
    if (history.length > 0) {
        const fetchCounts = async () => {
            const imageIds = history.map(item => item.image_id).filter(Boolean);
            if (imageIds.length > 0) {
                try {
                    const counts = await historyService.getObjectCounts(imageIds);
                    setObjectCounts(prev => ({ ...prev, ...counts }));
                } catch (error) {
                    console.error("Lỗi tải count:", error);
                }
            }
        };
        fetchCounts();
    }
  }, [history]);

  const fetchTotalCount = async () => {
    try {
        if (!user?.id) return;
        const res = await historyService.getHistoryCount(user.id);
        setTotalItems(res.total);
    } catch (error) {
        console.error("Không lấy được tổng số lịch sử", error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Đảm bảo skip không bao giờ âm
      const safePage = Math.max(1, page); 
      const skip = (safePage - 1) * limit;

      const data = await historyService.getAll(skip, limit, user?.id);
      
      const uniqueItems = [];
      const seenImageIds = new Set();
      const listData = Array.isArray(data) ? data : (data.items || []);

      for (const item of listData) {
        if (!seenImageIds.has(item.image_id)) {
          seenImageIds.add(item.image_id);
          uniqueItems.push(item);
        }
      }

      setHistory(uniqueItems);
    } catch (error) {
      console.error(error);
      toast.error('Không tải được lịch sử');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản ghi này?')) return
    try {
      await historyService.delete(id)
      toast.success('Đã xóa!')
      fetchHistory()
      fetchTotalCount()
    } catch (error) {
      toast.error('Xóa thất bại')
    }
  }

  // Client-side filtering (trên 100 item hiện tại)
  const filteredHistory = history.filter(item => {
      if (!searchTerm) return true;
      return item.result_species?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Hàm điều khiển trang giống các trang khác
  const handlePrevPage = () => {
      if (page > 1) setPage(prev => prev - 1);
  };

  const handleNextPage = () => {
      if (page < totalPages) setPage(prev => prev + 1);
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử nhận diện</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
            type="text"
            placeholder="Tìm kiếm tên loài (trong trang hiện tại)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Không tìm thấy dữ liệu</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHistory.map((item) => {
            const objectCount = item.object_count || objectCounts[item.image_id] || 1;
            const speciesCount = item.species_count || 1;
            
            let displayTitle = item.result_species;
            if (speciesCount > 1) {
              displayTitle = `${item.result_species} (+${speciesCount - 1} loài) (${objectCount} đối tượng)`;
            } else if (objectCount > 1) {
              displayTitle = `${item.result_species} (${objectCount} đối tượng)`;
            }

            let imgSrc = placeholderImage;
            if (item.image?.annotated_path) {
              let path = item.image.annotated_path.replace(/\\/g, '/');
              if (path.startsWith('public/')) path = path.substring(7);
              imgSrc = `http://localhost:8000/public/${path}`;
            }

            return (
              <div 
                key={item.image_id} 
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => navigate(`/history/${item.image_id}`)}
              >
                <div className="relative">
                  <img
                    src={imgSrc}
                    alt={displayTitle}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.src = placeholderImage; }}
                  />
                  {(objectCount > 1 || speciesCount > 1) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {speciesCount > 1 ? `${speciesCount} loài` : `${objectCount} đ.tượng`}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate" title={displayTitle}>
                      {displayTitle}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Độ tin cậy: {(item.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.detected_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            );
          })}
          </div>

          {/* SỬA: Giao diện phân trang đồng bộ với FeedbackHistory */}
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
        </>
      )}
    </div>
  )
}