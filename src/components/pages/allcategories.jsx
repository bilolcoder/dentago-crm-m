import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Modal states (agar yangi qo'shish yoki tahrirlash kerak bo'lsa)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    catType: 'dentalMaterials', // default qiymat, o'zgartirsa bo'ladi
  });

  const navigate = useNavigate();
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

      // API array qaytaradi deb hisoblaymiz
      setCategories(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Kategoriyalarni yuklashda xato:", err);
      setError("Kategoriyalarni yuklab bo'lmadi. Token yoki internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Yangi kategoriya qo'shish / tahrirlash uchun (agar kerak bo'lsa)
  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showNotification("Nom maydonini to'ldiring!", 'error');
      return;
    }

    try {
      let response;
      if (editingCategory) {
        // Tahrirlash (PUT)
        response = await axios.put(
          `${BASE_URL}/api/category/${editingCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        showNotification("Kategoriya yangilandi!");
      } else {
        // Qo'shish (POST)
        response = await axios.post(
          `${BASE_URL}/api/category`,
          formData,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        showNotification("Yangi kategoriya qo'shildi!");
      }

      fetchCategories(); // Ro'yxatni yangilash
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', catType: 'dentalMaterials' });
    } catch (err) {
      showNotification("Saqlashda xato yuz berdi", 'error');
      console.error(err);
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
    if (!window.confirm("Rostan ham o'chirmoqchimisiz?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/category/${id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      showNotification("Kategoriya o'chirildi!");
      fetchCategories();
    } catch (err) {
      showNotification("O'chirishda xato!", 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#00BCE4] mb-4" />
        <p>Kategoriyalar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kategoriyalar ro'yxati</h1>
          <p className="text-gray-500">
            Jami: <span className="font-semibold">{categories.length}</span> ta kategoriya
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', catType: 'dentalMaterials' });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#00BCE4] hover:bg-[#0099b8] text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-all"
        >
          <Plus size={20} /> Yangi kategoriya
        </button>
      </div>

      {/* Xato xabari */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Jadval */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nomi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tavsif</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Turi</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat, index) => (
                  <tr key={cat._id} className=" hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{cat.name.trim()}</td>
                    <td className="px-6 py-4 text-gray-600">{cat.description?.trim() || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {cat.catType === 'dentalMaterials' ? 'Stomatologik materiallar' :
                         cat.catType === 'dentalEquipment' ? 'Stomatologik jihozlar' :
                         cat.catType === 'dentalTech' ? 'Texnik vositalar' : cat.catType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Hozircha kategoriya mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qo'shish/Tahrirlash Modal (oddiy variant) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BCE4]"
                  placeholder="Kategoriya nomini kiriting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BCE4]"
                  rows={3}
                  placeholder="Qisqacha tavsif..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Turi</label>
                <select
                  value={formData.catType}
                  onChange={e => setFormData({ ...formData, catType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BCE4]"
                >
                  <option value="dentalMaterials">Stomatologik materiallar</option>
                  <option value="dentalEquipment">Stomatologik jihozlar</option>
                  <option value="dentalTech">Texnik vositalar</option>
                  {/* kerak bo'lsa yana qo'shishingiz mumkin */}
                </select>
              </div>
            </div>

            <div className="p-6  flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-5 py-2 bg-[#00BCE4] text-white rounded-lg hover:bg-[#0099b8]"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bildirishnoma */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        } border`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
}

export default AllCategories;