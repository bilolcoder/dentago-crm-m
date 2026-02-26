import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../common/LoadingSpinner';

import {
    UserCircle, BriefcaseMedical, MapPin, Phone, Save,
    Loader2, Edit, Trash2, X, Plus, Image as ImageIcon,
    Clock, Star, Globe, Images
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
    const [isLocating, setIsLocating] = useState(false);

    // Avatar states
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Gallery states
    const [galleryFiles, setGalleryFiles] = useState([]); // Yangi tanlangan fayllar
    const [galleryPreviews, setGalleryPreviews] = useState([]); // Oldindan ko'rish

    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

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

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            console.log("Sizning brauzeringizda joylashuv funksiyasi mavjud emas yoki qo'llab-quvvatlanmaydi.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                reset(
                    (prev) => ({
                        ...prev,
                        lat: latitude.toFixed(6),
                        lng: longitude.toFixed(6),
                    }),
                    { keepDefaultValues: true }
                );

                setIsLocating(false);
                setSubmitMessage({ type: 'success', text: 'Joriy joylashuv muvaffaqiyatli olindi!' });
            },
            (error) => {
                setIsLocating(false);
                let msg = 'Joylashuv olishda xato yuz berdi.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Joylashuvga ruxsat berilmagan. Iltimos, brauzer sozlamalarida ruxsat bering.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = 'Joylashuv maʼlumotlari mavjud emas.';
                } else if (error.code === error.TIMEOUT) {
                    msg = 'Joylashuv so‘rovi vaqtida xato (timeout).';
                }
                console.log(msg);
                setSubmitMessage({ type: 'error', text: msg });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
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
        // Agar u yangi qo'shilgan fayl bo'lsa, fayllar ro'yxatidan ham o'chiramiz
        // Bu yerda soddalik uchun biz asosan previewlarni boshqaramiz
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

    const onSubmit = async (data) => {
        if (!token) return;
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            // 1. Avatar yuklash
            let avatarUrl = technician?.avatar || "";
            if (selectedFile) {
                avatarUrl = await uploadSingleImage(selectedFile);
            }

            // 2. Galereya yuklash (faqat yangi fayllarni yuklaymiz)
            // Bu yerda mavjud gallery URL lari + yangi yuklangan URL larni birlashtiramiz
            let finalGallery = galleryPreviews.filter(p => p.startsWith('http'));

            for (const file of galleryFiles) {
                const url = await uploadSingleImage(file);
                finalGallery.push(url);
            }

            // Faqat oxirgi 4 tasini olamiz (xavfsizlik uchun)
            finalGallery = finalGallery.slice(0, 4);

            const selectedCityObj = uzbekistanCities.find(c => c.value === selectedCity);

            const payload = {
                fullName: data.fullName,
                experienceYears: Number(data.experienceYears),
                specialization: data.specialization,
                description: data.description,
                phone: data.phone,
                address: data.address,
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
            setTimeout(fetchTechnician, 1000);
        } catch (err) {
            setSubmitMessage({ type: 'error', text: `❌ Xato: ${err.response?.data?.message || err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Haqiqatdan ham o‘chirmoqchimisiz?')) return;
        try {
            await axios.delete('https://app.dentago.uz/api/admin/technicians/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTechnician(null);
            setSubmitMessage({ type: 'success', text: '✅ Texnik o‘chirildi' });
            reset(); // Clear all form fields
            setPreviewUrl(null); // Clear avatar preview
            setSelectedFile(null); // Clear avatar file
            setGalleryFiles([]); // Clear gallery files
            setGalleryPreviews([]); // Clear gallery previews
            setSelectedRegion(''); // Reset region
            setSelectedCity(''); // Reset city
        } catch (err) {
            setSubmitMessage({ type: 'error', text: 'O‘chirishda xato' });
        }
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

                        {/* Gallery Display */}
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
                            {/* Profile Image Upload */}
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

                        {/* Gallery Upload Section */}
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
                                        className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition"
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
                                        onClick={getCurrentLocation}
                                        disabled={isLocating}
                                        className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition disabled:opacity-50 flex items-center justify-center shadow-sm"
                                        title="Joriy joylashuvni aniqlash"
                                    >
                                        {isLocating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <MapPin className="w-5 h-5" />
                                        )}
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
                                className="flex-1 bg-gradient-to-r cursor-pointer from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:bg-gray-400"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {technician ? 'O‘zgarishlarni saqlash' : 'Texnikni yaratish'}
                            </button>
                            {technician && (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 cursor-pointer py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Bekor qilish
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default TechnicianManagement;
