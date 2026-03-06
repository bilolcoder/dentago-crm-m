// src/components/AppPaymentsContent.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataProvider';
import { Search, ChevronDown, ChevronUp, Database, Clock, CreditCard, Calendar, CheckCircle, User, Phone, CalendarClock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getToken = () => localStorage.getItem('accessToken');

const AppPaymentsContent = () => {
    const { t } = useData();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [latestPayment, setLatestPayment] = useState(null);
    const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
    
    // Qidirish uchun state'lar
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        fetchPayments();
        // LocalStorage dan qidirish tarixini yuklash
        const savedHistory = localStorage.getItem('paymentSearchHistory');
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Qidirish funksiyasi
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            setShowSearchResults(false);
            setFilteredPayments(payments);
        } else {
            const results = payments.filter(payment => {
                const searchLower = searchTerm.toLowerCase().trim();
                const amount = payment.amount?.toString() || '';
                const transactionId = payment.transaction_id?.toLowerCase() || '';
                const orderId = payment.order_id?.orderNumber?.toLowerCase() || payment.order_id?.toString().toLowerCase() || '';
                const createdAt = new Date(payment.created_at).toLocaleDateString('uz-UZ').toLowerCase();
                
                return (
                    amount.includes(searchLower) ||
                    transactionId.includes(searchLower) ||
                    orderId.includes(searchLower) ||
                    createdAt.includes(searchLower)
                );
            });
            
            setSearchResults(results);
            setShowSearchResults(true);
            setFilteredPayments(results);
        }
    }, [searchTerm, payments]);

    const fetchPayments = async () => {
        try {
            const token = getToken();
            if (!token) return;

            console.log("📋 To'lovlarni yuklash boshlandi...");
            
            // Payment transactions API dan ma'lumot olish
            const response = await axios.get('https://app.dentago.uz/api/payment/transactions?page=1&limit=50', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("📥 Javob:", response.data);

            if (response.data.success && response.data.transactions) {
                const transactions = response.data.transactions || [];
                console.log("📦 Barcha transaksyalar:", transactions);
                
                // Faqat to'langan transaksyalarni filter qilish
                const techPayments = transactions.filter(transaction => {
                    // To'lov holati - state 2 = PAID, status = "PAID"
                    const isPaid = transaction.state === 2 || transaction.status === "PAID";
                    return isPaid;
                });
                
                console.log("✅ Filterlangan to'lovlar:", techPayments);
                setPayments(techPayments);
                setFilteredPayments(techPayments);
                
                // 0-indeksdagi eng so'nggi to'lovni olish
                if (techPayments.length > 0) {
                    // Eng so'nggi to'lovni olish (create_time bo'yicha saralash)
                    const sortedPayments = [...techPayments].sort((a, b) => 
                        (b.create_time || 0) - (a.create_time || 0)
                    );
                    
                    const latest = sortedPayments[0];
                    setLatestPayment(latest);
                    console.log("⭐ Eng so'nggi to'lov (0-index):", latest);
                    
                    // Obuna tugash sanasini hisoblash (to'lovdan 1 oy keyin)
                    const paidDate = new Date(latest.created_at || latest.create_time);
                    const expiryDate = new Date(paidDate);
                    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 oylik obuna
                    
                    setSubscriptionExpiry(expiryDate);
                }
            } else {
                console.warn("⚠️ Transaksyalar topilmadi yoki success=false");
                setPayments([]);
                setFilteredPayments([]);
            }
        } catch (error) {
            console.error("❌ To'lovlarni yuklashda xato:", error.response?.data || error.message);
            setPayments([]);
            setFilteredPayments([]);
        } finally {
            setLoading(false);
        }
    };

    // Qidirish tarixiga qo'shish
    const addToSearchHistory = (term) => {
        if (!term.trim()) return;
        
        const updatedHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 5);
        setSearchHistory(updatedHistory);
        localStorage.setItem('paymentSearchHistory', JSON.stringify(updatedHistory));
    };

    // Qidirishni tozalash
    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Qidirish natijasini tanlash
    const selectSearchResult = (term) => {
        setSearchTerm(term);
        addToSearchHistory(term);
        setShowSearchResults(false);
    };

    const getDaysLeft = (expiryDate) => {
        if (!expiryDate) return null;
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const formatDate = (date) => {
        if (!date) return 'Noma\'lum';
        return new Date(date).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount) => {
        if (!amount) return '0';
        return Number(amount).toLocaleString('uz-UZ');
    };

    const daysLeft = getDaysLeft(subscriptionExpiry);

    return (
        <div className="bg-white">
            {/* Top Section: Breadcrumb & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                {/* Breadcrumb */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <Link to="/" className="hover:text-blue-600 transition-colors capitalize">{t('dashboard')}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 capitalize">{t('app_payments')}</span>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center space-x-2 relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowSearchResults(true)}
                            placeholder="Qidirish (summa, ID, sana)..."
                            className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors text-gray-700"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        
                        {/* Tozalash tugmasi */}
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Qidirish natijalari dropdown */}
                        {showSearchResults && searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <>
                                        {/* Qidirish natijalari */}
                                        {searchResults.slice(0, 5).map((result, index) => (
                                            <div
                                                key={result._id || index}
                                                onClick={() => selectSearchResult(result.amount?.toString() || result.transaction_id)}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {formatAmount(result.amount)} so'm
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(result.created_at).toLocaleDateString('uz-UZ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        ID: {result.transaction_id?.slice(-8)}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                        To'langan
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Barcha natijalar soni */}
                                        {searchResults.length > 5 && (
                                            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                                                + {searchResults.length - 5} ta ko'proq natija
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="px-4 py-3 text-center text-gray-500">
                                        <p className="text-sm">Hech narsa topilmadi</p>
                                        <p className="text-xs mt-1">Boshqa so'z bilan urinib ko'ring</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Qidirish tarixi */}
                    {showSearchResults && searchHistory.length > 0 && !searchTerm && (
                        <div className="absolute top-full right-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
                                So'nggi qidiruvlar
                            </div>
                            {searchHistory.map((term, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectSearchResult(term)}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                                >
                                    <Search className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-700">{term}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="p-2 border cursor-pointer border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-gray-600">
                        <ChevronDown className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <ChevronUp className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Qidirish natijalari soni */}
            {searchTerm && filteredPayments.length > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                    "{searchTerm}" bo'yicha <span className="font-semibold">{filteredPayments.length}</span> ta natija topildi
                </div>
            )}

            {/* Latest Payment Card - 0-index to'lov ma'lumoti */}
            {!loading && latestPayment && !searchTerm && (
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Texnik Profil Obunasi</h2>
                                    <p className="text-blue-100 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Aktiv obuna
                                    </p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                                    <span className="text-sm font-medium">ID: {latestPayment._id?.slice(-8)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* To'lov summasi */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm text-blue-100">To'lov summasi</span>
                                    </div>
                                    <p className="text-3xl font-bold">{formatAmount(latestPayment.amount)} so'm</p>
                                    <p className="text-xs text-blue-200 mt-2">To'lov usuli: {latestPayment.payment_method || 'Payme'}</p>
                                </div>

                                {/* To'lov sanasi */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm text-blue-100">To'lov sanasi</span>
                                    </div>
                                    <p className="text-lg font-semibold">{formatDate(latestPayment.created_at)}</p>
                                    <p className="text-xs text-blue-200 mt-2">Transaction: {latestPayment.transaction_id?.slice(-8)}</p>
                                </div>

                                {/* Tugash sanasi */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <CalendarClock className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm text-blue-100">Tugash sanasi</span>
                                    </div>
                                    <p className="text-lg font-semibold">{subscriptionExpiry ? formatDate(subscriptionExpiry) : 'Noma\'lum'}</p>
                                    <p className="text-xs text-blue-200 mt-2">1 oylik obuna</p>
                                </div>

                                {/* Qolgan kunlar */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm text-blue-100">Qolgan muddat</span>
                                    </div>
                                    <p className="text-4xl font-bold">{daysLeft || 0}</p>
                                    <p className="text-xs text-blue-200 mt-2">kun qoldi</p>
                                </div>
                            </div>

                            {/* Status bar */}
                            <div className="mt-6 flex items-center justify-between bg-white/5 rounded-2xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${daysLeft > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                                    <span className="text-sm">
                                        {daysLeft > 0 
                                            ? `Obuna faol • ${daysLeft} kun qoldi` 
                                            : 'Obuna muddati tugagan'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-200">Order ID: {latestPayment.order_id?.orderNumber || latestPayment.order_id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Qidirish natijalari yo'qligi haqida xabar */}
            {searchTerm && filteredPayments.length === 0 && (
                <div className="mb-8 p-8 bg-gray-50 rounded-2xl text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Hech narsa topilmadi</h3>
                    <p className="text-gray-500">"{searchTerm}" bo'yicha hech qanday to'lov topilmadi</p>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                    #
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Summa
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tranzaksiya ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    Holati
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                    To'lov sanasi
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                    Tugash vaqti
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="flex items-center justify-center py-20">
                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((payment, index) => {
                                    const paidDate = new Date(payment.created_at || payment.create_time);
                                    const expiryDate = new Date(paidDate);
                                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                                    const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatAmount(payment.amount)} so'm
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {payment.transaction_id?.charAt(0)?.toUpperCase() || 'T'}
                                                    </div>
                                                    <span className="font-mono text-xs">{payment.transaction_id || 'Noma\'lum'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    To'langan
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-600">
                                                {formatDate(payment.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                {daysLeft > 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                            daysLeft > 7 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : daysLeft > 3 
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {daysLeft} kun qoldi
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                                                        Muddati tugagan
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-20 h-20 bg-white border-2 border-dashed border-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Database className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-gray-500 text-lg font-medium">
                                                {t('no_data')}
                                            </h3>
                                            <p className="text-gray-400 text-sm mt-2">
                                                Hozircha to'lovlar mavjud emas
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AppPaymentsContent;