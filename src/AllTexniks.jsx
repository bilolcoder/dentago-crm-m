import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Check,
  X,
  Loader2,
  Phone,
  AlertCircle,
  Search
} from 'lucide-react';
import LoadingSpinner from './components/common/LoadingSpinner';

const TechniciansList = () => {
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'approve' yoki 'reject'
    technicianId: null,
    technicianName: ''
  });

  const token = localStorage.getItem('accessToken');

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('https://app.dentago.uz/api/admin/technicians/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data || [];
      setTechnicians(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Maʼlumotlarni yuklashda xato yuz berdi.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter(tech => {
    const searchContent = `${tech.fullName} ${tech.phone}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });

  // Modal ochish
  const openModal = (type, id, name) => {
    setModal({
      isOpen: true,
      type,
      technicianId: id,
      technicianName: name || 'texnik'
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: null,
      technicianId: null,
      technicianName: ''
    });
  };

  const handleConfirmAction = async () => {
    const { type, technicianId } = modal;
    if (!technicianId) return;

    setActionLoading(technicianId);
    closeModal();

    try {
      if (type === 'approve') {
        await axios.put(`https://app.dentago.uz/api/admin/technicians/${technicianId}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTechnicians(prev => prev.map(tech =>
          tech._id === technicianId ? { ...tech, isApproved: true } : tech
        ));
        setMessage({ type: 'success', text: 'Texnik muvaffaqiyatli tasdiqlandi!' });
      } else if (type === 'reject') {
        await axios.put(`https://app.dentago.uz/api/admin/technicians/${technicianId}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTechnicians(prev => prev.map(tech =>
          tech._id === technicianId ? { ...tech, isApproved: false } : tech
        ));
        setMessage({ type: 'success', text: 'Texnik rad etildi.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Amalni bajarishda xato yuz berdi.' });
    } finally {
      setActionLoading(null);
    }
  };

  const getRowStyle = (isApproved) => {
    if (isApproved === true) return 'bg-green-50/60 border-green-100';
    if (isApproved === false) return 'bg-red-50/60 border-red-100';
    return 'bg-white hover:bg-cyan-50/40';
  };

  const truncateText = (text, limit = 20) => {
    if (!text) return '—';
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className="py-6 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Texniklar Ro'yxati</h1>
          <p className="text-gray-500">Barcha ro'yxatdan o'tgan texniklarni boshqarish</p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Ism yoki telefon orqali qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          <AlertCircle size={20} />
          {message.text}
          <button onClick={() => setMessage({ text: '' })} className="ml-auto cursor-pointer opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner text="Texniklar yuklanmoqda" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Ism Familiya</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Telefon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTechnicians.length > 0 ? (
                  filteredTechnicians.map((tech) => (
                    <tr
                      key={tech._id}
                      className={`transition-colors ${getRowStyle(tech.isApproved)}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${tech.isApproved === true ? 'bg-green-100 text-green-700' : tech.isApproved === false ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-[#00BCE4]'}`}>
                            {tech.fullName?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-gray-800">{tech.fullName || 'Nomaʼlum'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[#00BCE4]" />
                          {tech.phone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tech.isApproved === true ? 'bg-green-100 text-green-700' : tech.isApproved === false ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {tech.isApproved === true ? 'Tasdiqlangan' : tech.isApproved === false ? 'Rad etilgan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {tech.isApproved !== true && (
                            <button
                              onClick={() => openModal('approve', tech._id, tech.fullName)}
                              disabled={actionLoading === tech._id}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 cursor-pointer hover:text-white border border-green-200 transition disabled:opacity-50"
                              title="Tasdiqlash"
                            >
                              {actionLoading === tech._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            </button>
                          )}
                          {tech.isApproved !== false && (
                            <button
                              onClick={() => openModal('reject', tech._id, tech.fullName)}
                              disabled={actionLoading === tech._id}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 cursor-pointer hover:text-white border border-red-200 transition disabled:opacity-50"
                              title="Rad etish"
                            >
                              {actionLoading === tech._id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                      {searchTerm ? `"${searchTerm}" bo'yicha hech narsa topilmadi` : "Hozircha texniklar mavjud emas"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {modal.type === 'approve' ? 'Texnikni tasdiqlash' : 'Texnikni rad etish'}
              </h3>
              <p className="text-gray-600 mb-6">
                {modal.type === 'approve'
                  ? `"${modal.technicianName}" nomli texnikni haqiqatan ham tasdiqlamoqchimisiz?`
                  : `"${modal.technicianName}" nomli texnikni haqiqatan ham rad etmoqchimisiz?`
                }
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-5 py-2.5 cursor-pointer rounded-lg text-white transition flex items-center gap-2 ${
                    modal.type === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {modal.type === 'approve' ? (
                    <>
                      <Check size={18} /> Ha, tasdiqlayman
                    </>
                  ) : (
                    <>
                      <X size={18} /> Ha, rad etaman
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansList;