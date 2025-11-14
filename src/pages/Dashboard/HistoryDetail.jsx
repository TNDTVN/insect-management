import { AlertTriangle, ArrowLeft, BarChart3, Bug, Calendar, Heart, Shield, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth'; // Thêm để kiểm tra đăng nhập
import feedbackService from '../../services/feedbackService'; // Thêm import
import historyService from '../../services/historyService';
import speciesService from '../../services/speciesService';

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user
  const [detail, setDetail] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [speciesModalOpen, setSpeciesModalOpen] = useState(false);
  const [speciesInfo, setSpeciesInfo] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false); // Thêm: trạng thái modal feedback
  const [feedbackData, setFeedbackData] = useState({
    comment: '',
    is_correct: null,
  }); // Thêm: dữ liệu feedback

  const getPreviousPage = () => {
    // Kiểm tra nếu đến từ trang admin (DetectionHistory)
    if (location.state?.fromAdmin) {
      return '/detection-history';
    }
    // Mặc định quay về trang history của user
    return '/history';
  };

  const handleBack = () => {
    navigate(getPreviousPage());
  };

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  useEffect(() => {
    fetchHistoryDetail();
  }, [id]);

  const fetchHistoryDetail = async () => {
    try {
      setLoading(true);
      const response = await historyService.getImageDetail(id);
      setDetail(response.data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết lịch sử:', error);
      toast.error('Không thể tải chi tiết lịch sử');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSpeciesInfo = async (speciesName) => {
    try {
      setSelectedSpecies(speciesName);
      setSpeciesModalOpen(true);
      const speciesList = await speciesService.getAllSpecies(0, 100);
      const foundSpecies = speciesList.find(sp => 
        sp.name_en === speciesName || sp.name_vi?.includes(speciesName)
      );
      if (foundSpecies) {
        setSpeciesInfo(foundSpecies);
      } else {
        setSpeciesInfo(null);
        toast.info(`Chưa có thông tin chi tiết về loài ${speciesName}`);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin loài:', error);
      toast.error('Không thể tải thông tin loài');
    }
  };

  const closeSpeciesModal = () => {
    setSpeciesModalOpen(false);
    setSelectedSpecies(null);
    setSpeciesInfo(null);
  };

  // Thêm: Xử lý gửi feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi feedback');
      return;
    }

    // VALIDATION
    if (feedbackData.is_correct === null) {
      toast.error('Vui lòng chọn đánh giá chính xác');
      return;
    }

    if (!feedbackData.comment.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    setLoading(true);
    try {
      // Lấy image_id từ detail (detail từ endpoint /image/{image_id}/detail)
      // Đảm bảo detail có image_id
      const image_id = detail.image_id; 
      
      if (!image_id) {
        toast.error('Không tìm thấy thông tin ảnh');
        return;
      }

      await feedbackService.submit({
        image_id: image_id, // Gửi image_id thay vì history_id
        comment: feedbackData.comment.trim(),
        is_correct: feedbackData.is_correct,
      });
      
      toast.success('Gửi feedback thành công! Cảm ơn bạn đã đóng góp.');
      setFeedbackData({ comment: '', is_correct: null });
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi gửi feedback:', error);
      
      // HIỂN THỊ THÔNG BÁO LỖI CỤ THỂ
      const errorMessage = error.response?.data?.detail || 'Gửi feedback thất bại';
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy ảnh nhận diện');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền gửi feedback cho ảnh này');
      } else if (error.response?.status === 400) {
        toast.error('Bạn đã gửi feedback cho ảnh này rồi');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: name === 'is_correct' ? value === 'true' : value,
    }));
  };

  // Thêm: Mở modal feedback
  const openFeedbackModal = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi feedback');
      return;
    }
    setFeedbackModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thông tin lịch sử</p>
        <Link to="/history" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Quay lại lịch sử
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack} // SỬA THÀNH handleBack
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết nhận diện</h1>
            <p className="text-gray-600">
              Phát hiện {detail.total_detections} đối tượng - {detail.unique_species_count} loài
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(detail.created_at).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Ảnh đã nhận diện
            </h2>
            <div className="relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}
              <img
                src={`http://localhost:8000${detail.annotated_image_url}`}
                alt="Kết quả nhận diện"
                className={`w-full rounded-lg border border-gray-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                } transition-opacity duration-300`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  console.error('Không tải được ảnh nhận diện');
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh gốc</h2>
            <img
              src={`http://localhost:8000${detail.original_image_url}`}
              alt="Ảnh gốc"
              className="w-full rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Tổng quan
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{detail.total_detections}</div>
                <div className="text-sm text-blue-800">Tổng đối tượng</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {detail.unique_species_count}
                </div>
                <div className="text-sm text-green-800">Loài khác nhau</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bug className="h-5 w-5 text-purple-600" />
              Danh sách phát hiện
            </h2>
            <div className="space-y-4">
              {detail.detections.map((detection, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {detection.species_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Đối tượng #{index + 1}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(detection.detected_at).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Tên khoa học:</span>
                        <p className="text-gray-900">{detection.species_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Độ tin cậy:</span>
                        <p className="text-gray-900">{(detection.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Thời gian:</span>
                        <p className="text-gray-900">
                          {new Date(detection.detected_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Trạng thái:</span>
                        <p className="text-green-600 font-medium">Đã xác định</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => handleViewSpeciesInfo(detection.species_name)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      📖 Xem thông tin chi tiết về loài
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/detection-protected')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Nhận diện mới
              </button>
              <button
                onClick={handleBack} // SỬA THÀNH handleBack
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
              >
                Quay lại
              </button>
              {user && (
                <button
                  onClick={openFeedbackModal}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  Gửi feedback
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THÔNG TIN LOÀI */}
      {speciesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Thông tin loài: {selectedSpecies}
              </h3>
              <button
                onClick={closeSpeciesModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {speciesInfo ? (
                <div className="space-y-6">
                  {speciesInfo.image_path && (
                    <div className="flex justify-center">
                      <img
                        src={`http://localhost:8000/public/species_images/${speciesInfo.image_path}`}
                        alt={speciesInfo.name_vi}
                        className="max-w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tên tiếng Việt</h4>
                      <p className="text-gray-700">{speciesInfo.name_vi || 'Chưa có thông tin'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tên khoa học</h4>
                      <p className="text-gray-700 italic">{speciesInfo.name_en || 'Chưa có thông tin'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Bug className="h-5 w-5 text-blue-600" />
                      Mô tả
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {speciesInfo.description || 'Chưa có mô tả cho loài này.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Tác hại
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {speciesInfo.harm || 'Chưa có thông tin về tác hại.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-600" />
                      Lợi ích
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {speciesInfo.benefit || 'Chưa có thông tin về lợi ích.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Biện pháp phòng ngừa
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {speciesInfo.prevention || 'Chưa có thông tin về biện pháp phòng ngừa.'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Class ID:</span> {speciesInfo.class_id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bug className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Chưa có thông tin chi tiết về loài này</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Thông tin sẽ được cập nhật trong tương lai
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeSpeciesModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FEEDBACK */}
      {feedbackModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Đánh Giá Kết Quả</h3>
            </div>
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              {/* Accuracy Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Kết quả nhận diện có chính xác không?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="is_correct"
                      value="true"
                      checked={feedbackData.is_correct === true}
                      onChange={handleFeedbackChange}
                      className="sr-only"
                      required
                    />
                    <div className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                      feedbackData.is_correct === true 
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }`}>
                      <div className="w-6 h-6 mx-auto mb-2">
                        {feedbackData.is_correct === true ? (
                          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">Chính xác</span>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="is_correct"
                      value="false"
                      checked={feedbackData.is_correct === false}
                      onChange={handleFeedbackChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                      feedbackData.is_correct === false 
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
                        : 'border-gray-200 hover:border-red-300 text-gray-600'
                    }`}>
                      <div className="w-6 h-6 mx-auto mb-2">
                        {feedbackData.is_correct === false ? (
                          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">Không chính xác</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-3">
                  Nhận xét chi tiết
                  <span className="text-gray-500 font-normal ml-1">(tuỳ chọn)</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={feedbackData.comment}
                  onChange={handleFeedbackChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none placeholder-gray-400"
                  placeholder="Vui lòng chia sẻ thêm thông tin để chúng tôi cải thiện hệ thống..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Ví dụ: Loài côn trùng thực tế là gì? Độ tin cậy có phù hợp không?
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">
                      <strong>Feedback của bạn rất quan trọng!</strong> Giúp chúng tôi cải thiện độ chính xác của hệ thống nhận diện.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading || feedbackData.is_correct === null}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Gửi Đánh Giá</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}