import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from "react-icons/ti";
import { CiViewTable } from "react-icons/ci";
import { ChevronLeft, ChevronRight, X, Trash2, CheckCircle } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

// Tasdiqlash Modal (o'chirish, tasdiqlash, bekor qilish uchun umumiy)
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ha", confirmColor = "bg-rose-600", loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${confirmColor === "bg-green-600" ? "bg-green-100" : "bg-rose-100"}`}>
            {confirmColor === "bg-green-600" ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <X className="w-8 h-8 text-rose-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">{title}</h3>
          <p className="text-gray-600 text-center leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Yo'q
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-4 ${confirmColor} hover:opacity-90 text-white font-semibold rounded-2xl transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Jarayonda...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast xabarlar uchun (muvaffaqiyat xabarlari)
const AlertModal = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  const bgColor = type === 'success' 
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
    : 'bg-rose-50 border-rose-200 text-rose-700';

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <div className="fixed top-6 right-6 z-[1000] max-w-sm w-full animate-in fade-in slide-in-from-top-4">
      <div className={`p-5 rounded-2xl border shadow-xl ${bgColor} flex items-start gap-4`}>
        <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          {type === 'success' ? '✅' : '⚠️'}
        </div>
        <div className="flex-1 pt-0.5">
          <p className="font-semibold text-sm leading-snug">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
          ✕
        </button>
      </div>
    </div>
  );
};

function Bemorlarim() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState('card');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Bekor qilish uchun tasdiqlash modal
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Umumiy tasdiqlash modal (o'chirish va qabul tasdiqlash)
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    type: 'delete', // 'delete' | 'confirm'
    title: '',
    message: '',
    confirmText: 'Ha',
    confirmColor: 'bg-rose-600',
    loading: false
  });

  // Toast xabarlar
  const [alertModal, setAlertModal] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status?.toLowerCase() === statusFilter;
  });

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Token topilmadi. Iltimos, qayta tizimga kiring.');
        return;
      }

      const response = await axios.get(
        'https://app.dentago.uz/api/admin/appointments?limit=1000000',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      setAppointments(response.data.data || response.data.appointments || response.data || []);
    } catch (err) {
      console.error("fetchAppointments xatosi:", err);
      let errorMsg = 'Ma\'lumotlarni yuklab bo\'lmadi';
      if (err.response) errorMsg += ` (${err.response.status})`;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentById = async (id) => {
    try {
      setModalLoading(true);
      setModalError('');
      setSelectedAppointment(null);

      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `https://app.dentago.uz/api/admin/appointments/${id}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      setSelectedAppointment(response.data.data || response.data);
    } catch (err) {
      console.error("fetchAppointmentById xatosi:", err);
      setModalError('To\'liq ma\'lumot yuklanmadi');
    } finally {
      setModalLoading(false);
    }
  };

  // Bekor qilish tasdiqlashni ochish (sababsiz)
  const handleCancel = (id) => {
    setCancelId(id);
    setIsCancelConfirmOpen(true);
  };

  const executeCancel = async () => {
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `https://app.dentago.uz/api/admin/appointments/${cancelId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 5000 }
      );

      setAppointments(prev => prev.map(app =>
        app._id === cancelId ? { ...app, status: 'cancelled' } : app
      ));

      if (selectedAppointment && selectedAppointment._id === cancelId) {
        setSelectedAppointment(prev => ({ ...prev, status: 'cancelled' }));
      }

      setIsCancelConfirmOpen(false);
      setCancelId(null);

      setAlertModal({
        open: true,
        type: 'success',
        message: '✅ Navbat muvaffaqiyatli bekor qilindi'
      });
    } catch (err) {
      console.error("Bekor qilish xatosi:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  // O'chirish tasdiqlash
  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      id,
      type: 'delete',
      title: "Navbatni o'chirish",
      message: "Bu navbatni butunlay o'chirib tashlamoqchimisiz?",
      confirmText: "O'chirish",
      confirmColor: "bg-rose-600",
      loading: false
    });
  };

  const executeDelete = async () => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `https://app.dentago.uz/api/admin/appointments/${confirmModal.id}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      setAppointments(prev => prev.filter(app => app._id !== confirmModal.id));

      if (selectedAppointment && selectedAppointment._id === confirmModal.id) {
        setSelectedAppointment(null);
      }

      setConfirmModal({ open: false, id: null, loading: false });

      setAlertModal({
        open: true,
        type: 'success',
        message: '✅ Navbat muvaffaqiyatli o‘chirildi'
      });
    } catch (err) {
      console.error("O'chirish xatosi:", err);
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Qabul tasdiqlash
  const handleConfirm = (id) => {
    setConfirmModal({
      open: true,
      id,
      type: 'confirm',
      title: "Qabulni tasdiqlash",
      message: "Bu bemorni qabul qilasizmi?",
      confirmText: "Tasdiqlash",
      confirmColor: "bg-green-600",
      loading: false
    });
  };

  const executeConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `https://app.dentago.uz/api/admin/appointments/${confirmModal.id}/status`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 5000 }
      );

      setAppointments(prev =>
        prev.map(app => app._id === confirmModal.id ? { ...app, status: 'confirmed' } : app)
      );

      if (selectedAppointment && selectedAppointment._id === confirmModal.id) {
        setSelectedAppointment(prev => ({ ...prev, status: 'confirmed' }));
      }

      setConfirmModal({ open: false, id: null, loading: false });

      setAlertModal({
        open: true,
        type: 'success',
        message: '✅ Navbat tasdiqlandi'
      });
    } catch (err) {
      console.error("Tasdiqlash xatosi:", err);
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleViewDetails = (appointment) => {
    fetchAppointmentById(appointment._id);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setModalError('');
    setModalLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return String(dateString);
    }
  };

  const formatTime = (timeString) => (timeString ? timeString.substring(0, 5) : '');

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Kutilmoqda';
      case 'confirmed': return 'Yakunlangan';
      case 'completed': return 'Bajarildi';
      case 'cancelled': return 'Bekor qilingan';
      default: return status || 'Noma\'lum';
    }
  };

  if (loading) return <LoadingSpinner text="Bemorlar yuklanmoqda" />;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-red-600 mb-3">Xatolik yuz berdi</h3>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={fetchAppointments}
          className="bg-[#00BCE4] cursor-pointer hover:bg-[#00a8cc] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="pb-5">
      <div className="mb-8 md:mb-10">
        <div className="flex flex-col lg:flex-row justify-between border-b pb-4 gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
              Bemorlar Navbatlari
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Jami: <span className="font-semibold text-gray-800">{filteredAppointments.length} ta</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition-all ${viewMode === 'card' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Kartalar</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CiViewTable size={20} />
                <span>Jadval</span>
              </button>
            </div>

            <button
              onClick={fetchAppointments}
              className="bg-[#00BCE4] hover:bg-[#0099cc] cursor-pointer text-white px-5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Yangilash
            </button>
          </div>
        </div>

        <div className="flex mt-8 bg-gray-100 p-1 rounded-xl border border-gray-200 w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 px-4 py-2 cursor-pointer rounded-lg transition-all text-sm ${statusFilter === 'all' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 px-4 py-2 cursor-pointer rounded-lg transition-all text-sm ${statusFilter === 'pending' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Kutilmoqda
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`flex-1 px-4 py-2 cursor-pointer rounded-lg transition-all text-sm ${statusFilter === 'confirmed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Yakunlangan
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`flex-1 px-4 py-2 cursor-pointer rounded-lg transition-all text-sm ${statusFilter === 'cancelled' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Bekor qilingan
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Navbatlar topilmadi</h3>
          <p className="text-gray-500">Hozircha hech qanday navbat mavjud emas</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-[#00BCE4] group-hover:text-[#0099cc] transition-colors">
                      {appointment.patient?.fullName || 'Noma\'lum bemor'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{appointment.patient?.phone || '—'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusStyle(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="space-y-3 text-gray-700 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[#00BCE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[#00BCE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{appointment.service || '—'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="text-[#00BCE4] hover:text-[#0099cc] bg-blue-50 hover:bg-blue-100 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center w-12 h-12"
                    title="To'liq ko'rish"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(appointment._id)}
                      className="bg-green-50 hover:bg-green-100 text-green-600 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center w-12 h-12"
                      title="Tasdiqlash"
                    >
                      <TiTick size={28} />
                    </button>
                  )}

                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center w-12 h-12"
                      title="Bekor qilish"
                    >
                      <X size={24} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(appointment._id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center w-12 h-12"
                    title="O'chirish"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bemor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sana & Vaqt</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Xizmat</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Holati</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-[#00BCE4] font-semibold">
                          {appointment.patient?.fullName?.charAt(0) || 'N'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.fullName || 'Noma\'lum bemor'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.patient?.phone || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.service || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusStyle(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-[#00BCE4] hover:text-[#0099cc] bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-all cursor-pointer"
                        title="To'liq ko'rish"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(appointment._id)}
                          className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-all cursor-pointer"
                          title="Tasdiqlash"
                        >
                          <TiTick size={20} />
                        </button>
                      )}

                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all cursor-pointer"
                          title="Bekor qilish"
                        >
                          <X size={20} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-all cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 p-4">
          <div className="text-sm text-gray-600">
            Sahifa <span className="font-semibold">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage <= 3 ? i + 1 :
                            currentPage >= totalPages - 2 ? totalPages - 4 + i :
                            currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === pageNum ? 'bg-[#00BCE4] text-white shadow-md' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Ko'zni bosganda ochiladigan to'liq ma'lumot modali (eski holatda saqlangan) */}
      {(selectedAppointment || modalLoading || modalError) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">To'liq ma'lumot</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 cursor-pointer hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-all duration-300"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-[#00BCE4] mb-4"></div>
                  <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
                </div>
              ) : modalError ? (
                <div className="text-center py-10 text-red-600 font-medium">{modalError}</div>
              ) : selectedAppointment ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-1">Bemor</p>
                      <p className="font-bold text-lg">{selectedAppointment.patient?.fullName || '—'}</p>
                      <p className="text-gray-600 mt-1">Telefon: {selectedAppointment.patient?.phone || '—'}</p>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-1">Holati</p>
                      <span className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${getStatusStyle(selectedAppointment.status)}`}>
                        {getStatusText(selectedAppointment.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-1">Sana va vaqt</p>
                      <p className="font-medium text-lg">{formatDate(selectedAppointment.appointmentDate)} • {formatTime(selectedAppointment.appointmentTime)}</p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-1">Xizmat turi</p>
                      <p className="font-medium text-lg">{selectedAppointment.service || '—'}</p>
                    </div>
                  </div>

                  {selectedAppointment.doctor && (
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-1">Shifokor</p>
                      <p className="font-bold text-lg">{selectedAppointment.doctor.fullName}</p>
                      <p className="text-[#00BCE4]">{selectedAppointment.doctor.specialty}</p>
                    </div>
                  )}

                  {selectedAppointment.comment && (
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-2">Izoh</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.comment}</p>
                    </div>
                  )}

                  {selectedAppointment.doctor?.clinic && (
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-2">Klinika</p>
                      <p className="font-bold text-gray-800">{selectedAppointment.doctor.clinic.name}</p>
                      <p className="text-gray-600 mt-1">{selectedAppointment.doctor.clinic.address}</p>
                    </div>
                  )}

                  {/* Modal ichidagi harakat tugmalari */}
                  <div className="pt-6 border-t flex gap-4">
                    {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                      <button
                        onClick={() => handleCancel(selectedAppointment._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <X size={20} /> Bekor qilish
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedAppointment._id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-4 rounded-2xl font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} /> O'chirish
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Bekor qilish tasdiqlash modali (sababsiz) */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => {
          setIsCancelConfirmOpen(false);
          setCancelId(null);
        }}
        onConfirm={executeCancel}
        title="Bekor qilish"
        message="Bu navbatni haqiqatan ham bekor qilmoqchimisiz?"
        confirmText="Bekor qilish"
        confirmColor="bg-rose-600"
        loading={isCancelling}
      />

      {/* Umumiy tasdiqlash / o'chirish modali */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={confirmModal.type === 'delete' ? executeDelete : executeConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        loading={confirmModal.loading}
      />

      {/* Toast xabarlar */}
      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal({ open: false, type: '', message: '' })}
        type={alertModal.type}
        message={alertModal.message}
      />
    </div>
  );
}

export default Bemorlarim;