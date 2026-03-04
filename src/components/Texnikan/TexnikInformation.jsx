import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

import {
    UserCircle, BriefcaseMedical, MapPin, Phone, Save,
    Loader2, Edit, Trash2, X, Plus, Image as ImageIcon,
    Clock, Star, Globe, Images, ShoppingCart
} from 'lucide-react';

// O'zbekiston shaharlari ro'yxati
const uzbekistanCities = [
    { _id: "6964cadeb2a92667023e30c1", label: "Nukus", value: "nukus", region: "Qoraqalpog'iston Respublikasi" },
    { _id: "6964cadeb2a92667023e30c2", label: "Xo'jayli", value: "xojayli", region: "Qoraqalpog'iston Respublikasi" },
    { _id: "6964cadeb2a92667023e30c3", label: "To'rtko'l", value: "tortkol", region: "Qoraqalpog'iston Respublikasi" },
    { _id: "6964cadeb2a92667023e30c4", label: "Beruniy", value: "beruniy", region: "Qoraqalpog'iston Respublikasi" },
    { _id: "6964cadeb2a92667023e30c5", label: "Qo'ng'irot", value: "qongirot", region: "Qoraqalpog'iston Respublikasi" },
    { _id: "6964cadeb2a92667023e30c6", label: "Toshkent", value: "toshkent", region: "Toshkent shahri" },
    { _id: "6964cadeb2a92667023e30c7", label: "Chirchiq", value: "chirchiq", region: "Toshkent viloyati" },
    { _id: "6964cadeb2a92667023e30c8", label: "Angren", value: "angren", region: "Toshkent viloyati" },
    { _id: "6964cadeb2a92667023e30c9", label: "Olmaliq", value: "olmaliq", region: "Toshkent viloyati" },
    { _id: "6964cadeb2a92667023e30ca", label: "Bekobod", value: "bekobod", region: "Toshkent viloyati" },
    { _id: "6964cadeb2a92667023e30cb", label: "Yangiyo'l", value: "yangiyol", region: "Toshkent viloyati" },
    { _id: "6964cadeb2a92667023e30cc", label: "Samarqand", value: "samarqand", region: "Samarqand viloyati" },
    { _id: "6964cadeb2a92667023e30cd", label: "Kattaqo'rg'on", value: "kattaqorgon", region: "Samarqand viloyati" },
    { _id: "6964cadeb2a92667023e30ce", label: "Urgut", value: "urgut", region: "Samarqand viloyati" },
    { _id: "6964cadeb2a92667023e30cf", label: "Buxoro", value: "buxoro", region: "Buxoro viloyati" },
    { _id: "6964cadeb2a92667023e30d0", label: "G'ijduvon", value: "gijduvon", region: "Buxoro viloyati" },
    { _id: "6964cadeb2a92667023e30d1", label: "Kogon", value: "kogon", region: "Buxoro viloyati" },
    { _id: "6964cadeb2a92667023e30d2", label: "Farg'ona", value: "fargona", region: "Farg'ona viloyati" },
    { _id: "6964cadeb2a92667023e30d3", label: "Marg'ilon", value: "margilon", region: "Farg'ona viloyati" },
    { _id: "6964cadeb2a92667023e30d4", label: "Qo'qon", value: "qoqon", region: "Farg'ona viloyati" },
    { _id: "6964cadeb2a92667023e30d5", label: "Andijon", value: "andijon", region: "Andijon viloyati" },
    { _id: "6964cadeb2a92667023e30d6", label: "Asaka", value: "asaka", region: "Andijon viloyati" },
    { _id: "6964cadeb2a92667023e30d7", label: "Namangan", value: "namangan", region: "Namangan viloyati" },
    { _id: "6964cadeb2a92667023e30d8", label: "Chust", value: "chust", region: "Namangan viloyati" },
    { _id: "6964cadeb2a92667023e30d9", label: "Qarshi", value: "qarshi", region: "Qashqadaryo viloyati" },
    { _id: "6964cadeb2a92667023e30da", label: "Shahrisabz", value: "shahrisabz", region: "Qashqadaryo viloyati" },
    { _id: "6964cadeb2a92667023e30db", label: "Termiz", value: "termiz", region: "Surxondaryo viloyati" },
    { _id: "6964cadeb2a92667023e30e0", label: "Jizzax", value: "jizzax", region: "Jizzax viloyati" },
    { _id: "6964cadeb2a92667023e30e1", label: "Zomin", value: "zomin", region: "Jizzax viloyati" },
    { _id: "6964cadeb2a92667023e30dc", label: "Urganch", value: "urganch", region: "Xorazm viloyati" },
    { _id: "6964cadeb2a92667023e30dd", label: "Xiva", value: "xiva", region: "Xorazm viloyati" }
];

function TechnicianManagement() {
    const [technician, setTechnician] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [token, setToken] = useState(null);

    // Avatar states
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Gallery states
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Payment / Purchase modal states
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phone: '', paymentMethod: 'payme' });
    const [formErrors, setFormErrors] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);       // backenddan keladigan summa
    const [showQRModal, setShowQRModal] = useState(false);
    const [paymentLink, setPaymentLink] = useState(null);

    const fileInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const regions = [...new Set(uzbekistanCities.map(city => city.region))].sort();
    const filteredCities = uzbekistanCities.filter(city => city.region === selectedRegion);

    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        setToken(savedToken);
    }, []);

    useEffect(() => {
        if (token) fetchTechnician();
    }, [token]);

    useEffect(() => {
        if (showPurchaseModal && token) {
            // User ma'lumotlarini localStorage dan olish
            try {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                setFormData(prev => ({
                    ...prev,
                    fullName: userData.name || userData.username || '',
                    phone: localStorage.getItem('userPhone') || userData.phone || '',
                }));
            } catch (e) {}
        }
    }, [showPurchaseModal, token]);

    const fetchTechnician = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('https://app.dentago.uz/api/admin/technicians/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const techData = res.data?.data || res.data?.technician || res.data;

            if (techData && Object.keys(techData).length > 0) {
                setTechnician(techData);
                setPreviewUrl(techData.avatar || null);
                setGalleryPreviews(techData.gallery || []);
                if (techData.region) setSelectedRegion(techData.region);
                if (techData.city) {
                    const cityObj = uzbekistanCities.find(c => c.label === techData.city || c.value === techData.city);
                    setSelectedCity(cityObj?.value || techData.city);
                }
            }
        } catch (err) {
            if (err.response?.status !== 404) {
                setSubmitMessage({ type: 'error', text: 'Yuklashda xato: ' + err.message });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (galleryPreviews.length + files.length > 4) {
            console.log("Maksimal 4 ta rasm yuklash mumkin!");
            return;
        }

        const validFiles = files.filter(f => f.type.startsWith('image/'));
        setGalleryFiles(prev => [...prev, ...validFiles]);

        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeGalleryItem = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadSingleImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post('https://app.dentago.uz/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        const filename = res.data?.file?.savedName || res.data?.filename;
        return `https://app.dentago.uz/images/${filename}`;
    };

    const saveAfterPayment = async (data) => {
        if (!token) return;
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            let avatarUrl = technician?.avatar || "";
            if (selectedFile) {
                avatarUrl = await uploadSingleImage(selectedFile);
            }

            let finalGallery = galleryPreviews.filter(p => p.startsWith('http'));

            for (const file of galleryFiles) {
                const url = await uploadSingleImage(file);
                finalGallery.push(url);
            }

            finalGallery = finalGallery.slice(0, 4);

            const selectedCityObj = uzbekistanCities.find(c => c.value === selectedCity);

            const payload = {
                fullName: data.fullName,
                experienceYears: Number(data.experienceYears),
                specialization: data.specialization,
                description: data.description,
                phone: data.phone,
                address: data.address || "",  // manzil bo'sh bo'lishi mumkin
                region: selectedRegion,
                city: selectedCityObj ? selectedCityObj.label : selectedCity,
                location: {
                    lat: Number(data.lat) || 41.2995,
                    lng: Number(data.lng) || 69.2401
                },
                avatar: avatarUrl,
                gallery: finalGallery
            };

            const apiCall = technician
                ? axios.put('https://app.dentago.uz/api/admin/technicians/me', payload, { headers: { Authorization: `Bearer ${token}` } })
                : axios.post('https://app.dentago.uz/api/admin/technicians', payload, { headers: { Authorization: `Bearer ${token}` } });

            await apiCall;
            setSubmitMessage({ type: 'success', text: '✅ Maʼlumotlar muvaffaqiyatli saqlandi!' });
            setShowForm(false);
            setGalleryFiles([]);
            setTimeout(fetchTechnician, 2000);
            setShowQRModal(false);
            setShowPurchaseModal(false);
        } catch (err) {
            setSubmitMessage({ type: 'error', text: `❌ Xato: ${err.response?.data?.message || err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data) => {
        setShowPurchaseModal(true);
    };

    const handleDelete = async () => {
        if (!window.confirm('Haqiqatdan ham o‘chirmoqchimisiz?')) return;
        try {
            await axios.delete('https://app.dentago.uz/api/admin/technicians/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTechnician(null);
            setSubmitMessage({ type: 'success', text: '✅ Texnik o‘chirildi' });
            reset();
            setPreviewUrl(null);
            setSelectedFile(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
            setSelectedRegion('');
            setSelectedCity('');
        } catch (err) {
            setSubmitMessage({ type: 'error', text: 'O‘chirishda xato' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Ism va familiya kiriting";
        if (!formData.phone.trim()) newErrors.phone = "Telefon raqam kiriting";
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePurchase = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const productId = "69a6ae84eb0b4548749cafb1";
            const orderId = "69a7f033eb0b4548749cc524";

            // Mahsulot narxini olish
            const productRes = await axios.get(`https://app.dentago.uz/api/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const productData = productRes.data?.data || productRes.data || {};
            let amount = productData.price || 0;

            if (amount <= 0) {
                throw new Error("Mahsulot narxi topilmadi yoki 0 ga teng");
            }

            setTotalAmount(amount);

            // To'lovni generatsiya qilish, amount ni yuborish
            const paymentResponse = await axios.post('https://app.dentago.uz/api/payment/generate/payme', {
                order_id: orderId,
                amount: amount
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                timeout: 15000
            });

            if (paymentResponse.data.success && paymentResponse.data.url) {
                setPaymentLink(paymentResponse.data.url);
                setShowPurchaseModal(false);
                setShowQRModal(true);
            } else {
                alert("To'lov sahifasini yaratishda xato: " + (paymentResponse.data.message || "Noma'lum xato"));
            }
        } catch (error) {
            console.error('To\'lov yaratishda xato:', error);
            alert("Xatolik yuz berdi: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowPurchaseModal(false);
        setShowQRModal(false);
        setFormErrors({});
        setPaymentLink(null);
        setTotalAmount(0);
    };

    if (isLoading) return <LoadingSpinner text="Texniklar yuklanmoqda" />;

    return (
        <div className="py-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Dental Texnik Boshqaruvi</h1>

            {submitMessage.text && (
                <div className={`mb-6 p-4 rounded-xl border ${submitMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {submitMessage.text}
                </div>
            )}

            {technician && !showForm ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-[#00BCE4] h-40 relative">
                        <img
                            src={technician.avatar || `https://ui-avatars.com/api/?name=${technician.fullName}`}
                            className="w-32 h-32 rounded-full border-4 border-white absolute -bottom-16 left-8 object-cover shadow-lg"
                            alt="Avatar"
                        />
                    </div>
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">{technician.fullName}</h2>
                                <p className="text-cyan-600 font-medium">{technician.specialization}</p>
                                <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                                    <MapPin size={14} /> {technician.region}, {technician.city}
                                </p>
                            </div>
                            <div className="flex gap-2 ">
                                <button onClick={() => { setShowForm(true); reset(technician); }} className="p-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-cyan-50 text-cyan-600 transition"><Edit size={20} /></button>
                                <button onClick={handleDelete} className="p-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-red-50 text-red-600 transition"><Trash2 size={20} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <Clock className="text-cyan-500" />
                                <div><p className="text-xs text-gray-400">Tajriba</p><p className="font-semibold">{technician.experienceYears} yil</p></div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <Phone className="text-cyan-500" />
                                <div><p className="text-xs text-gray-400">Telefon</p><p className="font-semibold">{technician.phone}</p></div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <MapPin className="text-cyan-500" />
                                <div><p className="text-xs text-gray-400">Manzil</p><p className="font-semibold truncate w-40">{technician.address}</p></div>
                            </div>
                        </div>

                        {technician.gallery?.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><Images size={18} /> Ishlaridan namunalar</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {technician.gallery.map((img, idx) => (
                                        <img key={idx} src={img} className="h-32 w-full object-cover rounded-xl shadow-sm" alt="Work" />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><Star size={18} className="text-amber-500" /> Bio / Tavsif</h3>
                            <p className="text-gray-700 leading-relaxed">{technician.description}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="shrink-0">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profil rasmi</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-cyan-400 transition"
                                >
                                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-cyan-400" size={32} />}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">To'liq ism *</label>
                                    <input {...register('fullName', { required: true })} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Telefon *</label>
                                    <input {...register('phone', { required: true })} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tajriba (yil)</label>
                                    <input type="number" {...register('experienceYears')} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mutaxassislik</label>
                                    <input {...register('specialization')} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Viloyat</label>
                                <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none">
                                    <option value="">Tanlang</option>
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shahar</label>
                                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedRegion} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none">
                                    <option value="">Tanlang</option>
                                    {filteredCities.map(c => <option key={c._id} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ish namunalarini yuklash (Maks. 4 ta)</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {galleryPreviews.map((src, index) => (
                                    <div key={index} className="relative group h-24 rounded-xl overflow-hidden border">
                                        <img src={src} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryItem(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {galleryPreviews.length < 4 && (
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current.click()}
                                        className="h-24 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition"
                                    >
                                        <Plus size={20} />
                                        <span className="text-[10px] mt-1">Rasm qo'shish</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} hidden multiple accept="image/*" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="any"
                                        {...register('lat')}
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none"
                                        placeholder="41.2995"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="any"
                                        {...register('lng')}
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none"
                                        placeholder="69.2401"
                                    />
                                    <button
                                        type="button"
                                        className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition flex items-center justify-center shadow-sm"
                                        title="Joriy joylashuvni aniqlash"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Manzil</label>
                            <input {...register('address')} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tavsif</label>
                            <textarea {...register('description')} rows={4} className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none resize-none"></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:bg-gray-400 cursor-pointer"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {technician ? 'O‘zgarishlarni saqlash' : 'Texnikni yaratish'}
                            </button>
                            {technician && (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Bekor qilish
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 rounded-t-2xl z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#00C2FF] p-2.5 rounded-xl">
                                        <ShoppingCart className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">To'lov</h2>
                                        <p className="text-xs text-gray-500">Profil ma'lumotlarini saqlash uchun to'lov</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handlePurchase} className="p-5 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Ism Familiya
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
                                />
                                {formErrors.fullName && <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
                                />
                                {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                            </div>

                            <div className="rounded-xl shadow-sm p-4 bg-gray-50">
                                <h3 className="text-gray-800 text-sm mb-3 font-medium">To'lov tafsilotlari</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Summa</span>
                                        <span className="font-bold text-lg">{totalAmount > 0 ? totalAmount.toLocaleString('uz-UZ') : "..."} so'm</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer text-sm"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Jarayonda...</span>
                                        </>
                                    ) : 'To\'lov qilish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal - summasi backenddan kelgan totalAmount dan */}
            {showQRModal && paymentLink && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl h-[90vh] overflow-x-auto w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all cursor-pointer outline-none"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payme orqali to'lov</h2>
                            <p className="text-gray-600 text-sm mb-6">
                                QR kodni skanerlang va to'lovni amalga oshiring
                            </p>

                            <div className="flex justify-center mb-6 p-4">
                                <QRCodeSVG
                                    value={paymentLink}
                                    size={190}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="L"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-6">
                                <p className="text-gray-600 text-sm mb-1">To'lov summasi:</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {totalAmount.toLocaleString('uz-UZ')} so'm
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                                <p className="text-blue-800 text-sm font-medium mb-2 flex items-center gap-2">
                                    <span>📱</span> Qanday to'lash kerak:
                                </p>
                                <ol className="text-blue-700 text-xs space-y-2 list-decimal pl-5">
                                    <li>Payme ilovasini oching</li>
                                    <li>"QR to'lov" bo'limiga o'ting</li>
                                    <li>QR kodni skanerlang</li>
                                    <li>To'lovni tasdiqlang</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        handleSubmit(saveAfterPayment)();
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-cyan-600 text-white rounded-xl font-bold transition-all cursor-pointer"
                                >
                                    To'lov qildim, saqlash
                                </button>
                                <button
                                    onClick={() => window.open(paymentLink, '_blank')}
                                    className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    To'lov sahifasini ochish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TechnicianManagement;