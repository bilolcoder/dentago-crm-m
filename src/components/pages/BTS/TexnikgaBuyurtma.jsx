import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const BASE_URL = 'https://app.dentago.uz';
const ITEMS_PER_PAGE = 10; // Har bir sahifada nechta buyurtma ko'rsatiladi

function TexnikgaBuyurtma() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination uchun state'lar
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [techInfo, setTechInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('Token topilmadi');

        const res = await axios.get(`${BASE_URL}/api/user/technician-requests?limit=100000000000`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error('Buyurtmalarni yuklashda xato:', err);
        setError('Maʼlumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter + Pagination hisoblash
  useEffect(() => {
    let result = requests;

    if (statusFilter !== 'all') {
      result = requests.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // filter o'zgarganda 1-sahifaga qaytish
  }, [statusFilter, requests]);

  // Joriy sahifadagi ma'lumotlarni olish
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredRequests.slice(startIndex, endIndex);
  };

  const getTechnicianId = (req) => {
    return (
      req?.technician?._id ||
      req?.technician ||
      req?.technicianId ||
      req?.technician_id ||
      req?.techId ||
      req?.tech_id ||
      null
    );
  };

  const hasRatedThisTech = (techId) => {
    if (!techId) return false;
    const rated = JSON.parse(localStorage.getItem('ratedTechnicians') || '[]');
    return rated.includes(techId);
  };

  const markAsRated = (techId) => {
    if (!techId) return;
    let rated = JSON.parse(localStorage.getItem('ratedTechnicians') || '[]');
    if (!rated.includes(techId)) {
      rated.push(techId);
      localStorage.setItem('ratedTechnicians', JSON.stringify(rated));
    }
  };

  const handleOpenPrompt = async (req) => {
    const techId = getTechnicianId(req);
    if (!techId) {
      alert('Texnik ID si topilmadi');
      return;
    }

    if (hasRatedThisTech(techId)) {
      alert('Siz bu texnikni allaqachon baholagansiz!');
      return;
    }

    setSelectedRequest(req);
    setRating(0);
    setComment('');
    setFeedbackMsg({ type: '', text: '' });

    try {
      const res = await axios.get(`${BASE_URL}/api/public/technicians/${techId}`);
      const technician = res.data?.data?.technician || res.data?.technician || null;

      if (technician) {
        setTechInfo(technician);
        setShowPromptModal(true);
      } else {
        alert("Texnik ma'lumotlari topilmadi");
      }
    } catch (err) {
      console.error('Texnik maʼlumotlarini olishda xato:', err);
      alert('Texnik maʼlumotlarini yuklab bo‘lmadi');
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setFeedbackMsg({ type: 'error', text: 'Bahoni tanlang' });
      return;
    }

    setSending(true);
    setFeedbackMsg({ type: '', text: '' });

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    try {
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      await axios.post(
        `${BASE_URL}/api/public/technicians/${getTechnicianId(selectedRequest)}/review`,
        { rating, comment: comment.trim() },
        config
      );

      setFeedbackMsg({ type: 'success', text: 'Baholash muvaffaqiyatli yuborildi!' });
      markAsRated(getTechnicianId(selectedRequest));

      setTimeout(() => {
        setShowRateModal(false);
        setShowPromptModal(false);
        setTechInfo(null);
        setSelectedRequest(null);
        setRating(0);
        setComment('');
      }, 1800);
    } catch (err) {
      console.error('Review jo‘natishda xato:', err.response?.data || err);
      let errorText = 'Xatolik yuz berdi. Iltimos qayta urinib ko‘ring';

      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          errorText = 'Avtorizatsiya xatosi. Iltimos, qayta tizimga kiring.';
        } else if (err.response.data?.message) {
          errorText = err.response.data.message;
        }
      }

      setFeedbackMsg({ type: 'error', text: errorText });
    } finally {
      setSending(false);
    }
  };

  // Pagination tugmalari uchun yordamchi funksiyalar
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentPage === i
              ? 'bg-[#00BCE4] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center gap-1"
        >
          <ChevronLeft size={18} />
        </button>

        {pages}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center gap-1"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Texnikga Buyurtmalar</h1>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'all' ? 'bg-[#00BCE4] text-white shadow-md' : 'bg-white text-gray-700 shadow'
            }`}
          >
            Hammasi
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'pending' ? 'bg-[#00BCE4] text-white shadow-md' : 'bg-white shadow'
            }`}
          >
            Jarayonda
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'completed' ? 'bg-[#00BCE4] text-white shadow-md' : 'bg-white shadow'
            }`}
          >
            Bajarildi
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'rejected' ? 'bg-[#00BCE4] text-white shadow-md' : 'bg-white shadow'
            }`}
          >
            Bekor qilingan
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 text-xl">Yuklanmoqda...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-600 text-xl font-medium">{error}</div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#00BCE4]/10">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-[#00BCE4] uppercase tracking-wider">
                        F.I.SH
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-[#00BCE4] uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-[#00BCE4] uppercase tracking-wider">
                        Xizmat turi
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-[#00BCE4] uppercase tracking-wider">
                        Izoh
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-[#00BCE4] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getCurrentPageItems().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-500 text-base">
                          {filteredRequests.length === 0
                            ? statusFilter === 'all'
                              ? 'Hozircha buyurtmalar mavjud emas'
                              : 'Tanlangan status bo‘yicha buyurtma topilmadi'
                            : 'Joriy sahifada maʼlumot yo‘q'}
                        </td>
                      </tr>
                    ) : (
                      getCurrentPageItems().map((req) => (
                        <tr key={req._id} className="hover:bg-[#00BCE4]/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {req.client?.fullName || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">{req.client?.phone || '—'}</td>
                          <td className="px-6 py-4 text-gray-700">
                            {req.service?.length > 28 ? req.service.slice(0, 28) + '...' : req.service || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {req.comment?.length > 28 ? req.comment.slice(0, 28) + '...' : req.comment || '—'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-4">
                              <span
                                className={`font-medium px-3.5 py-1.5 rounded-full text-xs ${
                                  req.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : req.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {req.status === 'completed'
                                  ? 'Bajarildi'
                                  : req.status === 'rejected'
                                  ? 'Bekor qilindi'
                                  : req.status === 'pending'
                                  ? 'Jarayonda'
                                  : '—'}
                              </span>

                              {req.status === 'completed' && (
                                <button
                                  onClick={() => handleOpenPrompt(req)}
                                  className="text-sm px-4 py-1.5 bg-[#00BCE4] text-white rounded-lg hover:bg-[#00a8cc] transition font-medium shadow-sm"
                                >
                                  Baholash
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Prompt modal */}
        {showPromptModal && techInfo && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl">
              <button
                onClick={() => setShowPromptModal(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
              >
                <X size={28} />
              </button>

              <div className="text-center pt-4">
                <img
                  src={techInfo.avatar || 'https://via.placeholder.com/96?text='}
                  alt="Texnik rasmi"
                  className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-4 border-[#00BCE4]/20 shadow-md"
                />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{techInfo.fullName}</h3>
                {techInfo.specialization && <p className="text-gray-600 mb-8">{techInfo.specialization}</p>}

                <div className="grid grid-cols-2 gap-5">
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className="py-3.5 px-6 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-medium transition"
                  >
                    Baholashni hohlamayman
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptModal(false);
                      setShowRateModal(true);
                    }}
                    className="py-3.5 px-6 bg-[#00BCE4] text-white rounded-xl hover:bg-[#00a8cc] font-medium transition shadow-md"
                  >
                    Baholash
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Baholash modal */}
        {showRateModal && techInfo && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl">
              <button
                onClick={() => {
                  setShowRateModal(false);
                  setTechInfo(null);
                }}
                className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
              >
                <X size={28} />
              </button>

              <div className="text-center pt-4">
                <img
                  src={techInfo.avatar || 'https://via.placeholder.com/96?text='}
                  alt="Texnik rasmi"
                  className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-4 border-[#00BCE4]/20 shadow-md"
                />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{techInfo.fullName}</h3>
                {techInfo.specialization && <p className="text-gray-600 mb-6">{techInfo.specialization}</p>}

                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}>
                      <Star
                        size={48}
                        className={`transition-all ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                            : 'text-gray-200 hover:text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full p-4 border border-gray-200 rounded-xl mb-6 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent"
                  rows={4}
                  placeholder="Izoh qoldiring (ixtiyoriy)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                {feedbackMsg.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-center text-sm font-medium ${
                      feedbackMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                <button
                  onClick={handleSubmitRating}
                  disabled={sending || rating === 0}
                  className="w-full py-4 bg-[#00BCE4] text-white rounded-xl font-semibold hover:bg-[#00a8cc] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                  {sending ? 'Yuborilmoqda...' : 'Bahoni yuborish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TexnikgaBuyurtma;
