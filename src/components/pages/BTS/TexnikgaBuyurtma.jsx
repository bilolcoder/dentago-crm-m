import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Star } from 'lucide-react';

const BASE_URL = 'https://app.dentago.uz';

function TexnikgaBuyurtma() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal va baholash holatlari
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
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          throw new Error('Token topilmadi');
        }

        const res = await axios.get(`${BASE_URL}/api/user/technician-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error('Buyurtmalarni yuklashda xato:', err);
        setError('Maʼlumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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
      alert("Texnik ID si topilmadi");
      return;
    }

    if (hasRatedThisTech(techId)) {
      return; // allaqachon baholagan → hech narsa qilmaymiz
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
      console.error("Texnik ma'lumotlarini olishda xato:", err);
      alert("Texnik ma'lumotlarini yuklab bo'lmadi");
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
        {
          rating: rating,
          comment: comment.trim(),
        },
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
      console.error('Review jo‘natishda xato:', err.response?.data || err.message);

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

  return (
    <div className="py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Texnikga Buyurtma</h1>

      {loading ? (
        <div className="py-16 text-center text-gray-500 text-lg">Yuklanmoqda...</div>
      ) : error ? (
        <div className="py-16 text-center text-red-600 text-lg">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">F.I.SH</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Telefon</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Xizmat turi</th>
                <th className="px-5 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider">Izoh</th>
                <th className="px-5 py-3.5 text-center font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-base">
                    Hozircha buyurtmalar mavjud emas
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {req.client?.fullName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {req.client?.phone || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {req.service?.length > 24
                        ? req.service.slice(0, 24) + '...'
                        : req.service || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {req.comment?.length > 24
                        ? req.comment.slice(0, 24) + '...'
                        : req.comment || '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <span
                          className={`font-medium px-2.5 py-1 rounded-full text-xs ${
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
                            className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm"
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
      )}

      {/* Prompt modal */}
      {showPromptModal && techInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => setShowPromptModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={26} />
            </button>

            <div className="text-center pt-2">
              <img
                src={techInfo.avatar || 'https://via.placeholder.com/96?text='}
                alt="Texnik rasmi"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100 shadow-sm"
              />
              <h3 className="text-xl font-bold mb-1">{techInfo.fullName}</h3>
              {techInfo.specialization && (
                <p className="text-gray-600 mb-6">{techInfo.specialization}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="py-3 px-5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-medium transition"
                >
                  Baholashni hohlamayman
                </button>
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    setShowRateModal(true);
                  }}
                  className="py-3 px-5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition"
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => {
                setShowRateModal(false);
                setTechInfo(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={26} />
            </button>

            <div className="text-center pt-2">
              <img
                src={techInfo.avatar || 'https://via.placeholder.com/96?text='}
                alt="Texnik rasmi"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100 shadow-sm"
              />
              <h3 className="text-xl font-bold mb-1">{techInfo.fullName}</h3>
              {techInfo.specialization && (
                <p className="text-gray-600 mb-5">{techInfo.specialization}</p>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={40}
                      className={`transition-all ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                          : 'text-gray-200 hover:text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl mb-5 text-base resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={4}
                placeholder="Izoh qoldiring (ixtiyoriy)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              {feedbackMsg.text && (
                <div
                  className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
                    feedbackMsg.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <button
                onClick={handleSubmitRating}
                disabled={sending || rating === 0}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {sending ? 'Yuborilmoqda...' : 'Bahoni yuborish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TexnikgaBuyurtma;
