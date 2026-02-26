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
  const [searchTerm, setSearchTerm] = useState(''); // Qidiruv uchun state

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

  // Filterlash funksiyasi
  const filteredTechnicians = technicians.filter(tech => {
    const searchContent = `${tech.fullName} ${tech.phone}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });

  const handleApprove = async (id) => {
    if (!window.confirm("Ushbu texnikni tasdiqlashni xohlaysizmi?")) return;
    setActionLoading(id);
    try {
      await axios.put(`https://app.dentago.uz/api/admin/technicians/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(prev => prev.map(tech =>
        tech._id === id ? { ...tech, isApproved: true } : tech
      ));
      setMessage({ type: 'success', text: 'Texnik muvaffaqiyatli tasdiqlandi!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Tasdiqlashda xato yuz berdi.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Ushbu texnikni rad etishni xohlaysizmi?")) return;
    setActionLoading(id);
    try {
      await axios.put(`https://app.dentago.uz/api/admin/technicians/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(prev => prev.map(tech =>
        tech._id === id ? { ...tech, isApproved: false } : tech
      ));
      setMessage({ type: 'success', text: 'Texnik rad etildi.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Rad etishda xato yuz berdi.' });
    } finally {
      setActionLoading(null);
    }
  };

  const getRowStyle = (isApproved) => {
    if (isApproved === true) return 'bg-green-100 border-green-200';
    if (isApproved === false) return 'bg-red-100 border-red-200';
    return 'bg-white hover:bg-cyan-50/30';
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
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          <AlertCircle size={20} />
          {message.text}
          <button onClick={() => setMessage({ text: '' })} className="ml-auto opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center pb-50">
            <LoadingSpinner text="Texniklar yuklanmoqda" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="unified-table">
              <thead>
                <tr className="bg-gray-50 text-white">
                  <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Ism Familiya</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Telefon</th>
                  {/* <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Tajriba</th> */}
                  {/* <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Tavsif</th> */}
                  <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechnicians.length > 0 ? (
                  filteredTechnicians.map((tech) => (
                    <tr
                      key={tech._id}
                      className={`transition-colors duration-300 bg-white hover:bg-cyan-50/30 `}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${tech.isApproved !== undefined && tech.isApproved !== null
                              ? 'bg-white text-gray-700'
                              : 'bg-cyan-100 text-[#00BCE4]'
                            }`}>
                            {tech.fullName?.charAt(0)}
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
                      {/* <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${tech.isApproved !== undefined && tech.isApproved !== null
                            ? 'bg-white/60 text-gray-700'
                            : 'bg-blue-50 text-blue-600'
                          }`}>
                          {tech.experienceYears || 0} yil
                        </span>
                      </td> */}
                      {/* <td className="px-6 py-4 text-gray-500 italic text-sm">
                        {truncateText(tech.description)}
                      </td> */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full  text-xs font-semibold ${tech.isApproved === true ? 'bg-green-50 text-green-700' : tech.isApproved === false ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {tech.isApproved === true ? 'Tasdiqlangan' : tech.isApproved === false ? 'Bekor qilingan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {/* Tasdiqlash tugmasi faqat tasdiqlanmagan va bekor qilinmagan uchun */}
                          {tech.isApproved !== true && (
                            <button
                              onClick={() => handleApprove(tech._id)}
                              disabled={actionLoading === tech._id}
                              className={`p-2 rounded-lg cursor-pointer transition shadow-sm border bg-white text-green-600 border-green-100 hover:bg-green-600 hover:text-white`}
                              title="Tasdiqlash"
                            >
                              {actionLoading === tech._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            </button>
                          )}
                          {/* Bekor qilish tugmasi faqat tasdiqlanmagan va bekor qilinmagan uchun */}
                          {tech.isApproved !== false && (
                            <button
                              onClick={() => handleReject(tech._id)}
                              disabled={actionLoading === tech._id}
                              className={`p-2 rounded-lg cursor-pointer transition shadow-sm border bg-white text-red-600 border-red-100 hover:bg-red-600 hover:text-white`}
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
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                      {searchTerm ? `"${searchTerm}" bo'yicha hech kim topilmadi.` : "Hech qanday texnik topilmadi."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechniciansList;
