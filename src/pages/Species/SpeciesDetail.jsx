// pages/Species/SpeciesDetail.jsx
import { AlertTriangle, ArrowLeft, Bug, Heart, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import useAuth from '../../hooks/useAuth';
import speciesService from '../../services/speciesService';

export default function SpeciesDetail() {
  const { id } = useParams();
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecies();
  }, [id]);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      const data = await speciesService.getSpeciesById(id);
      setSpecies(data);
    } catch (error) {
      console.error('Failed to fetch species details:', error);
      setSpecies(null);
    } finally {
      setLoading(false);
    }
  };

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTZhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <PublicNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <Bug className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy loài côn trùng</h1>
          <p className="text-gray-600 mb-4">Loài côn trùng bạn đang tìm kiếm không tồn tại.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {!user && <PublicNavbar />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            to="/species"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tất cả loài côn trùng
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 truncate">{species.name_vi}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
              <img
                src={imageError ? placeholderImage : `http://localhost:8000/public/species_images/${species.image_path}`}
                alt={species.name_vi}
                className="w-full h-96 object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {species.name_vi}
              </h1>
              <p className="text-xl text-gray-600 italic mb-4">
                {species.name_en}
              </p>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Class: {species.class_id}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">
                {species.description || 'Chưa có mô tả cho loài côn trùng này.'}
              </p>
            </div>

            {/* Harm Section */}
            {species.harm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-900">Tác hại</h3>
                </div>
                <p className="text-red-800">{species.harm}</p>
              </div>
            )}

            {/* Benefit Section */}
            {species.benefit && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Heart className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">Lợi ích</h3>
                </div>
                <p className="text-green-800">{species.benefit}</p>
              </div>
            )}

            {/* Prevention Section */}
            {species.prevention && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">Phòng ngừa</h3>
                </div>
                <p className="text-blue-800">{species.prevention}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-12">
          <button
            onClick={() => navigate('/detection')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Nhận diện loài này
          </button>
          <button
            onClick={() => navigate('/species')}
            className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Xem loài khác
          </button>
        </div>
      </div>
    </div>
  );
}