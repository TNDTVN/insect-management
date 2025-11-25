// src/pages/ModelManagement/ModelManagement.jsx
import {
  AlertCircle,
  Cpu,
  Edit2,
  Eye,
  Play,
  Plus,
  Save,
  Search, // Thêm Search icon
  Trash2,
  Upload,
  X,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import modelService from '../../services/modelService';

const ModelManagement = () => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [viewSpecies, setViewSpecies] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // --- 1. STATE CHO PHÂN TRANG & TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [page, setPage] = useState(1);
  const limit = 6; // Hiển thị 6 model mỗi trang (lưới 3x2)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    version: 'v1.0',
    description: '',
    is_active: false,
    model_file: null,
    species_file: null,
    species_data: [],
    species_images: []
  });

  // Species template
  const defaultSpecies = {
    name_en: '',
    name_vi: '',
    description: '',
    harm: '',
    benefit: '',
    prevention: '',
    class_id: 0,
    image_path: '',
    image_file: null
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // --- 2. RESET TRANG KHI LỌC ---
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await modelService.getAllModels();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      alert('Lỗi khi tải danh sách model');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. LOGIC LỌC & PHÂN TRANG ---
  const filteredModels = models.filter(model => {
    const matchesSearch = 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.version.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && model.is_active) || 
        (filterStatus === 'inactive' && !model.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredModels.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + limit);

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };
  // ------------------------------------

  const handleAddSpecies = () => {
    setFormData(prev => ({
      ...prev,
      species_data: [...prev.species_data, { ...defaultSpecies }],
      species_images: [...prev.species_images, null]
    }));
    
    setTimeout(() => {
      const speciesList = document.querySelector('.species-list-container');
      if (speciesList) {
        speciesList.scrollTo({
          top: speciesList.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleRemoveSpecies = (index) => {
    setFormData(prev => ({
      ...prev,
      species_data: prev.species_data.filter((_, i) => i !== index),
      species_images: prev.species_images.filter((_, i) => i !== index)
    }));
  };

  const handleSpeciesChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      species_data: prev.species_data.map((species, i) =>
        i === index ? { ...species, [field]: value } : species
      )
    }));
  };

  const handleSpeciesImageChange = (index, file) => {
    setFormData(prev => ({
      ...prev,
      species_images: prev.species_images.map((img, i) => i === index ? file : img)
    }));
  };

  const handleSpeciesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const speciesData = JSON.parse(event.target.result);
          setFormData(prev => ({
            ...prev,
            species_file: file,
            species_data: speciesData.map(s => ({
              ...s,
              image_path: '',
              image_file: null
            })),
            species_images: new Array(speciesData.length).fill(null)
          }));
        } catch (error) {
          alert('Lỗi khi đọc file JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Vui lòng chọn file JSON');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.pt')) {
      setFormData(prev => ({ ...prev, model_file: file }));
    } else {
      alert('Chỉ chấp nhận file model .pt');
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    if (!isEdit && !formData.model_file) {
      alert('Vui lòng chọn file model');
      return;
    }
    
    if (formData.species_file && formData.species_data.length > 0) {
      if (formData.species_data.length !== formData.species_images.length) {
        alert('Số lượng file ảnh phải khớp với số lượng loài');
        return;
      }
    }

    try {
      setActionLoading(isEdit ? 'updating' : 'creating');
      if (isEdit) {
        await modelService.updateModel(selectedModel.id, formData);
        alert('Cập nhật model thành công!');
      } else {
        await modelService.createModel(formData);
        alert('Thêm model thành công!');
      }
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedModel(null);
      fetchModels();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} model:`, error);
      alert(`Lỗi khi ${isEdit ? 'cập nhật' : 'thêm'} model: ${error.response?.data?.detail || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (modelId) => {
    try {
      setActionLoading(modelId);
      await modelService.activateModel(modelId);
      fetchModels();
      alert('Kích hoạt model thành công!');
    } catch (error) {
      console.error('Error activating model:', error);
      alert('Lỗi khi kích hoạt model');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      setActionLoading('deleting');
      await modelService.deleteModel(selectedModel.id);
      setShowDeleteModal(false);
      setSelectedModel(null);
      fetchModels();
      alert('Xóa model thành công!');
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Lỗi khi xóa model');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (model) => {
    setSelectedModel(model);
    setShowDeleteModal(true);
  };

  const openSpeciesModal = async (model) => {
    try {
      const species = await modelService.getModelSpecies(model.id);
      const sortedSpecies = species.sort((a, b) => a.class_id - b.class_id);
      setViewSpecies({ model, species: sortedSpecies });
    } catch (error) {
      console.error('Error fetching species:', error);
      alert('Lỗi khi tải danh sách loài');
    }
  };

  const openEditModal = async (model) => {
    try {
      const species = await modelService.getModelSpecies(model.id);
      const sortedSpecies = species.sort((a, b) => a.class_id - b.class_id);
      setSelectedModel(model);
      setFormData({
        name: model.name,
        version: model.version,
        description: model.description || '',
        is_active: model.is_active,
        model_file: null,
        species_file: null,
        species_data: sortedSpecies.map(s => ({
          name_en: s.name_en,
          name_vi: s.name_vi,
          description: s.description || '',
          harm: s.harm || '',
          benefit: s.benefit || '',
          prevention: s.prevention || '',
          class_id: s.class_id,
          image_path: s.image_path || '',
          image_file: null
        })),
        species_images: new Array(species.length).fill(null)
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching model data for edit:', error);
      alert('Lỗi khi tải dữ liệu model để chỉnh sửa');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      version: 'v1.0',
      description: '',
      is_active: false,
      model_file: null,
      species_file: null,
      species_data: [],
      species_images: []
    });
  };

  // Helper render function
  const renderSpeciesList = () => (
    <div className="species-list-container space-y-4 mb-4 max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
      {formData.species_data.map((species, index) => {
        const previewUrl = formData.species_images[index]
          ? URL.createObjectURL(formData.species_images[index])
          : species.image_path
            ? `http://localhost:8000/public/species_images/${species.image_path}`
            : null;

        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Class ID: {species.class_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSpecies(index)}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Xóa loài này"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image Column */}
              <div className="md:col-span-4 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Hình ảnh minh họa
                </label>
                <div className="relative group w-full aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 hover:border-blue-500 transition-colors">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">Thay đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-xs text-center px-2">Nhấn để tải ảnh</span>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleSpeciesImageChange(index, e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Chọn ảnh"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 text-center truncate">
                  {formData.species_images[index]?.name || species.image_path || 'Chưa có file'}
                </p>
              </div>

              {/* Data Columns */}
              <div className="md:col-span-8 lg:col-span-9 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Class ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={species.class_id}
                      onChange={(e) => handleSpeciesChange(index, 'class_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={species.name_vi}
                      onChange={(e) => handleSpeciesChange(index, 'name_vi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Ví dụ: Muỗi vằn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tên tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={species.name_en}
                      onChange={(e) => handleSpeciesChange(index, 'name_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 italic"
                      placeholder="Ví dụ: Aedes aegypti"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                  <textarea
                    value={species.description}
                    onChange={(e) => handleSpeciesChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="Mô tả đặc điểm nhận dạng..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tác hại</label>
                    <textarea
                      value={species.harm}
                      onChange={(e) => handleSpeciesChange(index, 'harm', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-yellow-500 bg-yellow-50"
                      placeholder="Gây bệnh..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lợi ích</label>
                    <textarea
                      value={species.benefit}
                      onChange={(e) => handleSpeciesChange(index, 'benefit', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 bg-green-50"
                      placeholder="Thụ phấn..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phòng ngừa</label>
                    <textarea
                      value={species.prevention}
                      onChange={(e) => handleSpeciesChange(index, 'prevention', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-blue-50"
                      placeholder="Vệ sinh..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Model</h1>
          <p className="text-gray-600">Quản lý các mô hình nhận diện côn trùng</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Thêm Model
        </button>
      </div>

      {/* --- 4. THANH TÌM KIẾM VÀ BỘ LỌC --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm model theo tên hoặc phiên bản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Models Grid - Hiển thị paginatedModels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedModels.map((model) => (
          <div
            key={model.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  model.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Cpu className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate" title={model.name}>{model.name}</h3>
                  <p className="text-sm text-gray-500 truncate">Version: {model.version}</p>
                </div>
              </div>
              {model.is_active && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  Đang hoạt động
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
              {model.description || 'Không có mô tả'}
            </p>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="truncate" title={model.file_path}>Đường dẫn: {model.file_path}</div>
              <div>Ngày tạo: {new Date(model.uploaded_at).toLocaleDateString()}</div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              {!model.is_active && (
                <button
                  onClick={() => handleActivate(model.id)}
                  disabled={actionLoading === model.id}
                  className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === model.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Kích hoạt
                </button>
              )}
              
              <button
                onClick={() => openSpeciesModal(model)}
                className="flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Eye className="h-4 w-4" />
                Loài
              </button>
              
              <button
                onClick={() => openEditModal(model)}
                className="flex-1 min-w-[100px] bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
              
              <button
                onClick={() => openDeleteModal(model)}
                className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Cpu className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Không tìm thấy model nào</p>
        </div>
      )}

      {/* --- 5. ĐIỀU KHIỂN PHÂN TRANG --- */}
      {filteredModels.length > 0 && (
        <div className="flex justify-center gap-4 mt-6 pb-6">
            <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                Trang trước
            </button>
            <span className="self-center font-medium">
                Trang {page} / {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded-lg ${page >= totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                Trang sau
            </button>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Thêm Model Mới</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="insect_detection_v1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="v1.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả về model..."
                  />
                </div>

                {/* Model File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Model (.pt) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.model_file ? formData.model_file.name : 'Chọn file model .pt'}
                    </p>
                    <input
                      type="file"
                      accept=".pt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="model-file"
                    />
                    <label
                      htmlFor="model-file"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Chọn File
                    </label>
                  </div>
                </div>

                {/* Species JSON File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File JSON Danh sách Loài
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.species_file ? formData.species_file.name : 'Chọn file JSON'}
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleSpeciesFileChange}
                      className="hidden"
                      id="species-file"
                    />
                    <label
                      htmlFor="species-file"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Chọn File JSON
                    </label>
                  </div>
                </div>

                {/* Species Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Danh sách Loài
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.species_data.length} loài
                    </span>
                  </div>

                  {/* Render list using the new helper function */}
                  {renderSpeciesList()}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddSpecies}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm Loài Mới
                    </button>
                  </div>
                </div>

                {/* Active Switch */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Kích hoạt model này ngay sau khi tạo
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'creating'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === 'creating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Tạo Model
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {showEditModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Chỉnh sửa Model</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, true)} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="insect_detection_v1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="v1.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả về model..."
                  />
                </div>

                {/* Model File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Model (.pt) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.model_file ? formData.model_file.name : 'Chọn file model .pt'}
                    </p>
                    <input
                      type="file"
                      accept=".pt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="model-file"
                    />
                    <label
                      htmlFor="model-file"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Chọn File
                    </label>
                  </div>
                </div>

                {/* Species JSON File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File JSON Danh sách Loài
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.species_file ? formData.species_file.name : 'Chọn file JSON'}
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleSpeciesFileChange}
                      className="hidden"
                      id="species-file"
                    />
                    <label
                      htmlFor="species-file"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Chọn File JSON
                    </label>
                  </div>
                </div>
                
                {/* Species Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Danh sách Loài
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.species_data.length} loài
                    </span>
                  </div>

                  {/* Render list using the new helper function */}
                  {renderSpeciesList()}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddSpecies}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm Loài Mới
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'updating'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === 'updating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Cập nhật Model
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                <p className="text-gray-600">Bạn có chắc chắn muốn xóa model này?</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium truncate">{selectedModel.name}</p>
              <p className="text-sm text-gray-600">Version: {selectedModel.version}</p>
              {selectedModel.is_active && (
                <p className="text-sm text-red-600 font-medium mt-1">
                  ⚠️ Model này đang được kích hoạt!
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === 'deleting'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                {actionLoading === 'deleting' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Species Modal */}
      {viewSpecies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    Danh sách Loài - {viewSpecies.model.name}
                  </h2>
                  <p className="text-gray-600">Tổng số: {viewSpecies.species.length} loài</p>
                </div>
                <button
                  onClick={() => setViewSpecies(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {viewSpecies.species.map((species) => (
                  <div key={species.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{species.name_vi}</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        Class {species.class_id}
                      </span>
                    </div>
                    <img
                      src={`http://localhost:8000/public/species_images/${species.image_path}`}
                      alt={species.name_en}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    />
                    <p className="text-sm text-gray-600 italic mb-2 truncate">{species.name_en}</p>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {species.description}
                    </p>
                    <div className="space-y-1 text-xs text-gray-600">
                      {species.harm && <div>🟡 Tác hại: <span className="line-clamp-1">{species.harm}</span></div>}
                      {species.benefit && <div>🟢 Lợi ích: <span className="line-clamp-1">{species.benefit}</span></div>}
                      {species.prevention && <div>🔵 Phòng ngừa: <span className="line-clamp-1">{species.prevention}</span></div>}
                    </div>
                  </div>
                ))}
              </div>

              {viewSpecies.species.length === 0 && (
                <div className="text-center py-8">
                  <Cpu className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Chưa có loài nào cho model này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelManagement;