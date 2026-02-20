import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, MessageSquare, X } from 'lucide-react';
import { useData } from '../context/DataProvider';
import { Navigate } from 'react-router-dom';

const NeedAdmin = () => {
  const { user } = useData();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Faqat admin kirishi mumkin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // localStorage'dan so'rovlarni olish
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      // Avval localStorage'dan mavjud so'rovlarni olish
      const savedRequests = JSON.parse(localStorage.getItem('needRequests') || '[]');

      // Statik so'rovlarni qo'shish (faqat birinchi marta)
      const staticRequests = [
        {
          id: 1001,
          name: 'Ali Valiyev',
          phone: '+998901234567',
          message: "Assalomu alaykum! Menda stomatologik muammo bor. Sochlarim juda osongina tushib ketayapti. Shu masalada yordam bera olasizmi?",
          timestamp: '2026-02-15T10:30:00.000Z'
        },
        {
          id: 1002,
          name: 'Nigina Karimova',
          phone: '+998912345678',
          message: "Salom! Men yangi bemor bo'lib qoldim. Bir necha oydan beri tishim og'riyapti. Implantatsiya qilish kerak bo'lsa qancha turadi?",
          timestamp: '2026-02-14T15:45:00.000Z'
        },
        {
          id: 1003,
          name: 'Javlon Tojiyev',
          phone: '+998976543210',
          message: "Hurmatli shifokorlar! Men ortodontik davolashni xohlayman. Braketlar o'rnatish kerak. Qancha vaqt davom etadi davolanish?",
          timestamp: '2026-02-13T09:15:00.000Z'
        }
      ];

      // Agar localStorage bo'sh bo'lsa, statik so'rovlarni qo'shamiz
      if (savedRequests.length === 0) {
        localStorage.setItem('needRequests', JSON.stringify(staticRequests));
        setRequests(staticRequests);
      } else {
        setRequests(savedRequests);
      }
    } catch (error) {
      console.error('So\'rovlarni yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yangi so'rov qo'shish (Need.jsx dan chaqiriladi)
  const addRequest = (newRequest) => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('needRequests') || '[]');
      const requestWithId = {
        id: Date.now(), // unique ID
        ...newRequest,
        timestamp: new Date().toISOString()
      };
      const updatedRequests = [requestWithId, ...savedRequests];
      localStorage.setItem('needRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
    } catch (error) {
      console.error('So\'rov qo\'shishda xato:', error);
    }
  };

  // Modalni ochish
  const openModal = (request) => {
    setSelectedRequest(request);
  };

  // Modalni yopish
  const closeModal = () => {
    setSelectedRequest(null);
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2FF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchi So'rovlari</h1>
        <p className="text-gray-600 mt-1">Foydalanuvchilarning taklif va murojaatlari</p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Eslatma:</span> Bu sahifada foydalanuvchilar yuborgan barcha so'rovlarni ko'rasiz. Har bir cardni bosib batafsil ma'lumotlarni ko'rish mumkin.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hali so'rovlar mavjud emas</h3>
          <p className="text-gray-500">Foydalanuvchilar yuborgan so'rovlarni shu yerda ko'rasiz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => openModal(request)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer hover:border-[#00C2FF]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#00C2FF] p-2 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{request.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{request.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {request.message?.length > 100
                    ? request.message.slice(0, 70) + "..."
                    : request.message || ""}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(request.timestamp).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">So'rov tafsilotlari</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Foydalanuvchi ma'lumotlari */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Foydalanuvchi
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ism Familiya</p>
                    <p className="text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefon raqam</p>
                    <p className="text-gray-900">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sana</p>
                    <p className="text-gray-900">
                      {new Date(selectedRequest.timestamp).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Xabar */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Xabar
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-800 whitespace-pre-wrap wrap-break-word">{selectedRequest.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Need.jsx dan foydalanuvchi so'rovini qo'shish uchun export
NeedAdmin.addRequest = (request) => {
  const savedRequests = JSON.parse(localStorage.getItem('needRequests') || '[]');
  const requestWithId = {
    id: Date.now(),
    ...request,
    timestamp: new Date().toISOString()
  };
  const updatedRequests = [requestWithId, ...savedRequests];
  localStorage.setItem('needRequests', JSON.stringify(updatedRequests));
};

export default NeedAdmin;
