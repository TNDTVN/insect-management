// pages/Species/SpeciesList.jsx
import { ArrowLeft, Bug, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import useAuth from '../../hooks/useAuth';
import speciesService from '../../services/speciesService';

const ITEMS_PER_PAGE = 12;

export default function SpeciesList() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [imageErrors, setImageErrors] = useState({}); // Quản lý lỗi ảnh
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecies();
    fetchSpeciesCount();
  }, [currentPage]);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const data = await speciesService.getDistinctSpecies(skip, ITEMS_PER_PAGE);
      setSpecies(data);
    } catch (error) {
      console.error('Failed to fetch species:', error);
      setSpecies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeciesCount = async () => {
    try {
      const count = await speciesService.getSpeciesCount(true);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to fetch species count:', error);
    }
  };

  const filteredSpecies = species.filter(sp =>
    sp?.name_vi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp?.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  // === UI CHO NGƯỜI CHƯA ĐĂNG NHẬP ===
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <PublicNavbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tất Cả Loài Côn Trùng</h1>
                <p className="text-gray-600">Khám phá {totalCount} loài côn trùng trong cơ sở dữ liệu</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm loài côn trùng theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
            </div>
          ) : (
            <>
              {/* Species Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredSpecies.map((sp) => {
                  const isError = imageErrors[sp.id] || false;

                  return (
                    <div
                      key={sp.id}
                      className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={
                            isError
                              ? placeholderImage
                              : `http://localhost:8000/public/species_images/${sp.image_path}`
                          }
                          alt={sp.name_vi}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={() => {
                            console.log(`Image failed: ${sp.image_path}`);
                            setImageErrors(prev => ({ ...prev, [sp.id]: true }));
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                          {sp.name_vi}
                        </h3>
                        <p className="text-sm text-gray-500 italic mb-2 line-clamp-1">
                          {sp.name_en}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {sp.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Class: {sp.class_id}
                          </span>
                          <button
                            onClick={() => navigate(`/species/${sp.id}`)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Không tìm thấy */}
              {filteredSpecies.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Bug className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Không tìm thấy loài côn trùng nào phù hợp</p>
                  <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>

                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // === UI CHO NGƯỜI ĐÃ ĐĂNG NHẬP (dùng Layout có sidebar) ===
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tất Cả Loài Côn Trùng</h1>
              <p className="text-gray-600">Khám phá {totalCount} loài côn trùng trong cơ sở dữ liệu</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm loài côn trùng theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            {/* Species Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredSpecies.map((sp) => {
                const isError = imageErrors[sp.id] || false;

                return (
                  <div
                    key={sp.id}
                    className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          isError
                            ? placeholderImage
                            : `http://localhost:8000/public/species_images/${sp.image_path}`
                        }
                        alt={sp.name_vi}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={() => {
                          console.log(`Image failed: ${sp.image_path}`);
                          setImageErrors(prev => ({ ...prev, [sp.id]: true }));
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                        {sp.name_vi}
                      </h3>
                      <p className="text-sm text-gray-500 italic mb-2 line-clamp-1">
                        {sp.name_en}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {sp.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Class: {sp.class_id}
                        </span>
                        <button
                          onClick={() => navigate(`/species/${sp.id}`)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Không tìm thấy */}
            {filteredSpecies.length === 0 && !loading && (
              <div className="text-center py-12">
                <Bug className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy loài côn trùng nào phù hợp</p>
                <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}