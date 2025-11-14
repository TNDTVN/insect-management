// History/History.jsx
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import historyService from '../../services/historyService';

export default function History() {
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [objectCounts, setObjectCounts] = useState({});
  const limit = 12;

  useEffect(() => {
    fetchHistory();
  }, [page, user]); // Thêm user vào dependency array

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Truyền user.id vào historyService.getAll nếu user tồn tại
      const data = await historyService.getAll(page, limit, user?.id);
      console.log("History API Response:", data);

      const uniqueItems = [];
      const seenImageIds = new Set();
      for (const item of data.items) {
        if (!seenImageIds.has(item.image_id)) {
          seenImageIds.add(item.image_id);
          uniqueItems.push(item);
        }
      }

      setHistory(uniqueItems);
      setTotalPages(Math.ceil(data.total / limit));

      const imageIds = uniqueItems.map(item => item.image_id).filter(Boolean);
      if (imageIds.length > 0) {
        const counts = await historyService.getObjectCounts(imageIds);
        setObjectCounts(counts);
      }
    } catch (error) {
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
    } catch (error) {
      toast.error('Xóa thất bại')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900">Lịch sử nhận diện</h1>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Chưa có dữ liệu</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item) => {
            const objectCount = item.object_count || objectCounts[item.image_id] || 1;
            const speciesCount = item.species_count || 1;
            
            // TÍNH TOÁN TÊN HIỂN THỊ - LOGIC MỚI
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
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}