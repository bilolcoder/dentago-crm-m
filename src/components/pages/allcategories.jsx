import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus, Loader2, AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AllCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // Modal va form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    catType: 'dentalMaterials',
  });

  const [selectedDescription, setSelectedDescription] = useState(null);

  const BASE_URL = "https://app.dentago.uz";
  const TOKEN = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/category`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      setCategories(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Kategoriyalarni yuklashda xato:", err);
      setError("Kategoriyalarni yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 2800);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showNotification("Nom maydonini to'ldiring!", 'error');
      return;
    }

    try {
      if (editingCategory) {
        await axios.put(
          `${BASE_URL}/api/category/${editingCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        showNotification("Kategoriya yangilandi!");
      } else {
        await axios.post(
          `${BASE_URL}/api/category`,
          formData,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        showNotification("Yangi kategoriya qo'shildi!");
      }

      fetchCategories();
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', catType: 'dentalMaterials' });
    } catch (err) {
      showNotification("Saqlashda xato yuz berdi", 'error');
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      catType: cat.catType || 'dentalMaterials',
    });
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Rostan ham o'chirilishini xohlaysizmi?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/category/${id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      showNotification("Kategoriya o'chirildi!");
      fetchCategories();
    } catch (err) {
      showNotification("O'chirishda xato yuz berdi", 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00BCE4] mb-3" />
        <p className="text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10   text-gray-600   hover:text-[#00BCE4] transition-all cursor-pointer group"
            title="Orqaga qaytish"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-0.5 transition-transform " />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kategoriyalar ro'yxati</h1>
            <p className="text-gray-500 text-sm mt-1">
              Jami <span className="font-semibold text-gray-800">{categories.length}</span> ta kategoriya
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', catType: 'dentalMaterials' });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#00BCE4] hover:bg-[#00a6c9] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all cursor-pointer ml-auto"
        >
          <Plus size={18} /> Yangi kategoriya
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 w-12">#</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Nomi</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Tavsif</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Turi</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600 w-24">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentCategories.length > 0 ? (
                currentCategories.map((cat, index) => (
                  <tr key={cat._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3 text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-md">
                      {cat.description && cat.description.length > 35 ? (
                        <div
                          className="cursor-pointer group relative"
                          onClick={() => setSelectedDescription(cat.description)}
                        >
                          <span className="line-clamp-2">
                            {cat.description.substring(0, 35)}...
                          </span>
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10 w-80 left-0 mt-1 shadow-lg">
                            {cat.description}
                          </div>
                        </div>
                      ) : (
                        cat.description || '—'
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-[#00BCE4]">
                        {cat.catType === 'dentalMaterials' ? 'Stomatologik materiallar' :
                         cat.catType === 'dentalEquipment' ? 'Stomatologiya uskunalari' :
                         cat.catType === 'dentalTech' ? 'Texnik vositalar' : cat.catType}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 text-[#00BCE4] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Hozircha kategoriya mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="text-center sm:text-left">
              Jami <span className="font-semibold text-gray-800">{categories.length}</span> ta kategoriya,
              Sahifa <span className="font-semibold text-gray-800">{currentPage}</span> dan <span className="font-semibold text-gray-800">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 cursor-pointer rounded-full text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border font-medium transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#00BCE4] text-white border-[#00BCE4]'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedDescription && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setSelectedDescription(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">To'liq tavsif</h3>
              <button
                onClick={() => setSelectedDescription(null)}
                className="cursor-pointer"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedDescription}</p>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="cursor-pointer"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCE4] focus:ring-1 focus:ring-[#00BCE4]/30 outline-none transition"
                  placeholder="Kategoriya nomini kiriting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCE4] focus:ring-1 focus:ring-[#00BCE4]/30 outline-none transition min-h-[90px]"
                  placeholder="Tavsif (ixtiyoriy)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Turi</label>
                <select
                  value={formData.catType}
                  onChange={e => setFormData({ ...formData, catType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#00BCE4] focus:ring-1 focus:ring-[#00BCE4]/30 outline-none transition"
                >
                  <option value="dentalMaterials">Stomatologik materiallar</option>
                  <option value="dentalEquipment">Stomatologiya uskunalari</option>
                  <option value="dentalTech">Texnik vositalar</option>
                  <option value="dentalTech2">Texnik asboblar</option>
                  <option value="dentalTech3">CAD/CAM uskunalar</option>
                </select>
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-6 py-2 bg-[#00BCE4] text-white rounded-lg hover:bg-[#00a6c9] transition cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  );
}

export default AllCategories;