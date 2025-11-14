import { ArrowLeft, Scan, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import detectionService from '../../services/detectionService';
import feedbackService from '../../services/feedbackService'; // Thêm import

export default function UploadImage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { historyId } = useParams(); // Lấy historyId nếu có từ URL

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setError('');
    }
  };

  const handleDetection = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError('');
    setDetectionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      let response;
      if (user) {
        response = await detectionService.detect(formData);
      } else {
        response = await detectionService.detectPreview(formData);
      }

      setDetectionResult(response.data);

      if (user) {
        toast.success('Kết quả đã được lưu vào lịch sử!');
      }
    } catch (error) {
      console.error('Lỗi nhận diện:', error);

      let errorMessage = 'Có lỗi xảy ra khi nhận diện. Vui lòng thử lại với ảnh khác.';

      if (error.response) {
        const { status, data } = error.response;
        if (status === 422 && Array.isArray(data.detail)) {
          errorMessage = data.detail.map(d => `${d.loc.join(' → ')}: ${d.msg}`).join('; ');
        } else if (status === 422 && typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        } else if (status === 404) {
          errorMessage = 'Không tìm thấy mô hình nhận diện.';
        } else if (status === 400) {
          errorMessage = data.detail || 'Không phát hiện được côn trùng trong ảnh.';
        } else {
          errorMessage = data.message || data.detail || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra mạng.';
      } else {
        errorMessage = 'Lỗi không xác định.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setError('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setDetectionResult(null);
    setError('');
  };

  const getBackRoute = () => {
    return user ? '/dashboard' : '/';
  };

  // Thêm: Xử lý gửi feedback
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    comment: '',
    is_correct: null,
  });

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

    setIsProcessing(true);
    try {
      // SỬA: Gửi image_id từ detectionResult.id
      await feedbackService.submit({
        image_id: detectionResult.id, // detectionResult.id là image_id
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
      setIsProcessing(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: name === 'is_correct' ? value === 'true' : value,
    }));
  };

  const openFeedbackModal = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi feedback');
      return;
    }
    if (!detectionResult?.id) {
      toast.error('Vui lòng nhận diện trước khi gửi feedback');
      return;
    }
    setFeedbackModalOpen(true);
  };

  return (
    <div className={`space-y-6 ${user ? 'py-6' : 'min-h-screen bg-gradient-to-br from-green-50 to-emerald-100'}`}>
      {!user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  MeKong InsectVision
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={user ? 'container mx-auto px-4' : 'container mx-auto px-4 py-8'}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to={getBackRoute()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nhận diện côn trùng</h1>
              <p className="text-gray-600">Tải lên hình ảnh côn trùng để nhận diện loài</p>
            </div>
          </div>

          {!user && (
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Đăng nhập để lưu kết quả
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tải lên hình ảnh</h2>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                previewUrl
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
              }`}
              onClick={() => document.getElementById('image-upload').click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto h-48 object-cover rounded-lg"
                  />
                  <p className="text-green-600 font-medium">Ảnh đã được chọn</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetDetection();
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Click để tải lên</span> hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Hỗ trợ: JPG, PNG, JPEG (tối đa 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleDetection}
              disabled={!selectedImage || isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Scan className="h-5 w-5" />
                  <span>
                    {user ? 'Nhận diện và lưu kết quả' : 'Nhận diện miễn phí'}
                  </span>
                </>
              )}
            </button>

            {user && (
              <div className="mt-3 text-center">
                <p className="text-sm text-green-600">
                  Kết quả sẽ được lưu tự động vào lịch sử
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kết quả nhận diện</h2>

            {detectionResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ảnh đã nhận diện</h3>
                  {detectionResult.annotated_image_url ? (
                    <img
                      src={`http://localhost:8000${detectionResult.annotated_image_url}`}
                      alt="Kết quả nhận diện"
                      className="w-full rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = previewUrl;
                        console.error('Không tải được ảnh nhận diện:', detectionResult.annotated_image_url);
                      }}
                    />
                  ) : (
                    <p className="text-red-500 text-sm">Không có ảnh nhận diện</p>
                  )}
                </div>

                {detectionResult.detections && detectionResult.detections.length > 0 ? (
                  detectionResult.detections.map((detection, index) => (
                    <div key={index} className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Phát hiện #{index + 1}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Tên tiếng Việt:</span>
                          <span className="font-medium text-gray-900 text-right">
                            {detection.name_vi || detection.species_info?.name_vi}
                          </span>
                        </div>

                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Tên khoa học:</span>
                          <span className="font-medium text-gray-900 text-right">
                            {detection.name_en || detection.species_info?.name_en}
                          </span>
                        </div>

                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Độ tin cậy:</span>
                          <span className="font-medium text-green-600">
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Mô tả:</h4>
                          <p className="text-gray-700 text-sm">
                            {detection.description || detection.species_info?.description || 'Không có'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tác hại:</h4>
                          <p className="text-gray-700 text-sm">
                            {detection.harm || detection.species_info?.harm || 'Không có'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Lợi ích:</h4>
                          <p className="text-gray-700 text-sm">
                            {detection.benefit || detection.species_info?.benefit || 'Không có'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Biện pháp phòng ngừa:</h4>
                          <p className="text-gray-700 text-sm">
                            {detection.prevention || detection.species_info?.prevention || 'Không có'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">Không phát hiện côn trùng nào.</p>
                )}

                {user && detectionResult && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">Kết quả đã được lưu!</p>
                          <p className="text-green-600 text-sm">Xem lịch sử để theo dõi tất cả kết quả</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to="/history" 
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Xem Lịch Sử
                        </Link>
                        <button
                          onClick={openFeedbackModal}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Đánh Giá
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-sm">
                      <strong>Lưu ý:</strong> Kết quả này không được lưu.{' '}
                      <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Đăng nhập
                      </Link>{' '}
                      để lưu kết quả và xem lịch sử.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Scan className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Kết quả sẽ hiển thị ở đây sau khi nhận diện</p>
                {!user && (
                  <p className="text-sm text-gray-400 mt-2">
                    Nhận diện miễn phí - Đăng nhập để lưu kết quả
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
                  disabled={isProcessing || feedbackData.is_correct === null}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
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