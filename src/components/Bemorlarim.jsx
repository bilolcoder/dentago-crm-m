import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from "react-icons/ti";
import { CiViewTable } from "react-icons/ci";
import { ChevronLeft, ChevronRight, X, Trash2, CheckCircle, Plus, Clock, User, Phone, Calendar, Clock3, Mail, FileText } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ha", confirmColor = "bg-rose-600", loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-3 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-3 overflow-hidden border border-gray-100">
        <div className="p-5">
          <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${confirmColor === "bg-green-600" ? "bg-green-100" : "bg-rose-100"}`}>
            {confirmColor === "bg-green-600" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <X className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed mb-5">{message}</p>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              Yo'q
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 ${confirmColor} hover:opacity-90 text-white font-medium rounded-xl transition-all active:scale-95 shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Jarayonda...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed top-4 right-4 z-[1000] max-w-sm w-[calc(100%-2rem)] sm:w-80 animate-in fade-in slide-in-from-top-4">
      <div className={`p-3 sm:p-4 rounded-xl border shadow-lg ${bgColor} flex items-start gap-3`}>
        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center ${type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          <span className="text-sm">{type === 'success' ? '✅' : '⚠️'}</span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-xs sm:text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer text-sm">
          ✕
        </button>
      </div>
    </div>
  );
};

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    patient: {
      fullName: '',
      phone: '',
    },
    appointmentDate: '',
    appointmentTime: '',
    status: 'pending',
    service: '',
    comment: ''
  });
  
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://app.dentago.uz/api/admin/doctors?limit=1000',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      const doctorsData = response.data.data || response.data.doctors || response.data || [];
      setDoctors(doctorsData);
      
      if (doctorsData.length > 0) {
        setFormData(prev => ({ ...prev, doctorId: doctorsData[0]._id }));
      }
    } catch (err) {
      console.error("Shifokorlarni yuklash xatosi:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 9) {
      return `+998-${numbers.slice(0,2)}-${numbers.slice(2,5)}-${numbers.slice(5,7)}-${numbers.slice(7,9)}`;
    } else if (numbers.length === 12 && numbers.startsWith('998')) {
      return `+${numbers.slice(0,3)}-${numbers.slice(3,5)}-${numbers.slice(5,8)}-${numbers.slice(8,10)}-${numbers.slice(10,12)}`;
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setFormData(prev => ({
      ...prev,
      patient: { ...prev.patient, phone: formatted }
    }));
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setFormData(prev => ({
      ...prev,
      appointmentDate: `${year}-${month}-${day}`,
      appointmentTime: `${hours}:${minutes}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      let cleanPhone = formData.patient.phone.replace(/\D/g, '');
      if (cleanPhone.length === 9) {
        cleanPhone = `998${cleanPhone}`;
      }
      const formattedPhone = `+${cleanPhone}`;
      
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00.000Z`;

      const payload = {
        doctorId: formData.doctorId,
        patient: {
          fullName: formData.patient.fullName,
          phone: formattedPhone,
        },
        appointmentDate: appointmentDateTime,
        appointmentTime: formData.appointmentTime,
        service: formData.service || "Umumiy qabul",
        comment: formData.comment || "",
        status: formData.status
      };

      const response = await axios.post(
        'https://app.dentago.uz/api/public/appointments',
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      onSuccess();
      onClose();
      setFormData({
        doctorId: doctors.length > 0 ? doctors[0]._id : '',
        patient: { fullName: '', phone: '' },
        appointmentDate: '',
        appointmentTime: '',
        status: 'pending',
        service: '',
        comment: ''
      });
    } catch (err) {
      console.error("Bemor qo'shish xatosi:", err);
      setError(err.response?.data?.message || "Bemor qo'shishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-3 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-4">
        {/* Header - yumaloq burchaklar */}
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Yangi bemor qo'shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Shifokor tanlash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Shifokor <span className="text-rose-500">*</span>
            </label>
            {loadingDoctors ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Yuklanmoqda...</span>
              </div>
            ) : (
              <select
                required
                value={formData.doctorId}
                onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm bg-white"
              >
                <option value="">Shifokorni tanlang</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.fullName} {doctor.specialty ? `(${doctor.specialty})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ism familiya */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Bemor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.patient.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, patient: { ...prev.patient, fullName: e.target.value } }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
              placeholder="Ali Aliyev"
            />
          </div>

          {/* Sana va vaqt - ikkitasi yonma-yon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                Sana
              </label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock3 className="w-4 h-4 text-gray-400" />
                Vaqt
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
                />
                <button
                  type="button"
                  onClick={setCurrentDateTime}
                  className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all cursor-pointer border border-gray-200"
                  title="Hozirgi vaqt"
                >
                  <Clock size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Telefon <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.patient.phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
              placeholder="93 230 46 37"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <FileText className="w-4 h-4 text-gray-400" />
                Xizmat
              </label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
                placeholder="Tish tozalash"
              />
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Izoh
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 focus:border-[#00BCE4] transition text-sm"
              placeholder="Qo'shimcha ma'lumot..."
              rows="2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Holati
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                className={`px-2 py-2 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  formData.status === 'pending'
                    ? 'bg-yellow-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Kutilmoqda
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'confirmed' }))}
                className={`px-2 py-2 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  formData.status === 'confirmed'
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yakunlangan
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'cancelled' }))}
                className={`px-2 py-2 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  formData.status === 'cancelled'
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bekor qilingan
              </button>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all cursor-pointer text-sm"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saqlanmoqda
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Qo'shish
                </>
              )}
            </button>
          </div>
        </form>
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

  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    type: 'delete',
    title: '',
    message: '',
    confirmText: 'Ha',
    confirmColor: 'bg-rose-600',
    loading: false
  });

  const [alertModal, setAlertModal] = useState({
    open: false,
    type: 'success',
    message: ''
  });

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
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
        <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-2 sm:mb-3">Xatolik yuz berdi</h3>
        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{error}</p>
        <button
          onClick={fetchAppointments}
          className="bg-[#00BCE4] cursor-pointer hover:bg-[#00a8cc] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="pb-4 sm:pb-5 px-3 sm:px-0">
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col lg:flex-row justify-between border-b pb-3 sm:pb-4 gap-3 sm:gap-4">
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
              Bemorlar Navbatlari
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
              Jami: <span className="font-semibold text-gray-800">{filteredAppointments.length} ta</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex bg-gray-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
                  viewMode === 'card' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden xs:inline">Kartalar</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
                  viewMode === 'table' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CiViewTable size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Jadval</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-md active:scale-95 text-xs sm:text-sm"
            >
              <Plus size={14} className="sm:w-5 sm:h-5" />
              <span className="">Bemor qo'shish</span>
            </button>

            <button
              onClick={fetchAppointments}
              className="bg-[#00BCE4] hover:bg-[#0099cc] cursor-pointer text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-md active:scale-95 text-xs sm:text-sm"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="hidden xs:inline">Yangilash</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap mt-4 sm:mt-6 md:mt-8 bg-gray-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-gray-200 w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
              statusFilter === 'all' ? 'bg-white text-[#00BCE4] shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
              statusFilter === 'pending' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Kutilmoqda
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
              statusFilter === 'confirmed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Yakunlangan
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg transition-all text-xs sm:text-sm ${
              statusFilter === 'cancelled' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Bekor qilingan
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-3">Navbatlar topilmadi</h3>
          <p className="text-sm sm:text-base text-gray-500">Hozircha hech qanday navbat mavjud emas</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-5">
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-[#00BCE4] group-hover:text-[#0099cc] transition-colors line-clamp-1">
                      {appointment.patient?.fullName || 'Noma\'lum bemor'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{appointment.patient?.phone || '—'}</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white ${getStatusStyle(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 text-gray-700 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#00BCE4] flex-shrink-0" />
                    <span className="line-clamp-1">{formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#00BCE4] flex-shrink-0" />
                    <span className="line-clamp-1">{appointment.service || '—'}</span>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="text-[#00BCE4] hover:text-[#0099cc] bg-blue-50 hover:bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer flex items-center justify-center flex-1"
                    title="To'liq ko'rish"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(appointment._id)}
                      className="bg-green-50 hover:bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer flex items-center justify-center flex-1"
                      title="Tasdiqlash"
                    >
                      <TiTick size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer flex items-center justify-center flex-1"
                      title="Bekor qilish"
                    >
                      <X size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(appointment._id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer flex items-center justify-center flex-1"
                    title="O'chirish"
                  >
                    <Trash2 size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bemor</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Telefon</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sana & Vaqt</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Xizmat</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Holati</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm text-[#00BCE4] font-semibold">
                          {appointment.patient?.fullName?.charAt(0) || 'N'}
                        </span>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                          {appointment.patient?.fullName || 'Noma\'lum bemor'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {appointment.patient?.phone || '—'}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {appointment.service || '—'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusStyle(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-[#00BCE4] hover:text-[#0099cc] bg-blue-50 hover:bg-blue-100 p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer"
                        title="To'liq ko'rish"
                      >
                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(appointment._id)}
                          className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer"
                          title="Tasdiqlash"
                        >
                          <TiTick size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      )}

                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer"
                          title="Bekor qilish"
                        >
                          <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Sahifa <span className="font-semibold">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-all"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage <= 3 ? i + 1 :
                            currentPage >= totalPages - 2 ? totalPages - 4 + i :
                            currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs sm:text-sm ${
                    currentPage === pageNum 
                      ? 'bg-[#00BCE4] text-white shadow-md' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-all"
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* To'liq ma'lumot modali */}
      {(selectedAppointment || modalLoading || modalError) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-4">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10 rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800">To'liq ma'lumot</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 cursor-pointer hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {modalLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-4 border-[#00BCE4] mb-3"></div>
                  <p className="text-sm text-gray-600 font-medium">Yuklanmoqda...</p>
                </div>
              ) : modalError ? (
                <div className="text-center py-6 text-sm text-red-600 font-medium">{modalError}</div>
              ) : selectedAppointment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bemor</p>
                      <p className="font-bold text-base">{selectedAppointment.patient?.fullName || '—'}</p>
                      <p className="text-xs text-gray-600 mt-1">Tel: {selectedAppointment.patient?.phone || '—'}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Holati</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full font-semibold text-white text-xs ${getStatusStyle(selectedAppointment.status)}`}>
                        {getStatusText(selectedAppointment.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Sana va vaqt</p>
                      <p className="font-medium text-sm">{formatDate(selectedAppointment.appointmentDate)} • {formatTime(selectedAppointment.appointmentTime)}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Xizmat turi</p>
                      <p className="font-medium text-sm">{selectedAppointment.service || '—'}</p>
                    </div>
                  </div>

                  {selectedAppointment.doctor && (
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Shifokor</p>
                      <p className="font-bold text-base">{selectedAppointment.doctor.fullName}</p>
                      <p className="text-xs text-[#00BCE4]">{selectedAppointment.doctor.specialty}</p>
                    </div>
                  )}

                  {selectedAppointment.comment && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Izoh</p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{selectedAppointment.comment}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                    {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                      <button
                        onClick={() => handleCancel(selectedAppointment._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <X size={16} /> Bekor qilish
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedAppointment._id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-lg font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} /> O'chirish
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Bemor qo'shish modali */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSuccess={() => {
          fetchAppointments();
          setAlertModal({
            open: true,
            type: 'success',
            message: '✅ Bemor muvaffaqiyatli qo\'shildi'
          });
        }}
      />

      {/* Bekor qilish tasdiqlash modali */}
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

      {/* Umumiy tasdiqlash modali */}
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