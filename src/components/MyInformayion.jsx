import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {
  UserCircle,
  BriefcaseMedical,
  Calendar,
  Users,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Save,
  Loader2,
  Edit,
  Trash2,
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin as MapIcon,
  User,
  Plus,
  ArrowUp,
  Globe
} from 'lucide-react';

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

function MyInformation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [entities, setEntities] = useState([]); // doctors or technicians
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewEntity, setViewEntity] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [showMapModal, setShowMapModal] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  const regions = [...new Set(uzbekistanCities.map(city => city.region))].sort();
  const filteredCities = uzbekistanCities.filter(city => city.region === selectedRegion);

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    setToken(savedToken);
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setIsLoading(false);
    if (!savedToken) {
      setSubmitMessage({
        type: 'error',
        text: '❌ Access token topilmadi. localStorage.setItem("accessToken", "YOUR_TOKEN") qilib sinab ko\'ring'
      });
    }
  }, []);

  useEffect(() => {
    if (token && userRole) {
      fetchEntities();
    }
  }, [token, userRole]);

  const getEndpoint = (type) => {
    if (userRole === 'technician') {
      switch (type) {
        case 'list': return 'https://app.dentago.uz/api/admin/technicians?limit=100000';
        case 'single': return 'https://app.dentago.uz/api/admin/technicians';
        case 'base': return 'https://app.dentago.uz/api/admin/technicians';
      }
    } else {
      switch (type) {
        case 'list': return 'https://app.dentago.uz/api/admin/doctors?limit=100000';
        case 'single': return 'https://app.dentago.uz/api/admin/doctors';
        case 'base': return 'https://app.dentago.uz/api/admin/doctors';
      }
    }
  };

  const fetchEntities = async () => {
    try {
      console.log('Yuklash boshlandi...');
      setDebugInfo('Yuklash boshlandi...');
      const response = await axios.get(getEndpoint('list'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Server response:', response);
      setDebugInfo(`Response status: ${response.status}, Data length: ${response.data?.length || 0}`);
      let entitiesData = [];
      if (Array.isArray(response.data)) {
        entitiesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        entitiesData = response.data.data;
      } else if (response.data && response.data.doctors) {
        entitiesData = response.data.doctors;
      } else if (response.data && response.data.items) {
        entitiesData = response.data.items;
      } else if (response.data && typeof response.data === 'object') {
        entitiesData = Object.values(response.data);
      }
      console.log('Loaded entities:', entitiesData);
      setEntities(entitiesData);
      setDebugInfo(`Son: ${entitiesData.length}`);
    } catch (error) {
      console.error('Yuklashda xato:', error);
      setDebugInfo(`Xato: ${error.message}`);
      setSubmitMessage({
        type: 'error',
        text: `Yuklashda xato: ${error.message}`
      });
    }
  };

  const handleViewEntity = async (id) => {
    try {
      if (!id) {
        console.log('ID topilmadi');
        setDebugInfo('ID topilmadi');
        return;
      }
      console.log('View ID:', id);
      setDebugInfo(`ID orqali yuklanmoqda: ${id}`);
      const response = await axios.get(
        `${getEndpoint('single')}/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('View response:', response.data);
      const entityData = response.data?.data || response.data || null;
      if (entityData) {
        setViewEntity(entityData);
        setIsViewModalOpen(true);
        setDebugInfo(`Ma'lumotlari yuklandi`);
      } else {
        setDebugInfo('Ma\'lumotlari topilmadi');
        console.log('Ma\'lumotlari topilmadi');
      }
    } catch (error) {
      console.error('Ko\'rishda xato:', error);
      setDebugInfo(`Xato: ${error.response?.status || error.message}`);
      let errorMsg = 'Ma\'lumotlarini yuklashda xato yuz berdi';
      if (error.response?.status === 404) errorMsg = 'Topilmadi (404)';
      else if (error.response?.status === 401) errorMsg = 'Kirish huquqi yo\'q (401)';
      else if (error.response?.status === 403) errorMsg = 'Ruxsat yo\'q (403)';
      else if (error.response?.status === 500) errorMsg = 'Server xatosi (500)';
      console.log(errorMsg);
    }
  };

  const handleEditEntity = (entity) => {
    console.log('Edit:', entity);
    if (!entity || (!entity._id && !entity.id)) {
      console.log('Ma\'lumotlari noto\'g\'ri');
      return;
    }
    setSelectedEntity(entity);
    setIsEditing(true);
    setShowForm(true);
    setIsFormCollapsed(false);
    const formValues = {
      fullName: entity.fullName || entity.name || '',
      experienceYears: entity.experienceYears || entity.experience || 5,
      phone: entity.phone || entity.phoneNumber || '',
      description: entity.description || entity.bio || '',
    };
    if (userRole !== 'technician') {
      formValues.gender = entity.gender || 'male';
      formValues.clinicName = entity.clinic?.name || entity.hospitalName || '';
      formValues.clinicAddress = entity.clinic?.address || entity.address || '';
      formValues.price = entity.price || entity.consultationPrice || 150000;
      formValues.workTimeStart = entity.workTime?.start || entity.workHours?.start || '09:00';
      formValues.workTimeEnd = entity.workTime?.end || entity.workHours?.end || '18:00';
      formValues.isAvailable24x7 = entity.isAvailable24x7 || entity.available24_7 || false;
      formValues.isActive = entity.isActive !== undefined ? entity.isActive : true;
      const entitySpecialty = entity.specialty || entity.specialization || 'Terapevt';
      if (Array.isArray(entitySpecialty)) {
        setSelectedSpecialties(entitySpecialty);
      } else {
        const specialtyArray = String(entitySpecialty).split(', ').filter(item => item.trim() !== '');
        setSelectedSpecialties(specialtyArray.length > 0 ? specialtyArray : ['Terapevt']);
      }
    } else {
      formValues.address = entity.address || '';
    }
    formValues.region = entity.region || '';
    formValues.city = entity.city || '';
    console.log('Form values to reset:', formValues);
    reset(formValues);
    if (formValues.region) setSelectedRegion(formValues.region);
    if (formValues.city) {
      const cityData = uzbekistanCities.find(c => c.label === formValues.city || c.value === formValues.city);
      setSelectedCity(cityData ? cityData.value : formValues.city);
    }
    if (entity.location || entity.clinic?.location) {
      const loc = entity.location || entity.clinic?.location;
      setLocation({
        lat: loc.lat?.toString() || '',
        lng: loc.lng?.toString() || ''
      });
    } else {
      setLocation({ lat: '', lng: '' });
    }
    if (entity.avatar || entity.profileImage || entity.image) {
      setPreviewUrl(entity.avatar || entity.profileImage || entity.image);
    } else {
      setPreviewUrl(null);
    }
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteEntity = async (id) => {
    if (!id) {
      console.log('ID topilmadi');
      return;
    }
    if (!window.confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    try {
      await axios.delete(
        `${getEndpoint('base')}/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEntities(entities.filter(entity => (entity._id || entity.id) !== id));
      setSubmitMessage({ type: 'success', text: '✅ Muvaffaqiyatli o\'chirildi!' });
    } catch (error) {
      console.error('O\'chirishda xato:', error);
      setSubmitMessage({ type: 'error', text: `❌ O'chirishda xato: ${error.message}` });
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onChange' });

  const openMapSelector = () => {
    setIsMapLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude.toString(), lng: longitude.toString() });
          console.log(`Joriy joylashuvingiz aniqlandi: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsMapLoading(false);
        },
        (error) => {
          console.error('Geolokatsiya xatosi:', error);
          console.log('Joylashuvni aniqlashda xatolik yuz berdi. Iltimos, koordinatalarni qo\'lda kiriting.');
          setIsMapLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      console.log('Sizning brauzeringiz geolokatsiya funksiyasini qo\'llab-quvvatlamaydi.');
      setIsMapLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedEntity(null);
    reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFormCollapsed(true);
    setSubmitMessage({ type: '', text: '' });
    setSelectedRegion('');
    setSelectedCity('');
    setSelectedSpecialties([]);
    setLocation({ lat: '', lng: '' });
    setShowMapModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      console.log('Faqat rasm fayllarini tanlashingiz mumkin!');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const createSubscriptionData = () => {
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);
    return {
      startAt: now.toISOString(),
      endAt: oneYearLater.toISOString(),
      isActive: true
    };
  };

  const onSubmit = async (data) => {
    if (!token) {
      setSubmitMessage({ type: 'error', text: '❌ Token mavjud emas!' });
      return;
    }
    if (!selectedRegion || !selectedCity) {
      setSubmitMessage({ type: 'error', text: '❌ Viloyat va tuman/shaharni tanlang!' });
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    setDebugInfo('Form yuborilmoqda...');
    try {
      let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || (userRole === 'technician' ? 'Technician' : 'Doctor'))}&background=00BCE4&color=fff`;
      if (selectedFile) {
        setDebugInfo('Rasm yuklanmoqda...');
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
          const uploadRes = await axios.post(
            'https://app.dentago.uz/api/upload/image',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
          );
          console.log('Upload response:', uploadRes.data);
          let filename = uploadRes.data?.file?.savedName || uploadRes.data?.filename || (uploadRes.data?.url ? uploadRes.data.url.split('/').pop() : null);
          if (filename) avatarUrl = `https://app.dentago.uz/images/${filename}`;
        } catch (uploadError) {
          console.warn('Rasm yuklashda xato:', uploadError);
        }
      } else if (isEditing && selectedEntity && (selectedEntity.avatar || selectedEntity.image)) {
        avatarUrl = selectedEntity.avatar || selectedEntity.image;
      }
      const selectedCityData = uzbekistanCities.find(city => city.value === selectedCity);
      let entityData = {
        fullName: data.fullName?.trim() || 'Noma\'lum',
        experienceYears: Number(data.experienceYears) || 0,
        phone: data.phone?.trim() || '',
        description: data.description?.trim() || '',
        region: selectedRegion,
        city: selectedCityData ? selectedCityData.label : selectedCity,
        location: {
          lat: location.lat ? parseFloat(location.lat) : 41.3111,
          lng: location.lng ? parseFloat(location.lng) : 69.2797
        },
        avatar: avatarUrl
      };
      if (userRole !== 'technician') {
        entityData.gender = data.gender || 'male';
        entityData.specialty = selectedSpecialties.length > 0 ? selectedSpecialties.join(', ') : '';
        entityData.price = Number(data.price) || 0;
        entityData.clinic = {
          name: data.clinicName?.trim() || 'Noma\'lum Klinika',
          address: data.clinicAddress?.trim() || 'Manzil kiritilmagan',
          location: entityData.location,
          distanceKm: 2.5
        };
        entityData.workTime = {
          start: data.workTimeStart || '09:00',
          end: data.workTimeEnd || '18:00'
        };
        entityData.subscription = createSubscriptionData();
        entityData.isAvailable24x7 = !!data.isAvailable24x7;
        entityData.isActive = !!data.isActive;
      } else {
        entityData.address = data.address?.trim() || 'Manzil kiritilmagan';
      }
      console.log('Yuborilayotgan ma\'lumot:', entityData);
      setDebugInfo(`Ma'lumot yuborilmoqda (${isEditing ? 'PUT' : 'POST'})...`);
      let response;
      let entityId = isEditing && selectedEntity ? (selectedEntity._id || selectedEntity.id) : null;
      if (isEditing && entityId) {
        response = await axios.put(
          `${getEndpoint('base')}/${entityId}`,
          entityData,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          getEndpoint('base'),
          entityData,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
        );
      }
      console.log('Server response:', response.data);
      setDebugInfo(`Muvaffaqiyatli: ${response.status}`);
      if (response.status === 200 || response.status === 201) {
        reset();
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedEntity(null);
        setIsEditing(false);
        setShowForm(false);
        setIsFormCollapsed(true);
        setSelectedRegion('');
        setSelectedCity('');
        await fetchEntities();
        setSubmitMessage({
          type: 'success',
          text: `✅ ${userRole === 'technician' ? 'Texnik' : 'Shifokor'} ${isEditing ? 'tahrirlandi' : 'qo\'shildi'}!`
        });
      }
    } catch (err) {
      console.error('Form yuborishda xato:', err);
      console.error('Error response:', err.response?.data);
      let msg = 'Xatolik yuz berdi';
      if (err.response) {
        if (err.response.status === 400) msg = '❌ 400 Bad Request: Maydonlar noto\'g\'ri';
        else if (err.response.status === 401) msg = '❌ Token noto\'g\'ri';
        else if (err.response.status === 403) msg = '❌ 403 Forbidden';
        else if (err.response.status === 409) msg = '❌ Bu ma\'lumot allaqachon mavjud';
        else if (err.response.status === 404) msg = '❌ 404 Not Found';
        else if (err.response.status === 500) msg = '❌ 500 Server Error';
        else msg = `❌ Server xatosi: ${err.response.status}`;
      } else if (err.code === 'ERR_NETWORK') msg = '❌ Internet aloqasi uzildi';
      else if (err.code === 'ERR_BAD_REQUEST') msg = '❌ Noto\'g\'ri so\'rov';
      setDebugInfo(`Xato: ${msg}`);
      setSubmitMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const specialties = [
    'Terapevt',
    'Ortoped',
    'Ayol shifokor',
    'Bolalar stomatologi',
    'Хирург',
    'Ортодонт',
    'Пародонтолог',
    'Имплантолог',
    'Гигиенист',
    'Эндодонт',
    'Протезист',
    'Челюстно-лицевой хирург'
  ];

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedEntity(null);
    setShowForm(true);
    setIsFormCollapsed(false);
    reset({
      fullName: '',
      experienceYears: 5,
      phone: '',
      description: '',
      region: '',
      city: ''
    });
    if (userRole !== 'technician') {
      reset({
        gender: 'male',
        clinicName: '',
        clinicAddress: '',
        price: 150000,
        workTimeStart: '09:00',
        workTimeEnd: '18:00',
        isAvailable24x7: false,
        isActive: true
      });
      setSelectedSpecialties([]);
    } else {
      reset({ address: '' });
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setSelectedRegion('');
    setSelectedCity('');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredEntities = entities.filter(entity => {
    const name = (entity.fullName || entity.name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    let specialty = '';
    if (userRole !== 'technician') {
      specialty = entity.specialty || entity.specialization || '';
      const specialtiesArray = Array.isArray(specialty) ? specialty.map(s => s.toLowerCase()) : String(specialty).toLowerCase().split(', ');
      const clinicName = (entity.clinic?.name || entity.hospitalName || '').toLowerCase();
      const region = (entity.region || '').toLowerCase();
      const city = (entity.city || '').toLowerCase();
      return (
        name.includes(search) ||
        specialtiesArray.some(spec => spec.includes(search)) ||
        clinicName.includes(search) ||
        region.includes(search) ||
        city.includes(search)
      );
    } else {
      const address = (entity.address || '').toLowerCase();
      const region = (entity.region || '').toLowerCase();
      const city = (entity.city || '').toLowerCase();
      return name.includes(search) || address.includes(search) || region.includes(search) || city.includes(search);
    }
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);

  const EntityCard = ({ entity, onView, onEdit, onDelete }) => {
    const id = entity._id || entity.id;
    const name = entity.fullName || entity.name || (userRole === 'technician' ? 'Noma\'lum Texnik' : 'Noma\'lum Shifokor');
    const experienceYears = entity.experienceYears || entity.experience || 0;
    const avatar = entity.avatar || entity.profileImage || entity.image || null;
    const region = entity.region || '';
    const city = entity.city || '';
    if (userRole !== 'technician') {
      const specialty = entity.specialty || entity.specialization || 'Mutaxassislik kiritilmagan';
      const specialtiesArray = Array.isArray(specialty) ? specialty : String(specialty).split(', ');
      const price = entity.price || entity.consultationPrice || 0;
      return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300">
          <div className="relative h-48 bg-gray-50">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00BCE4&color=fff`; }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {price && price > 0 && (
            <div className="absolute top-4 right-4">
           
            </div>
            )}
          </div>
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
              <div className="flex flex-wrap gap-2">
                {specialtiesArray.slice(0, 2).map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 text-[#00BCE4] font-medium">
                    <BriefcaseMedical className="w-4 h-4" />
                    {spec}
                  </div>
                ))}
                {specialtiesArray.length > 2 && <div className="flex items-center text-[#00BCE4] font-medium">...</div>}
              </div>
              {(region || city) && (
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                  <Globe className="w-3 h-3" />
                  <span>{region}{city ? `, ${city}` : ''}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{experienceYears} yil tajriba</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => id && onView(id)}
                disabled={!id}
                className={`flex-1 bg-[#00BCE4] cursor-pointer hover:bg-[#0096b8] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Eye className="w-4 h-4" />
                Profilni ko'rish
              </button>
              <button
                onClick={() => onEdit(entity)}
                className="px-4 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
                title="Tahrirlash"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => id && onDelete(id)}
                disabled={!id}
                className={`px-4 py-2.5 bg-rose-50 cursor-pointer hover:bg-rose-100 text-rose-600 rounded-xl transition-colors ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Technician Card
      return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300">
          <div className="relative h-48 bg-gray-50">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00BCE4&color=fff`; }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
              {(region || city) && (
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                  <Globe className="w-3 h-3" />
                  <span>{region}{city ? `, ${city}` : ''}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{experienceYears} yil tajriba</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => id && onView(id)}
                disabled={!id}
                className={`flex-1 bg-[#00BCE4] hover:bg-[#0096b8] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Eye className="w-4 h-4" />
                Profilni ko'rish
              </button>
              <button
                onClick={() => onEdit(entity)}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
                title="Tahrirlash"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => id && onDelete(id)}
                disabled={!id}
                className={`px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#00BCE4]" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {userRole === 'technician' ? 'Texniklar Boshqaruvi' : 'Shifokorlar Boshqaruvi'}
              </h1>
              <p className="text-gray-500 mt-2">
                {entities.length} ta, {filteredEntities.length} ta topildi
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-[#00BCE4] cursor-pointer hover:bg-[#0096b8] text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-all"
            >
              <Plus className="w-5 h-5" />
              Yangi {userRole === 'technician' ? 'Texnik' : 'Shifokor'} Qo'shish
            </button>
          </div>
          <div className="grid md:grid-cols-1 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-6 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={userRole === 'technician' ? "Texnik ismi, viloyati yoki manzili bo'yicha qidirish..." : "Shifokor ismi, mutaxassisligi, viloyati yoki klinika nomi bo'yicha qidirish..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </div>
        {submitMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {submitMessage.text}
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Barchasi</h2>
          {entities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Topilmadi</h3>
              <p className="text-gray-500 mb-4">
                Hali qo'shilmagan yoki yuklashda xatolik yuz berdi
              </p>
              <button
                onClick={fetchEntities}
                className="bg-[#00BCE4] cursor-pointer hover:bg-[#0096b8] text-white font-semibold py-2 px-6 rounded-xl transition-colors"
              >
                Qayta Yuklash
              </button>
            </div>
          ) : paginatedEntities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Qidiruv natijasi topilmadi</h3>
              <p className="text-gray-500">
                "{searchTerm}" bo'yicha hech narsa topilmadi
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {paginatedEntities.map((entity, index) => (
                  <EntityCard
                    key={entity._id || entity.id || index}
                    entity={entity}
                    onView={handleViewEntity}
                    onEdit={handleEditEntity}
                    onDelete={handleDeleteEntity}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Sahifa <span className="font-semibold">{currentPage}</span> dan <span className="font-semibold">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 cursor-pointer rounded-full text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg cursor-pointer ${currentPage === pageNum ? 'bg-[#00BCE4] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'} transition-colors`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {showForm && (
          <div ref={formRef} className="bg-white rounded-2xl border border-gray-200 mb-8 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? (userRole === 'technician' ? 'Texnikni Tahrirlash' : 'Shifokorni Tahrirlash') : (userRole === 'technician' ? 'Yangi Texnik Qo\'shish' : 'Yangi Shifokor Qo\'shish')}
                </h2>
                {isEditing && selectedEntity && (
                  <p className="text-gray-600 mt-1">
                    ID: {selectedEntity._id || selectedEntity.id}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                  className="p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition"
                  title={isFormCollapsed ? "Formani ko'rsatish" : "Formani yashirish"}
                >
                  {isFormCollapsed ? <ArrowUp className="w-5 h-5 transform rotate-180" /> : <ArrowUp className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleCloseForm}
                  className="p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition"
                  title="Formani yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {!isFormCollapsed && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-start mb-8">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-[10px] overflow-hidden bg-white cursor-pointer hover:opacity-90 transition border-2 border-[#00BCE4] relative"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userRole === 'technician' ? 'Technician' : 'Doctor')}&background=00BCE4&color=fff`; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <UserCircle className="w-10 h-10 mb-1" />
                        <span className="text-xs">Rasm yuklash</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : (isEditing && selectedEntity?.avatar) ? 'Joriy rasm' : 'Rasmni tanlang'}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">
                    Asosiy Ma'lumotlar
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <UserCircle className="w-4 h-4" /> To'liq Ismi *
                    </label>
                    <input
                      {...register('fullName', { required: 'Ism majburiy', minLength: { value: 3, message: 'Kamida 3 ta belgi' } })}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                      placeholder="Aliyev Ali Aliyevich"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                  </div>
                  {userRole !== 'technician' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Jins *
                        </label>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="male" {...register('gender', { required: 'Jinsni tanlang' })} className="w-5 h-5 text-[#00BCE4]" />
                            <span>Erkak</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="female" {...register('gender', { required: 'Jinsni tanlang' })} className="w-5 h-5 text-[#00BCE4]" />
                            <span>Ayol</span>
                          </label>
                        </div>
                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mutaxassislik *
                        </label>
                        <div className="border border-gray-300 rounded-xl p-2 min-h-[46px] bg-white focus-within:ring-2 focus-within:ring-[#00BCE4]">
                          <div className="flex flex-wrap gap-2 p-1">
                            {selectedSpecialties.map((specialty, index) => (
                              <div key={index} className="bg-[#00BCE4] text-white px-3 py-1 rounded-lg flex items-center gap-1">
                                <span>{specialty}</span>
                                <button type="button" onClick={() => setSelectedSpecialties(selectedSpecialties.filter((_, i) => i !== index))} className="text-white cursor-pointer hover:text-gray-200">×</button>
                              </div>
                            ))}
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value && !selectedSpecialties.includes(e.target.value)) {
                                  setSelectedSpecialties([...selectedSpecialties, e.target.value]);
                                }
                                e.target.value = "";
                              }}
                              className="flex-1 min-w-[100px] border-none outline-none bg-transparent"
                            >
                              <option value="">Qo'shish...</option>
                              {specialties.map(spec => !selectedSpecialties.includes(spec) && <option key={spec} value={spec}>{spec}</option>)}
                            </select>
                          </div>
                        </div>
                        {selectedSpecialties.length === 0 && <p className="mt-1 text-sm text-red-600">Mutaxassislikni tanlang *</p>}
                      </div>
                    </>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Viloyat *
                      </label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCity(''); }}
                        className="w-full cursor-pointer px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition"
                        required
                      >
                        <option value="">Viloyatni tanlang</option>
                        {regions.map(region => <option key={region} value={region}>{region}</option>)}
                      </select>
                      {!selectedRegion && <p className="mt-1  text-sm text-red-600">Viloyatni tanlang</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Tuman/Shahar *
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={!selectedRegion}
                        className={`w-full cursor-pointer px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition ${!selectedRegion ? 'opacity-60 cursor-not-allowed' : ''}`}
                        required
                      >
                        <option value="">Tuman/Shaharni tanlang</option>
                        {filteredCities.map(city => <option key={city._id} value={city.value}>{city.label}</option>)}
                      </select>
                      {!selectedCity && selectedRegion && <p className="mt-1 text-sm text-red-600">Tuman/Shaharni tanlang</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Telefon *
                      </label>
                      <input
                        {...register('phone', { required: 'Telefon raqami majburiy', pattern: { value: /^\+998[0-9]{9}$/, message: '+998XXXXXXXXX formatida kiriting' } })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                        placeholder="+998901234567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition resize-none"
                      placeholder="Qisqacha ma'lumot..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joylashuvni belgilash
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kenglik (Latitude)</label>
                      <input
                        type="text"
                        value={location.lat || ''}
                        onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition"
                        placeholder="41.3111"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Uzunlik (Longitude)</label>
                      <input
                        type="text"
                        value={location.lng || ''}
                        onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition"
                        placeholder="69.2797"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={openMapSelector}
                        className="h-12 cursor-pointer px-4 bg-blue-100 hover:bg-blue-200 rounded-xl border border-blue-300 text-blue-700 font-medium transition-colors ml-2 flex items-center justify-center"
                        disabled={isMapLoading}
                      >
                        {isMapLoading ? (
                          <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <MapPin className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {location.lat && location.lng && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Tanlangan joy:</span> {location.lat}, {location.lng}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">Tajriba</h3>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Tajriba (yil) *
                      </label>
                      <input
                        type="number"
                        {...register('experienceYears', { required: 'Tajriba majburiy', min: { value: 0, message: 'Musbat son kiriting' }, max: { value: 50, message: '50 yildan kam' } })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.experienceYears ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                      />
                      {errors.experienceYears && <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>}
                    </div>
                  </div>
                </div>
                {userRole !== 'technician' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">Klinika Ma'lumotlari</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Building className="w-4 h-4" /> Klinika nomi *
                        </label>
                        <input
                          {...register('clinicName', { required: 'Klinika nomi majburiy', minLength: { value: 2, message: 'Kamida 2 ta belgi' } })}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.clinicName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                          placeholder="Stomatologiya Premium"
                        />
                        {errors.clinicName && <p className="mt-1 text-sm text-red-600">{errors.clinicName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Manzil *
                        </label>
                        <input
                          {...register('clinicAddress', { required: 'Manzil majburiy', minLength: { value: 5, message: 'Kamida 5 ta belgi' } })}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.clinicAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                          placeholder="Toshkent sh., Chilanzor tumani, 45-uy"
                        />
                        {errors.clinicAddress && <p className="mt-1 text-sm text-red-600">{errors.clinicAddress.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">Narx va Ish Vaqti</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Konsultatsiya narxi (so'm) *
                        </label>
                        <input
                          type="number"
                          {...register('price', { required: 'Narx majburiy', min: { value: 0, message: 'Musbat son kiriting' } })}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ish boshlash
                          </label>
                          <input type="time" {...register('workTimeStart')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ish tugash
                          </label>
                          <input type="time" {...register('workTimeEnd')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00BCE4] outline-none transition" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">Qo'shimcha Ma'lumotlar</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                          <input type="checkbox" {...register('isAvailable24x7')} className="w-5 h-5 text-[#00BCE4]" />
                          <div>
                            <span className="font-medium">24/7 qabul</span>
                            <p className="text-sm text-gray-500">Doimiy mavjud</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer hover:bg-gray-50 transition">
                          <input type="checkbox" {...register('isActive')} defaultChecked className="w-5 h-5 text-[#00BCE4]" />
                          <div>
                            <span className="font-medium">Faol</span>
                            <p className="text-sm text-gray-500">Hozirda ishlayapti</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}
                {userRole === 'technician' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-l-4 border-[#00BCE4] pl-3">Manzil</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Manzil *
                      </label>
                      <input
                        {...register('address', { required: 'Manzil majburiy', minLength: { value: 5, message: 'Kamida 5 ta belgi' } })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-[#00BCE4] outline-none transition`}
                        placeholder="Toshkent sh., Chilanzor tumani, 45-uy"
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                    </div>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedRegion || !selectedCity}
                    className={`w-full cursor-pointer py-3.5 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg
                      ${isSubmitting || !selectedRegion || !selectedCity ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#00BCE4] to-[#0099CC] hover:from-[#00A8D4] hover:to-[#0088B3] hover:shadow-xl'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditing ? 'O\'zgarishlarni Saqlash' : 'Saqlash'}
                      </>
                    )}
                  </button>
                  {(!selectedRegion || !selectedCity) && <p className="text-center text-sm text-red-600 mt-2">Viloyat va tuman/shaharni tanlang!</p>}
                  <p className="text-center text-sm text-gray-500 mt-4">* bilan belgilangan maydonlar majburiy</p>
                </div>
              </form>
            )}
          </div>
        )}
        {isViewModalOpen && viewEntity && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Profil</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 border-4 border-white shadow-md">
                      {viewEntity.avatar || viewEntity.profileImage || viewEntity.image ? (
                        <img
                          src={viewEntity.avatar || viewEntity.profileImage || viewEntity.image}
                          alt={viewEntity.fullName || viewEntity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewEntity.fullName || viewEntity.name || 'Entity')}&background=00BCE4&color=fff`; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {viewEntity.fullName || viewEntity.name || 'Noma\'lum'}
                    </h3>
                    {userRole !== 'technician' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(viewEntity.specialty) ? viewEntity.specialty : (Array.isArray(viewEntity.specialization) ? viewEntity.specialization : String(viewEntity.specialty || viewEntity.specialization || 'Mutaxassislik kiritilmagan').split(', '))).map((spec, index) => (
                          <div key={index} className="flex items-center gap-2 text-[#00BCE4] font-semibold">
                            <BriefcaseMedical className="w-5 h-5" />
                            {spec}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {userRole !== 'technician' && (
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
                          {viewEntity.gender === 'male' ? 'Erkak' : 'Ayol'}
                        </div>
                      )}
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-sm font-medium">
                        {viewEntity.experienceYears || viewEntity.experience || 0} yil tajriba
                      </div>
                      {viewEntity.region && (
                        <div className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium border border-gray-100">
                          {viewEntity.region}
                        </div>
                      )}
                      {viewEntity.city && (
                        <div className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium border border-gray-100">
                          {viewEntity.city}
                        </div>
                      )}
                      {userRole !== 'technician' && viewEntity.isAvailable24x7 && (
                        <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-sm font-medium border border-amber-100">
                          24/7 Mavjud
                        </div>
                      )}
                      {userRole !== 'technician' && (
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${viewEntity.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {viewEntity.isActive !== false ? 'Faol' : 'Faol emas'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {userRole !== 'technician' && viewEntity.price && viewEntity.price > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {`${viewEntity.price.toLocaleString()} so'm`}
                      </div>
                      <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Narx</div>
                    </div>
                  </div>
                )}
                <div className="space-y-4 mb-8">
                  <h4 className="text-lg font-bold text-gray-800 border-l-4 border-[#00BCE4] pl-3 italic uppercase tracking-tighter">
                    Kontakt Ma'lumotlari
                  </h4>
                  <div className="space-y-3">
                    {viewEntity.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 font-bold">{viewEntity.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <h4 className="text-lg font-bold text-gray-800 border-l-4 border-[#00BCE4] pl-3 italic uppercase tracking-tighter">
                    {userRole === 'technician' ? 'Manzil' : 'Klinika Ma\'lumotlari'}
                  </h4>
                  <div className="bg-white border border-gray-100 p-5 rounded-xl">
                    {userRole !== 'technician' ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <Building className="w-5 h-5 text-[#00BCE4]" />
                          <span className="font-bold text-gray-800">
                            {viewEntity.clinic?.name || viewEntity.hospitalName || 'Klinika nomi kiritilmagan'}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600">
                              {viewEntity.clinic?.address || viewEntity.address || 'Manzil kiritilmagan'}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">
                            {viewEntity.address || 'Manzil kiritilmagan'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {userRole !== 'technician' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800 border-l-4 border-[#00BCE4] pl-3 italic uppercase tracking-tighter">
                      Ish Vaqti
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-gray-700">
                          {viewEntity.workTime?.start || viewEntity.workHours?.start || '09:00'}
                        </span>
                      </div>
                      <div className="text-gray-300">—</div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-500" />
                        <span className="font-bold text-gray-700">
                          {viewEntity.workTime?.end || viewEntity.workHours?.end || '18:00'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {viewEntity.description && (
                  <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-widest">Qo'shimcha Ma'lumot</h4>
                    <p className="text-gray-600 italic">{viewEntity.description}</p>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsViewModalOpen(false); handleEditEntity(viewEntity); }}
                    className="flex-1 bg-[#00BCE4] cursor-pointer hover:bg-[#0096b8] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => { setIsViewModalOpen(false); handleDeleteEntity(viewEntity._id || viewEntity.id); }}
                    className="px-6 cursor-pointer py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} DentaGo. Barcha huquqlar himoyalangan.
        </footer>
      </div>
    </div>
  );
}

export default MyInformation;
