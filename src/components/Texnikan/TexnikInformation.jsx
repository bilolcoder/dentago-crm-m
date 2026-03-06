import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from "../../context/SocketContext";

import PaymeSvg from '../../assets/payme.png';
import ClickSvg from '../../assets/click.png';
import RahmatSvg from '../../assets/rahmat.png';

import {
    UserCircle, BriefcaseMedical, MapPin, Phone, Save,
    Loader2, Edit, Trash2, X, Plus, Image as ImageIcon,
    Clock, Star, Globe, Images, ShoppingCart, User, Navigation, Smartphone, Shield
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
    const navigate = useNavigate();
    const socket = useSocket();
    const [technician, setTechnician] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [token, setToken] = useState(null);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

    // Avatar states
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Gallery states
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Payment / Purchase modal states
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phone: '', paymentMethod: 'payme' });
    const [formErrors, setFormErrors] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [showQRModal, setShowQRModal] = useState(false);
    const [paymentLink, setPaymentLink] = useState(null);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [pendingFormData, setPendingFormData] = useState(null);

    const fileInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm();

    const getToken = () => localStorage.getItem('accessToken');

    const regions = [...new Set(uzbekistanCities.map(city => city.region))].sort();
    const filteredCities = uzbekistanCities.filter(city => city.region === selectedRegion);

    const paymentMethods = [
        { id: 'payme', name: 'Payme', icon: PaymeSvg, bgColor: 'bg-gradient-to-br from-teal-400 to-teal-600', lightBg: 'bg-teal-50', textColor: 'text-teal-600' },
        { id: 'click', name: 'Click', icon: ClickSvg, bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
        { id: 'rahmat', name: 'Rahmat', icon: RahmatSvg, bgColor: 'bg-gradient-to-br from-red-300 to-red-400', lightBg: 'bg-red-50', textColor: 'text-red-600' }
    ];

    useEffect(() => {
        const savedToken = localStorage.getItem('accessToken');
        setToken(savedToken);
    }, []);

    useEffect(() => {
        if (token) {
            fetchTechnician();
            checkSubscriptionStatus();
        }
    }, [token]);

    // Obuna holatini tekshirish
    const checkSubscriptionStatus = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const response = await axios.get('https://app.dentago.uz/api/order/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const techOrders = response.data.data.filter(order => 
                    order.products?.some(p => p._id === "69aa9c81eb0b4548749cce80") &&
                    order.status === 'paid'
                );
                setHasActiveSubscription(techOrders.length > 0);
            }
        } catch (error) {
            console.error("Obunani tekshirishda xato:", error);
        }
    };

    useEffect(() => {
        if (!socket) return;
        
        const handleSuccess = async (data) => {
            console.log("✅ To'lov muvaffaqiyatli:", data);
            setSuccessData(data);
            setShowSuccessModal(true);
            setShowQRModal(false);
            setCurrentOrderId(null);
            
            // Savatni tozalash
            await clearSpecificItemFromCart();
            
            // Texnik ma'lumotlarini saqlash
            if (pendingFormData) {
                setTimeout(async () => {
                    await saveTechnicianData(pendingFormData);
                    setPendingFormData(null);
                }, 2000);
            }
        };

        const handleFailed = (data) => {
            console.log("❌ To'lov muvaffaqiyatsiz:", data);
            setShowQRModal(false);
        };

        socket.on("payment_success", handleSuccess);
        socket.on("payment_failed", handleFailed);

        return () => {
            socket.off("payment_success", handleSuccess);
            socket.off("payment_failed", handleFailed);
        };
    }, [socket, pendingFormData]);

    useEffect(() => {
        if (showPurchaseModal) {
            try {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                setFormData(prev => ({
                    ...prev,
                    fullName: userData.name || userData.username || '',
                    phone: localStorage.getItem('userPhone') || userData.phone || ''
                }));
            } catch (e) { }
        }
    }, [showPurchaseModal]);

    // FETCH TECHNICIAN
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
            
            // Formaga yozish
            setValue('fullName', techData.fullName || '');
            setValue('phone', techData.phone || '');
            setValue('experienceYears', techData.experienceYears || 0);
            setValue('specialization', techData.specialization || '');
            setValue('address', techData.address || '');
            setValue('description', techData.description || '');
            setValue('lat', techData.location?.lat || 41.2995);
            setValue('lng', techData.location?.lng || 69.2401);
            
            if (techData.region) setSelectedRegion(techData.region);
            if (techData.city) {
                const cityObj = uzbekistanCities.find(c => c.label === techData.city || c.value === techData.city);
                setSelectedCity(cityObj?.value || techData.city);
            }
        } else {
            setTechnician(null);
        }
    } catch (err) {
        console.error("Texnik yuklash xatosi:", err);
        // Agar 404 bo'lsa — null qilish
        if (err.response?.status === 404) {
            setTechnician(null);
        }
        // Public API ni butunlay o'chirib qo'ydik — faqat admin ishlasin
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
            alert("Maksimal 4 ta rasm yuklash mumkin!");
            return;
        }

        const validFiles = files.filter(f => f.type.startsWith('image/'));
        setGalleryFiles(prev => [...prev, ...validFiles]);

        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeGalleryItem = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
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

    // Texnik ma'lumotlarini saqlash
    const saveTechnicianData = async (formValues) => {
        if (!token) {
            console.error("Token topilmadi");
            return;
        }
        
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            let avatarUrl = technician?.avatar || "";
            if (selectedFile) {
                avatarUrl = await uploadSingleImage(selectedFile);
            }

            // Eski galereya URL larini olish (http bilan boshlanadiganlar)
            let finalGallery = galleryPreviews.filter(p => p.startsWith('http'));

            // Yangi fayllarni yuklash
            for (const file of galleryFiles) {
                const url = await uploadSingleImage(file);
                finalGallery.push(url);
            }

            finalGallery = finalGallery.slice(0, 4);

            const selectedCityObj = uzbekistanCities.find(c => c.value === selectedCity);

            // PAYLOAD ni to'g'ri tuzish
            const payload = {
                fullName: formValues.fullName || formData.fullName,
                experienceYears: Number(formValues.experienceYears) || 0,
                specialization: formValues.specialization || "Dental Texnik",
                description: formValues.description || "",
                phone: formValues.phone || formData.phone,
                address: formValues.address || formData.address || "",
                region: selectedRegion || formValues.region || "",
                city: selectedCityObj?.label || selectedCity || formValues.city || "",
                location: {
                    lat: Number(formValues.lat) || 41.2995,
                    lng: Number(formValues.lng) || 69.2401
                },
                avatar: avatarUrl,
                gallery: finalGallery
            };

            console.log("📦 Texnik ma'lumotlari yuborilmoqda...", payload);

            let response;
            
            if (technician && technician._id) {
                // Yangilash - PUT
                try {
                    response = await axios.put(
                        'https://app.dentago.uz/api/admin/technicians/me', 
                        payload, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    console.log("✅ PUT muvaffaqiyatli:", response.data);
                } catch (putError) {
                    console.log("PUT ishlamadi, POST qilinmoqda...");
                    // Agar PUT ishlamasa, POST qilish
                    response = await axios.post(
                        'https://app.dentago.uz/api/admin/technicians', 
                        payload, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            } else {
                // Yangi texnik yaratish - POST
                try {
                    response = await axios.post(
                        'https://app.dentago.uz/api/admin/technicians', 
                        payload, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (postError) {
                    // Agar admin POST ishlamasa, public API ga urinish
                    console.log("Admin API ishlamadi, public API ga urinilmoqda...");
                    response = await axios.post(
                        'https://app.dentago.uz/api/public/technicians', 
                        payload, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }

            console.log("✅ API javob:", response.data);
            
            setSubmitMessage({ type: 'success', text: '✅ Maʼlumotlar muvaffaqiyatli saqlandi!' });
            setShowForm(false);
            setGalleryFiles([]);
            
            // Ma'lumotlarni qayta yuklash
            setTimeout(() => {
                fetchTechnician();
            }, 1000);
            
        } catch (err) {
            console.error("❌ Xato:", err);
            setSubmitMessage({ type: 'error', text: `❌ Xato: ${err.response?.data?.message || err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data) => {
        console.log("Form ma'lumotlari:", data);
        
        if (!hasActiveSubscription && !technician) {
            // To'lov modalini ochish
            setPendingFormData(data);
            setShowPurchaseModal(true);
        } else {
            await saveTechnicianData(data);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
            return;
        }
        
        setIsGettingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Location ma'lumotlarini forma maydonlariga yozish
                    setValue('lat', latitude.toFixed(6));
                    setValue('lng', longitude.toFixed(6));
                    
                    // Reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    
                    setValue('address', data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                    
                    alert("✅ Joylashuv muvaffaqiyatli aniqlandi!");
                } catch (err) {
                    console.error("Geolokatsiya xatosi:", err);
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                let msg = 'Joylashuv olishda xato yuz berdi.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Joylashuvga ruxsat berilmagan.';
                }
                alert(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

  const handleDelete = async () => {
    if (!window.confirm('Haqiqatdan ham o‘chirmoqchimisiz?')) return;
    
    try {
        await axios.delete('https://app.dentago.uz/api/admin/technicians/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // To'liq tozalash
        setTechnician(null);
        reset();
        setPreviewUrl(null);
        setSelectedFile(null);
        setGalleryFiles([]);
        setGalleryPreviews([]);
        setSelectedRegion('');
        setSelectedCity('');
        setSubmitMessage({ type: 'success', text: '✅ Texnik o‘chirildi' });
        
        // Qayta yuklash — endi null bo'lishi kerak
        await fetchTechnician();
    } catch (err) {
        console.error("O'chirish xatosi:", err);
        setSubmitMessage({ type: 'error', text: 'O‘chirishda xato yuz berdi' });
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
            const token = getToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const productId = "69aa9c81eb0b4548749cce80";

            // Mahsulot ma'lumotini olish
            const productRes = await axios.get(`https://app.dentago.uz/api/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const productData = productRes.data?.data || productRes.data || {};
            const amount = productData.price || 0;

            if (amount <= 0) {
                throw new Error("Mahsulot narxi topilmadi");
            }

            setTotalAmount(amount);

            // Avval eski texnik mahsulotlarini o'chirish
            await clearSpecificItemFromCart();

            // Yangi mahsulotni savatga qo'shish
            await axios.post('https://app.dentago.uz/api/cart/add', {
                product_id: productId,
                quantity: 1,
                price: amount
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Buyurtma yaratish
            const orderData = {
                shippingAddress: "Texnik profil obunasi",
                notes: "Texnik profil uchun to'lov",
                paymentMethod: formData.paymentMethod,
                products: [productId]
            };

            const orderResponse = await axios.post('https://app.dentago.uz/api/order/create', orderData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                timeout: 15000
            });

            if (orderResponse.data.success) {
                const orderData = orderResponse.data.data;
                const orderId = orderData._id;
                
                setCurrentOrderId(orderId);

                // To'lovni generatsiya qilish
                const paymentResponse = await axios.post('https://app.dentago.uz/api/payment/generate/payme', {
                    order_id: orderId
                }, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    timeout: 15000
                });

                if (paymentResponse.data.success && paymentResponse.data.url) {
                    setPaymentLink(paymentResponse.data.url);
                    
                    // Socket orqali to'lov obunasini qo'shish
                    if (socket && socket.connected) {
                        socket.emit("payment:subscribe", { orderId });
                    }

                    setShowPurchaseModal(false);
                    setShowQRModal(true);
                }
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
        setShowSuccessModal(false);
        setShowQRModal(false);
        setFormErrors({});
        setPaymentLink(null);
        setCurrentOrderId(null);
        setTotalAmount(0);
        setPendingFormData(null);
    };

    // Savatdagi maxsus mahsulotni o'chirish
    const clearSpecificItemFromCart = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const productId = "69aa9c81eb0b4548749cce80";
            
            const cartRes = await axios.get('https://app.dentago.uz/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (cartRes.data.success && cartRes.data.data) {
                const items = cartRes.data.data.items || [];
                
                for (const item of items) {
                    if (item.product_id?._id === productId || 
                        item.productSnapshot?._id === productId ||
                        item.product_id === productId) {
                        await axios.delete(`https://app.dentago.uz/api/cart/item/${item._id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Savatni tozalashda xato:", error);
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
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { 
                                        setShowForm(true); 
                                        reset(technician); 
                                    }} 
                                    className="p-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-cyan-50 text-cyan-600 transition"
                                >
                                    <Edit size={20} />
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="p-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-red-50 text-red-600 transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <Clock className="text-cyan-500" />
                                <div>
                                    <p className="text-xs text-gray-400">Tajriba</p>
                                    <p className="font-semibold">{technician.experienceYears} yil</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <Phone className="text-cyan-500" />
                                <div>
                                    <p className="text-xs text-gray-400">Telefon</p>
                                    <p className="font-semibold">{technician.phone}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                <MapPin className="text-cyan-500" />
                                <div>
                                    <p className="text-xs text-gray-400">Manzil</p>
                                    <p className="font-semibold truncate w-40">{technician.address}</p>
                                </div>
                            </div>
                        </div>

                        {technician.gallery?.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Images size={18} /> Ishlaridan namunalar
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {technician.gallery.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img} 
                                            className="h-32 w-full object-cover rounded-xl shadow-sm" 
                                            alt="Work" 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Star size={18} className="text-amber-500" /> Bio / Tavsif
                            </h3>
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
                                    {previewUrl ? 
                                        <img src={previewUrl} className="w-full h-full object-cover" /> : 
                                        <ImageIcon className="text-cyan-400" size={32} />
                                    }
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    hidden 
                                    accept="image/*" 
                                />
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">To'liq ism *</label>
                                    <input 
                                        {...register('fullName', { required: true })} 
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200" 
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-xs mt-1">To'liq ism kiritilishi shart</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Telefon *</label>
                                    <input 
                                        {...register('phone', { required: true })} 
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200" 
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">Telefon kiritilishi shart</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tajriba (yil)</label>
                                    <input 
                                        type="number" 
                                        {...register('experienceYears')} 
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mutaxassislik</label>
                                    <input 
                                        {...register('specialization')} 
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Viloyat</label>
                                <select 
                                    value={selectedRegion} 
                                    onChange={(e) => setSelectedRegion(e.target.value)} 
                                    className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200"
                                >
                                    <option value="">Tanlang</option>
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shahar</label>
                                <select 
                                    value={selectedCity} 
                                    onChange={(e) => setSelectedCity(e.target.value)} 
                                    disabled={!selectedRegion} 
                                    className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200 disabled:bg-gray-100"
                                >
                                    <option value="">Tanlang</option>
                                    {filteredCities.map(c => <option key={c._id} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ish namunalarini yuklash (Maks. 4 ta)
                            </label>
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
                            <input 
                                type="file" 
                                ref={galleryInputRef} 
                                onChange={handleGalleryChange} 
                                hidden 
                                multiple 
                                accept="image/*" 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('lat')}
                                    className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200"
                                    placeholder="41.2995"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Longitude</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="any"
                                        {...register('lng')}
                                        className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200"
                                        placeholder="69.2401"
                                    />
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={isGettingLocation}
                                        className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition flex items-center justify-center shadow-sm disabled:opacity-50 cursor-pointer"
                                        title="Joriy joylashuvni aniqlash"
                                    >
                                        {isGettingLocation ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <MapPin className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Manzil</label>
                            <input 
                                {...register('address')} 
                                className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tavsif</label>
                            <textarea 
                                {...register('description')} 
                                rows={4} 
                                className="w-full px-4 py-2 rounded-xl border border-[#00BCE4] outline-none focus:ring-2 focus:ring-cyan-200 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:bg-gray-400 cursor-pointer"
                            >
                                {isSubmitting ? 
                                    <Loader2 className="animate-spin" /> : 
                                    <Save size={20} />
                                }
                                {technician ? 'O\'zgarishlarni saqlash' : (hasActiveSubscription ? 'Texnikni yaratish' : 'Obuna sotib olish')}
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
                                        <p className="text-xs text-gray-500">Texnik profil uchun to'lov</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handlePurchase} className="p-5 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    <User className="w-3.5 h-3.5 inline mr-1" /> Ism Familiya
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#00C2FF] transition-colors"
                                    placeholder="Ism familiyangizni kiriting"
                                />
                                {formErrors.fullName && <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Telefon
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#00C2FF] transition-colors"
                                    placeholder="Telefon raqamingizni kiriting"
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

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-3">To'lov usulini tanlang</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                                            className={`cursor-pointer ${method.id !== 'payme' ? 'opacity-50' : ''}`}
                                            disabled={method.id !== 'payme'}
                                        >
                                            <div className={`relative p-3 rounded-xl transition-all ${formData.paymentMethod === method.id ? method.bgColor : method.lightBg} ${method.id !== 'payme' ? 'grayscale' : ''}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-xs font-bold ${formData.paymentMethod === method.id ? 'text-white' : method.textColor}`}>{method.name}</span>
                                                    <div className={`w-8 h-5 rounded flex items-center justify-center ${formData.paymentMethod === method.id ? 'bg-white/20' : 'bg-white'}`}>
                                                        <img src={method.icon} alt={method.name} className="w-6 h-4 object-contain" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(4)].map((_, i) => (
                                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'}`}></div>
                                                        ))}
                                                        <span className={`text-[10px] ml-1 ${formData.paymentMethod === method.id ? 'text-white/80' : 'text-gray-500'}`}>****</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-[8px] ${formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'}`}>
                                                            {formData.fullName || 'KARTANI TANLANG'}
                                                        </span>
                                                        <span className={`text-[8px] ${formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'}`}>12/26</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-sm"
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
                                    ) : 'Sotib olish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && successData && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex flex-col items-center pt-8">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 w-20 h-20 bg-green-400/20 rounded-full animate-ping"></div>
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">To'lov Muvaffaqiyatli!</h2>
                            <p className="text-gray-600 mb-6">Buyurtmangiz qabul qilindi va tayyorlashni boshladi</p>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 space-y-3 border border-blue-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Buyurtma ID:</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs">{successData.orderId?.slice(0, 12)}...</span>
                                </div>
                                <div className="border-t border-blue-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Jami To'lov:</span>
                                    <span className="text-2xl font-bold text-green-600">{successData.amount?.toLocaleString()} so'm</span>
                                </div>
                                <div className="border-t border-blue-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">To'lov Usuli:</span>
                                    <span className="font-semibold text-gray-900 capitalize">{successData.paymentMethod || 'Payme'}</span>
                                </div>
                                <div className="border-t border-blue-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Vaqti:</span>
                                    <span className="text-gray-600 text-xs">{new Date(successData.paidAt || Date.now()).toLocaleString('uz-UZ')}</span>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
                                <p className="text-green-700 text-sm font-medium">✅ To'lovingiz amalga oshirildi</p>
                            </div>
                        </div>

                        <div className="px-8 pb-8">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    fetchTechnician();
                                    setShowForm(false);
                                    navigate('/payments/app');
                                }}
                                className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Profilni ko'rish
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/DentagoStore');
                                }}
                                className="w-full py-3 mt-2 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Bosh saxifa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showQRModal && paymentLink && (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm  ">
        <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl transform transition-all animate-in zoom-in-95 duration-300 my-8">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500  p-3 text-center">
                <button
                    onClick={() => setShowQRModal(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all cursor-pointer outline-none group z-10"
                >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="flex justify-center mb-3">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1">Payme orqali to'lov</h2>
                <p className="text-blue-100 text-sm">QR kodni skanerlang va to'lovni amalga oshiring</p>
            </div>

            {/* QR Code Section - Scrollable content */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-white p-3 sm:p-4 rounded-2xl shadow-lg border-2 border-gray-100">
                            <QRCodeSVG
                                value={paymentLink}
                                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 150 : 200}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="L"
                                includeMargin={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
                    <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">To'lov summasi:</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            {totalAmount.toLocaleString()}
                        </p>
                        <span className="text-sm sm:text-base text-gray-600 font-semibold">so'm</span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs sm:text-sm">📱</span>
                        </div>
                        <p className="text-blue-800 text-xs sm:text-sm font-bold">Qanday to'lash kerak:</p>
                    </div>
                    <ol className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-start gap-2 sm:gap-3 text-blue-700 text-xs sm:text-sm">
                            <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">1</span>
                            <span>Payme ilovasini oching</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3 text-blue-700 text-xs sm:text-sm">
                            <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">2</span>
                            <span>"QR to'lov" bo'limiga o'ting</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3 text-blue-700 text-xs sm:text-sm">
                            <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">3</span>
                            <span>QR kodni skanerlang</span>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3 text-blue-700 text-xs sm:text-sm">
                            <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">4</span>
                            <span>To'lovni tasdiqlang</span>
                        </li>
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3">
                    <button
                        onClick={() => window.open(paymentLink, '_blank')}
                        className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer outline-none flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        To'lov sahifasini ochish
                    </button>
                    <button
                        onClick={() => setShowQRModal(false)}
                        className="w-full py-3 sm:py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer outline-none text-sm sm:text-base"
                    >
                        Yopish
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