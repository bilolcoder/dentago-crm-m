import React, { useState, useEffect, useRef } from 'react';
// Chiroyli va mantiqiy iconlar
import {
    ShoppingBag,    // Jami buyurtmalar
    CheckCircle2,   // To'langanlar
    Wallet,         // To'lov kutilmoqda
    Zap,            // Jarayonda
    Truck,          // Yetkazilmoqda
    PackageCheck,   // Yetkazib berildi
    Calendar,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataProvider';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import ErrorBoundary from './common/ErrorBoundary';

const DashboardContent = () => {
    const { user, t, logout } = useData();
    const navigate = useNavigate();
    const dateInputRef = useRef(null);

    // API ma'lumotlari uchun statelar
    const [selectedDate, setSelectedDate] = useState('2025-01-12');
    const [orderStats, setOrderStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [services, setServices] = useState([]);
    const [payments, setPayments] = useState([]);

    const BASE_URL = import.meta.env.VITE_API_URL || "https://app.dentago.uz";

    // Statistikani yuklash funksiyasi
    const fetchOrderStats = async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            
            if (!token) {
                console.warn("Token topilmadi");
                setLoadingStats(false);
                return;
            }

            const response = await axios.get(`${BASE_URL}/api/order/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data?.success) {
                setOrderStats(response.data.data);
            } else {
                console.warn("Statistika ma'lumotlari topilmadi");
            }
        } catch (err) {
            console.error("Statistika yuklashda xatolik:", err);
            // Xatolik yuz berganda default qiymatlar
            setOrderStats({
                totalOrders: 0,
                paid: 0,
                pendingPayment: 0,
                processing: 0,
                shipped: 0,
                delivered: 0
            });
        } finally {
            setLoadingStats(false);
        }
    };

    // Servislarni yuklash - endpoint tekshirish
    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            // Avval to'g'ri endpointni tekshirish
            const endpoints = [
                `${BASE_URL}/api/services`,
                `${BASE_URL}/api/service/list`,
                `${BASE_URL}/api/services/list`
            ];
            
            let servicesData = [];
            
            // Barcha mumkin bo'lgan endpointlarni sinab ko'rish
            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(endpoint, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.data?.success || response.data?.data) {
                        servicesData = response.data.data || response.data || [];
                        break;
                    }
                } catch (err) {
                    // Endpoint ishlamasa keyingisini sinab ko'ramiz
                    continue;
                }
            }
            
            setServices(Array.isArray(servicesData) ? servicesData : []);
        } catch (err) {
            console.error("Servislarni yuklashda xatolik:", err);
            // Xatolik yuz berganda bo'sh array qaytarish
            setServices([]);
        }
    };

    // To'lovlarni yuklash - endpoint tekshirish
    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            // Avval to'g'ri endpointni tekshirish
            const endpoints = [
                `${BASE_URL}/api/payments`,
                `${BASE_URL}/api/payment/list`,
                `${BASE_URL}/api/payments/list`,
                `${BASE_URL}/api/transactions`
            ];
            
            let paymentsData = [];
            
            // Barcha mumkin bo'lgan endpointlarni sinab ko'rish
            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(endpoint, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.data?.success || response.data?.data) {
                        paymentsData = response.data.data || response.data || [];
                        break;
                    }
                } catch (err) {
                    // Endpoint ishlamasa keyingisini sinab ko'ramiz
                    continue;
                }
            }
            
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        } catch (err) {
            console.error("To'lovlarni yuklashda xatolik:", err);
            // Xatolik yuz berganda bo'sh array qaytarish
            setPayments([]);
        }
    };

    useEffect(() => {
        const accepted = localStorage.getItem('offerAccepted');
        if (!accepted) {
            setShowOfferModal(true);
        }

        // Barcha ma'lumotlarni yuklash
        fetchOrderStats();
        fetchServices();
        fetchPayments();
    }, []);

    const handleAcceptOffer = () => {
        localStorage.setItem('offerAccepted', 'true');
        setShowOfferModal(false);
    };

    const handleRejectOffer = () => {
        logout();
        navigate('/login');
    };

    // API'dan kelgan ma'lumotlarga asoslangan karta ma'lumotlari
    const topStats = [
        {
            title: "Jami Buyurtmalar",
            value: orderStats?.totalOrders || 0,
            icon: ShoppingBag,
            link: "/cards",
            color: "#0ea5e9"
        },
        {
            title: "To'langanlar",
            value: orderStats?.paid || 0,
            icon: CheckCircle2,
            link: "#",
            color: "#10b981"
        },
        {
            title: "To'lov kutilmoqda",
            value: orderStats?.pendingPayment || 0,
            icon: Wallet,
            link: "#",
            color: "#f59e0b"
        },
        {
            title: "Jarayonda",
            value: orderStats?.processing || 0,
            icon: Zap,
            link: "#",
            color: "#6366f1"
        },
        {
            title: "Yetkazilmoqda",
            value: orderStats?.shipped || 0,
            icon: Truck,
            link: "#",
            color: "#8b5cf6"
        },
        {
            title: "Yetkazib berildi",
            value: orderStats?.delivered || 0,
            icon: PackageCheck,
            link: "#",
            color: "#22c55e"
        },

    ];

    // Role bo'yicha filtrlash
    const getVisibleStats = () => {
        const role = user?.role;
        const allStats = topStats;

        if (role === 'doctor') {
            return allStats.filter(s =>
                s.title === "Jami Buyurtmalar" ||
                s.title === "Jarayonda" ||
                s.title === "To'langanlar" ||
                s.title === "Yetkazib berildi"
            );
        }
        if (role === 'user') {
            return allStats.filter(s =>
                s.title === "Jami Buyurtmalar" ||
                s.title === "To'langanlar" ||
                s.title === "Yetkazib berildi" ||
                s.title === "Yetkazilmoqda"
            );
        }
        if (role === 'technician') {
            return allStats.filter(s =>
                s.title === "Jami Buyurtmalar" ||
                s.title === "To'langanlar" ||
                s.title === "Yetkazib berildi"
            );
        }
        if (role === 'master') {
            return allStats.filter(s =>
                s.title === "Jami Buyurtmalar" ||
                s.title === "Jarayonda"
            );
        }

        // Default holat (masalan admin uchun hammasi)
        return topStats;
    };

    const visibleStats = getVisibleStats();

    // To'lovlar statistikasi
    const chartData = [
        {
            name: t('cash') || 'Naqd',
            value: payments
                .filter(p => p.payment_type === 'cash' || p.type === 'Naqd')
                .reduce((s, p) => s + (parseInt(p.amount) || 0), 0)
        },
        {
            name: t('card') || 'Karta',
            value: payments
                .filter(p => p.payment_type === 'card' || p.type === 'Karta')
                .reduce((s, p) => s + (parseInt(p.amount) || 0), 0)
        },
        {
            name: 'Bank',
            value: payments
                .filter(p => p.payment_type === 'bank' || p.type === 'Hisob raqam' || p.type === 'Bank')
                .reduce((s, p) => s + (parseInt(p.amount) || 0), 0)
        },
    ];

    // Servislarni formatlash - agar kerak bo'lsa
    const formattedServices = services.map(service => ({
        id: service.id || service._id,
        name: service.name || service.service_name || "Noma'lum xizmat",
        price: service.price || service.cost || service.amount || 0
    }));

    return (
        <div className="bg-white font-sans">
            {/* Oferta Modal */}
            {showOfferModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#00BCE4]/20 backdrop-blur-sm" onClick={handleRejectOffer} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#00BCE4]/20">
                        <div className="p-8 bg-gradient-to-r from-[#00BCE4] to-[#0096b8] text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-2xl"><ShieldCheck size={40} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">🦷 Dentago Platformasi</h2>
                                    <p className="text-sm opacity-90 mt-1">Ommaviy oferta shartnomasi</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-slate-700 custom-scrollbar scroll-smooth">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Marketplace Sotuvchi Oferta</h3>
                                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                        <Calendar size={14} className="text-[#00BCE4]" /> Sana: 29.08.2025
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-[#00BCE4]/10 text-[#00BCE4] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#00BCE4]/20">
                                    Rasmiy hujjat
                                </div>
                            </div>

                            <div className="grid gap-8">
                                {/* 1. Umumiy qoidalar */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">1</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Umumiy qoidalar</h4>
                                    </div>
                                    <div className="pl-11 pr-4">
                                        <p className="leading-relaxed text-sm text-slate-600">
                                            Ushbu oferta orqali sotuvchi Denta GO marketplace’da mahsulotlarini joylashtirish va sotishga rozilik bildiradi. Ro‘yxatdan o‘tish — shartnomani qabul qilish hisoblanadi.
                                        </p>
                                    </div>
                                </section>

                                {/* 2. Tomonlar */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">2</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Tomonlar</h4>
                                    </div>
                                    <div className="pl-11 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Platforma</p>
                                            <p className="text-sm font-semibold text-slate-900">Denta GO</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sotuvchi</p>
                                            <p className="text-sm font-semibold text-slate-900">Siz (Shaxs/Kompaniya)</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Xaridor</p>
                                            <p className="text-sm font-semibold text-slate-900">Foydalanuvchilar</p>
                                        </div>
                                    </div>
                                </section>

                                {/* 3. Denta GO majburiyatlari */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">3</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Denta GO majburiyatlari</h4>
                                    </div>
                                    <div className="pl-11 space-y-2">
                                        {["Mahsulotlarni platformaga joylash", "Xaridor bilan savdo jarayonini tashkil qilish", "To‘lovlarni qabul qilish", "Sotuvchiga pulni o‘tkazish"].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#00BCE4]" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 4. Sotuvchi majburiyatlari */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">4</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Sotuvchi majburiyatlari</h4>
                                    </div>
                                    <div className="pl-11 space-y-2">
                                        {["Mahsulotni o‘z vaqtida yetkazib berish", "Mahsulot haqida to‘liq va to‘g‘ri ma’lumot kiritish", "Mahsulot sifati va qonuniyligi uchun javob berish"].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* 5. Narx va komissiya */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">5</div>
                                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Narx va komissiya</h4>
                                        </div>
                                        <div className="pl-11">
                                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                                <p className="text-2xl font-black text-[#00BCE4]">5%</p>
                                                <p className="text-xs text-[#00BCE4] font-bold mt-1">Platforma komissiyasi</p>
                                                <p className="text-xs text-slate-500 mt-2 italic">Narx bozor narxidan yuqori bo‘lmasligi shart</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 6. To‘lovlar */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">6</div>
                                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">To‘lovlar</h4>
                                        </div>
                                        <div className="pl-11 space-y-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 font-bold text-[10px]">10 kun</div>
                                                <span>Pul chiqarishga tayyor bo‘ladi</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">14 kun</div>
                                                <span>O‘tkazma amalga oshiriladi</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* 7. Yetkazib berish va 8. Qaytarish */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">7</div>
                                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Yetkazib berish</h4>
                                        </div>
                                        <div className="pl-11">
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                Yetkazib berish <span className="font-bold text-slate-900">sotuvchi zimmasida</span>. Mahsulot to‘g‘ridan-to‘g‘ri xaridor manziliga yetkaziladi.
                                            </p>
                                        </div>
                                    </section>
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">8</div>
                                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Qaytarish</h4>
                                        </div>
                                        <div className="pl-11">
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                Xaridor <span className="font-bold text-slate-900">10 kun</span> ichida mahsulotni qaytarishi mumkin. Bunda summa ushlab qolinadi.
                                            </p>
                                        </div>
                                    </section>
                                </div>

                                {/* 9. Javobgarlik */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm border border-red-100">9</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Javobgarlik</h4>
                                    </div>
                                    <div className="pl-11 pr-4">
                                        <p className="text-sm text-slate-600 leading-relaxed bg-red-50/30 p-4 rounded-2xl border border-red-100/50">
                                            Sotuvchi mahsulot sifati va qonuniyligi uchun <span className="font-bold text-red-600">to‘liq javobgar</span>. Har qanday zarar sotuvchi tomonidan qoplanadi.
                                        </p>
                                    </div>
                                </section>

                                {/* 10. Yakuniy qoidalar */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-100">10</div>
                                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Yakuniy qoidalar</h4>
                                    </div>
                                    <div className="pl-11 pr-4">
                                        <p className="text-sm text-slate-600 leading-relaxed italic">
                                            Shartnoma muddatsiz. Nizolar O‘zbekiston Respublikasi qonunchiligi asosida hal qilinadi.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
                            <button onClick={handleRejectOffer} className="flex-1 py-4 px-8 text-slate-500 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors">Bekor qilish</button>
                            <button onClick={handleAcceptOffer} className="flex-[2] py-4 px-8 bg-[#00BCE4] text-white font-bold rounded-2xl shadow-lg hover:bg-[#00A5C9] transition-all hover:shadow-xl active:scale-[0.98]">Roziman va davom etish</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* To'lovlar Grafigi */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{t('payments') || "To'lovlar"}</h3>
                                <p className="text-xs text-slate-400 font-medium">To'lovlar dinamikasi</p>
                            </div>
                            <button
                                onClick={() => dateInputRef.current?.showPicker()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-xs font-bold text-[#00BCE4] cursor-pointer"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>{selectedDate}</span>
                                <input
                                    type="date"
                                    ref={dateInputRef}
                                    className="absolute opacity-0 pointer-events-none"
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    value={selectedDate}
                                />
                            </button>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00BCE4" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#00BCE4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value) => [`${value} so'm`, 'To\'lov']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00BCE4"
                                        strokeWidth={3}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;