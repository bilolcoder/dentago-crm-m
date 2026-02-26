import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {
  Search, Edit, Phone, MapPin, User, Star, AlertCircle, Loader2, X, CheckCircle,
  UserCircle, BriefcaseMedical, Calendar, Building, Clock, DollarSign,
  Save, Eye, Trash2, Plus, Globe
} from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';
const uzbekistanCities = [
  // =========================
  // QORAQALPOG'ISTON
  // =========================
  {
    _id: "6964cadeb2a92667023e30c1",
    label: "Nukus",
    value: "nukus",
    region: "Qoraqalpog'iston Respublikasi"
  },
  {
    _id: "6964cadeb2a92667023e30c2",
    label: "Xo'jayli",
    value: "xojayli",
    region: "Qoraqalpog'iston Respublikasi"
  },
  {
    _id: "6964cadeb2a92667023e30c3",
    label: "To'rtko'l",
    value: "tortkol",
    region: "Qoraqalpog'iston Respublikasi"
  },
  {
    _id: "6964cadeb2a92667023e30c4",
    label: "Beruniy",
    value: "beruniy",
    region: "Qoraqalpog'iston Respublikasi"
  },
  {
    _id: "6964cadeb2a92667023e30c5",
    label: "Qo'ng'irot",
    value: "qongirot",
    region: "Qoraqalpog'iston Respublikasi"
  },
  // =========================
  // TOSHKENT SHAHAR
  // =========================
  {
    _id: "6964cadeb2a92667023e30c6",
    label: "Toshkent",
    value: "toshkent",
    region: "Toshkent shahri"
  },
  // =========================
  // TOSHKENT VILOYATI
  // =========================
  {
    _id: "6964cadeb2a92667023e30c7",
    label: "Chirchiq",
    value: "chirchiq",
    region: "Toshkent viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30c8",
    label: "Angren",
    value: "angren",
    region: "Toshkent viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30c9",
    label: "Olmaliq",
    value: "olmaliq",
    region: "Toshkent viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30ca",
    label: "Bekobod",
    value: "bekobod",
    region: "Toshkent viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30cb",
    label: "Yangiyo'l",
    value: "yangiyol",
    region: "Toshkent viloyati"
  },
  // =========================
  // SAMARQAND
  // =========================
  {
    _id: "6964cadeb2a92667023e30cc",
    label: "Samarqand",
    value: "samarqand",
    region: "Samarqand viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30cd",
    label: "Kattaqo'rg'on",
    value: "kattaqorgon",
    region: "Samarqand viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30ce",
    label: "Urgut",
    value: "urgut",
    region: "Samarqand viloyati"
  },
  // =========================
  // BUXORO
  // =========================
  {
    _id: "6964cadeb2a92667023e30cf",
    label: "Buxoro",
    value: "buxoro",
    region: "Buxoro viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d0",
    label: "G'ijduvon",
    value: "gijduvon",
    region: "Buxoro viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d1",
    label: "Kogon",
    value: "kogon",
    region: "Buxoro viloyati"
  },
  // =========================
  // FARG'ONA
  // =========================
  {
    _id: "6964cadeb2a92667023e30d2",
    label: "Farg'ona",
    value: "fargona",
    region: "Farg'ona viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d3",
    label: "Marg'ilon",
    value: "margilon",
    region: "Farg'ona viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d4",
    label: "Qo'qon",
    value: "qoqon",
    region: "Farg'ona viloyati"
  },
  // =========================
  // ANDIJON
  // =========================
  {
    _id: "6964cadeb2a92667023e30d5",
    label: "Andijon",
    value: "andijon",
    region: "Andijon viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d6",
    label: "Asaka",
    value: "asaka",
    region: "Andijon viloyati"
  },
  // =========================
  // NAMANGAN
  // =========================
  {
    _id: "6964cadeb2a92667023e30d7",
    label: "Namangan",
    value: "namangan",
    region: "Namangan viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30d8",
    label: "Chust",
    value: "chust",
    region: "Namangan viloyati"
  },
  // =========================
  // QASHQADARYO
  // =========================
  {
    _id: "6964cadeb2a92667023e30d9",
    label: "Qarshi",
    value: "qarshi",
    region: "Qashqadaryo viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30da",
    label: "Shahrisabz",
    value: "shahrisabz",
    region: "Qashqadaryo viloyati"
  },
  // =========================
  // SURXONDARYO
  // =========================
  {
    _id: "6964cadeb2a92667023e30db",
    label: "Termiz",
    value: "termiz",
    region: "Surxondaryo viloyati"
  },
  // =========================
  // JIZZAX
  // =========================
  {
    _id: "6964cadeb2a92667023e30e0",
    label: "Jizzax",
    value: "jizzax",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e1",
    label: "Zomin",
    value: "zomin",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e2",
    label: "Zarbdor",
    value: "zarbdor",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e3",
    label: "Do'stlik",
    value: "dostlik",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e4",
    label: "Forish",
    value: "forish",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e5",
    label: "G'allaorol",
    value: "gallaorol",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e6",
    label: "Mirzacho'l",
    value: "mirzachol",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e7",
    label: "Paxtakor",
    value: "paxtakor",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e8",
    label: "Yangiobod",
    value: "yangiobod",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30e9",
    label: "Arnasoy",
    value: "arnasoy",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30ea",
    label: "Baxmal",
    value: "baxmal",
    region: "Jizzax viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30eb",
    label: "Sharof Rashidov",
    value: "sharof_rashidov",
    region: "Jizzax viloyati"
  },
  // =========================
  // XORAZM
  // =========================
  {
    _id: "6964cadeb2a92667023e30dc",
    label: "Urganch",
    value: "urganch",
    region: "Xorazm viloyati"
  },
  {
    _id: "6964cadeb2a92667023e30dd",
    label: "Xiva",
    value: "xiva",
    region: "Xorazm viloyati"
  }
];
const specialties = [
  'Terapevt', 'Ortoped', 'Ayol shifokor', 'Bolalar stomatologi', 'Хирург',
  'Ортодонт', 'Пародонтолог', 'Имплантолог', 'Гигиенист', 'Эндодонт',
  'Протезист', 'Челюстно-лицевой хирург'
];

function AllDoctorsEdit() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [location, setLocation] = useState({ lat: '', lng: '' });

  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const regions = [...new Set(uzbekistanCities.map(c => c.region))].sort();
  const filteredCities = uzbekistanCities.filter(c => c.region === selectedRegion);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error("Token topilmadi. Iltimos tizimga kiring.");

        const response = await axios.get('https://app.dentago.uz/api/admin/all/doctors?limit=1000', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const data = response.data?.data || response.data?.doctors || response.data || [];
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Xato:', err);
        let errorMessage = 'Ma\'lumotlarni yuklab bo\'lmadi.';
        if (err.response?.status === 401) errorMessage = '401 Unauthorized — token noto\'g\'ri yoki muddati o\'tgan.';
        else if (err.response?.status === 403) errorMessage = '403 Forbidden — huquqingiz yo\'q.';
        else if (err.message.includes('Token topilmadi')) errorMessage = err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedFile(null);
    setPreviewUrl(doctor.avatar || null);

    const initialSpecialties = Array.isArray(doctor.specialty)
      ? doctor.specialty
      : typeof doctor.specialty === 'string'
        ? doctor.specialty.split(', ').filter(item => item.trim() !== '')
        : [];

    setSelectedSpecialties(initialSpecialties);
    setSelectedRegion(doctor.region || '');
    setSelectedCity(
      uzbekistanCities.find(c => c.label === doctor.city || c.value === doctor.city)?.value || doctor.city || ''
    );

    setLocation({
      lat: doctor.clinic?.location?.lat?.toString() || '',
      lng: doctor.clinic?.location?.lng?.toString() || ''
    });

    reset({
      fullName: doctor.fullName || '',
      gender: doctor.gender || 'male',
      phone: doctor.phone || '',
      price: doctor.price || 0,
      experienceYears: doctor.experienceYears || 0,
      clinicName: doctor.clinic?.name || '',
      clinicAddress: doctor.clinic?.address || '',
      description: doctor.description || '',
      isActive: doctor.isActive !== false,
      isAvailable24x7: !!doctor.isAvailable24x7,
      workTimeStart: doctor.workTime?.start || '09:00',
      workTimeEnd: doctor.workTime?.end || '18:00',
    });

    setShowEditModal(true);
  };

  const handleDeleteClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctor?._id) return;
    setDeleting(true);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `https://app.dentago.uz/api/admin/doctors/${selectedDoctor._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDoctors(prev => prev.filter(d => d._id !== selectedDoctor._id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('O‘chirish xatosi:', err);
      console.log('❌ O‘chirishda xato: ' + (err.response?.data?.message || err.message || 'Noma\'lum xato'));
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      console.log('Faqat rasm fayllarini tanlang!');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (!selectedDoctor?._id) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      let avatarUrl = selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'Doctor')}&background=00BCE4&color=fff`;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await axios.post(
          'https://app.dentago.uz/api/upload/image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const filename = uploadRes.data?.file?.savedName || uploadRes.data?.filename;
        if (filename) {
          avatarUrl = `https://app.dentago.uz/images/${filename}`;
        }
      }

      const selectedCityData = uzbekistanCities.find(c => c.value === selectedCity);

      const payload = {
        fullName: data.fullName?.trim() || '',
        gender: data.gender || 'male',
        specialty: selectedSpecialties.join(', '),
        phone: data.phone?.trim() || '',
        price: Number(data.price) || 0,
        experienceYears: Number(data.experienceYears) || 0,
        description: data.description?.trim() || '',
        isActive: !!data.isActive,
        isAvailable24x7: !!data.isAvailable24x7,
        region: selectedRegion,
        city: selectedCityData ? selectedCityData.label : selectedCity,
        clinic: {
          name: data.clinicName?.trim() || '',
          address: data.clinicAddress?.trim() || '',
          location: {
            lat: location.lat ? parseFloat(location.lat) : null,
            lng: location.lng ? parseFloat(location.lng) : null,
          },
        },
        workTime: {
          start: data.workTimeStart || '09:00',
          end: data.workTimeEnd || '18:00',
        },
        avatar: avatarUrl,
      };

      await axios.put(
        `https://app.dentago.uz/api/admin/doctors/${selectedDoctor._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setDoctors(prev =>
        prev.map(d =>
          d._id === selectedDoctor._id ? { ...d, ...payload, clinic: { ...d.clinic, ...payload.clinic } } : d
        )
      );

      setShowEditModal(false);
      // alert('✅ Ma\'lumotlar muvaffaqiyatli yangilandi!');
    } catch (err) {
      console.error('Yangilash xatosi:', err);
      console.log('❌ Yangilashda xato: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (doctor.fullName?.toLowerCase() || '').includes(searchLower) ||
      (doctor.specialty?.toLowerCase() || '').includes(searchLower) ||
      (doctor.phone?.toLowerCase() || '').includes(searchLower) ||
      (doctor.clinic?.name?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading) return <LoadingSpinner text="Doktorlar yuklanmoqda" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Xato yuz berdi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800" style={{ color: '#00BCE4' }}>
                  Barcha Shifokorlar
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Jami: {doctors.length} ta shifokor</span>
                </p>
              </div>

              <div className="relative w-full md:w-auto md:min-w-[400px]">
                <input
                  type="text"
                  placeholder="Shifokor qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition outline-none"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="unified-table-container">
          <div className="overflow-x-auto">
            <table className="unified-table">
              <thead className="bg-gray-50"  >
                <tr>
                  <th className="py-4 px-6 text-left text-white font-semibold">#</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Rasm</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Shifokor</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Mutaxassislik</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Telefon</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Status</th>
                  <th className="py-4 px-6 text-left text-white font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-600">
                      Shifokor topilmadi yoki qidiruv bo'yicha natija yo'q
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor, index) => (
                    <tr key={doctor._id} className="hover:bg-cyan-50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-gray-700 font-medium">{index + 1}</td>
                      <td className="py-4 px-6">
                        {doctor.avatar ? (
                          <img
                            src={doctor.avatar}
                            alt={doctor.fullName}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={e => e.target.src = `https://ui-avatars.com/api/?name=${doctor.fullName}&background=667eea&color=fff`}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {doctor.fullName?.[0] || 'D'}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-800">{doctor.fullName || 'Noma\'lum'}</div>
                        <div className="text-sm text-gray-500">
                          {doctor.gender === 'male' ? 'Erkak' : 'Ayol'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                          {(doctor.specialty || '-').length > 20
                            ? (doctor.specialty || '-').slice(0, 20) + '...'
                            : (doctor.specialty || '-')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <a href={`tel:${doctor.phone}`} className="text-cyan-600 hover:underline" style={{ color: '#00BCE4' }}>
                          {doctor.phone || '-'}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {doctor.isActive ? 'Faol' : 'Faol emas'}
                        </span>
                      </td>
                      <td className="py-6 px-6 flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="p-2 rounded-lg hover:bg-cyan-100 transition cursor-pointer text-cyan-600"
                          title="Tahrirlash"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(doctor)}
                          className="p-2 rounded-lg hover:bg-red-100 transition cursor-pointer text-red-600"
                          title="O'chirish"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tahrirlash Modal — o'zgarmagan */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-200">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 border-b border-cyan-300 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-white">Shifokorni Tahrirlash</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded cursor-pointer transition">
                <X size={24} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 bg-gray-50">
              {/* Rasm yuklash */}
              <div>
                <label className="block text-sm font-medium mb-2">Shifokor rasmi</label>
                <div
                  className="w-32 h-32 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500 transition"
                  onClick={() => fileInputRef.current.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <UserCircle size={48} className="text-gray-400" />
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Asosiy ma'lumotlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">To'liq ism *</label>
                  <input {...register('fullName', { required: 'Ism majburiy' })} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Jins</label>
                  <select {...register('gender')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none">
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input {...register('phone')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Narx (so'm)</label>
                  <input type="number" {...register('price')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tajriba (yil)</label>
                  <input type="number" {...register('experienceYears')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>

              {/* Viloyat va shahar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Viloyat *</label>
                  <select
                    value={selectedRegion}
                    onChange={e => { setSelectedRegion(e.target.value); setSelectedCity(''); }}
                    className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="">Tanlang</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tuman/Shahar *</label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full p-3 border border-cyan-200 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="">Tanlang</option>
                    {filteredCities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Mutaxassisliklar */}
              <div>
                <label className="block text-sm font-medium mb-2">Mutaxassisliklar</label>
                <div className="border border-cyan-200 p-3 rounded-lg flex flex-wrap gap-2 min-h-[50px] bg-white">
                  {selectedSpecialties.map((spec, i) => (
                    <div key={i} className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full flex items-center gap-1">
                      {spec}
                      <button type="button" onClick={() => setSelectedSpecialties(prev => prev.filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-800 cursor-pointer">×</button>
                    </div>
                  ))}
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value && !selectedSpecialties.includes(e.target.value)) {
                        setSelectedSpecialties([...selectedSpecialties, e.target.value]);
                      }
                    }}
                    className="flex-1 min-w-[150px] border-none bg-transparent focus:outline-none"
                  >
                    <option value="">Qo'shish...</option>
                    {specialties.map(s => !selectedSpecialties.includes(s) && <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Klinika */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Klinika nomi</label>
                  <input {...register('clinicName')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Manzil</label>
                  <input {...register('clinicAddress')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>

              {/* Joylashuv */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="text"
                    value={location.lat}
                    onChange={e => setLocation({ ...location, lat: e.target.value })}
                    className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="41.3111"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="text"
                    value={location.lng}
                    onChange={e => setLocation({ ...location, lng: e.target.value })}
                    className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="69.2797"
                  />
                </div>
              </div>

              {/* Ish vaqti */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Ish boshlanishi</label>
                  <input type="time" {...register('workTimeStart')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ish tugashi</label>
                  <input type="time" {...register('workTimeEnd')} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-sm font-medium mb-1">Tavsif</label>
                <textarea {...register('description')} rows={4} className="w-full p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>

              {/* Checkboxlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="border border-cyan-200 py-5 rounded-lg px-6 cursor-pointer hover:bg-cyan-50 transition" style={{ backgroundColor: selectedDoctor?.isActive ? '#e6f7ff' : 'white' }}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('isActive')} className="w-5 h-5 cursor-pointer focus:ring-cyan-500 focus:outline-none" />
                    <span className="text-gray-700">Faol</span>
                  </div>
                </label>

                <label className="border border-cyan-200 py-5 rounded-lg px-6 cursor-pointer hover:bg-cyan-50 transition" style={{ backgroundColor: selectedDoctor?.isActive ? '#e6f7ff' : 'white' }}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('isAvailable24x7')} className="w-5 h-5 cursor-pointer focus:ring-cyan-500 focus:outline-none" />
                    <span className="text-gray-700">24/7 mavjud</span>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-6 border-t border-cyan-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 cursor-pointer border border-cyan-300 rounded-lg hover:bg-cyan-50 text-cyan-700 transition">
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 cursor-pointer text-white rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition"
                  style={{ backgroundColor: '#00BCE4' }}
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yangi: O'chirish tasdiqlash modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={28} />
              <h3 className="text-xl font-bold text-red-800">O‘chirishni tasdiqlang</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Haqiqatan ham quyidagi shifokorni o‘chirmoqchimisiz?
              </p>
              <p className="font-semibold text-gray-900 mb-6">
                {selectedDoctor.fullName || 'Noma\'lum shifokor'}
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                >
                  Bekor qilish
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleting && <Loader2 className="animate-spin" size={18} />}
                  O‘chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllDoctorsEdit;
