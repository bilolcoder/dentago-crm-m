// src/components/AppPaymentsContent.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataProvider';
import { Search, ChevronDown, ChevronUp, Database, Clock, CreditCard, Calendar, CheckCircle, User, Phone, CalendarClock, X, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getToken = () => localStorage.getItem('accessToken');

const AppPaymentsContent = () => {
    const { t } = useData();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        totalAmount: 0
    });
    
    // Qidirish uchun state'lar
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    // Filterlar
    const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, cancelled
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAllPayments();
        const savedHistory = localStorage.getItem('paymentSearchHistory');
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, payments, statusFilter, dateFilter]);

    const fetchAllPayments = async () => {
        try {
            setLoading(true);
            const token = getToken();
            if (!token) return;

            console.log("📋 Barcha to'lovlarni yuklash...");
            
            // 1000 tagacha to'lovlarni olish
            const response = await axios.get('https://app.dentago.uz/api/payment/transactions?page=1&limit=1000', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("📥 Javob:", response.data);

            if (response.data.success && response.data.transactions) {
                const allTransactions = response.data.transactions || [];
                console.log("📦 Barcha transaksyalar:", allTransactions.length);
                
                setPayments(allTransactions);
                setFilteredPayments(allTransactions);
                
                // Statistikani hisoblash
                const paidTransactions = allTransactions.filter(t => t.state === 2 || t.status === "PAID");
                const pendingTransactions = allTransactions.filter(t => t.state === 1 || t.status === "PENDING");
                const cancelledTransactions = allTransactions.filter(t => t.state === -1 || t.status === "CANCELLED");
                
                const totalAmount = paidTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                
                setStats({
                    total: allTransactions.length,
                    paid: paidTransactions.length,
                    pending: pendingTransactions.length,
                    cancelled: cancelledTransactions.length,
                    totalAmount: totalAmount
                });
            }
        } catch (error) {
            console.error("❌ To'lovlarni yuklashda xato:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...payments];

        // Status bo'yicha filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => {
                if (statusFilter === 'paid') return p.state === 2 || p.status === "PAID";
                if (statusFilter === 'pending') return p.state === 1 || p.status === "PENDING";
                if (statusFilter === 'cancelled') return p.state === -1 || p.status === "CANCELLED";
                return true;
            });
        }

        if (dateFilter !== 'all') {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            
            filtered = filtered.filter(p => {
                const paymentDate = new Date(p.created_at || p.create_time);
                
                if (dateFilter === 'today') {
                    return paymentDate >= startOfDay;
                }
                if (dateFilter === 'week') {
                    const weekAgo = new Date(today.setDate(today.getDate() - 7));
                    return paymentDate >= weekAgo;
                }
                if (dateFilter === 'month') {
                    const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                    return paymentDate >= monthAgo;
                }
                return true;
            });
        }

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(payment => {
                const searchLower = searchTerm.toLowerCase().trim();
                const amount = payment.amount?.toString() || '';
                const transactionId = payment.transaction_id?.toLowerCase() || '';
                const orderId = payment.order_id?.orderNumber?.toLowerCase() || 
                               payment.order_id?.toString().toLowerCase() || '';
                const paymentMethod = payment.payment_method?.toLowerCase() || '';
                const createdAt = new Date(payment.created_at).toLocaleDateString('uz-UZ').toLowerCase();
                
                return (
                    amount.includes(searchLower) ||
                    transactionId.includes(searchLower) ||
                    orderId.includes(searchLower) ||
                    paymentMethod.includes(searchLower) ||
                    createdAt.includes(searchLower)
                );
            });
            
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }

        setFilteredPayments(filtered);
    };

    const addToSearchHistory = (term) => {
        if (!term.trim()) return;
        
        const updatedHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 5);
        setSearchHistory(updatedHistory);
        localStorage.setItem('paymentSearchHistory', JSON.stringify(updatedHistory));
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
    };

    const selectSearchResult = (term) => {
        setSearchTerm(term);
        addToSearchHistory(term);
        setShowSearchResults(false);
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

    const getStatusInfo = (payment) => {
        const state = payment.state;
        const status = payment.status;
        
        if (state === 2 || status === "PAID") {
            return { label: "To'langan", color: "bg-green-100 text-green-700" };
        }
        if (state === 1 || status === "PENDING") {
            return { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700" };
        }
        if (state === -1 || status === "CANCELLED") {
            return { label: "Bekor qilingan", color: "bg-red-100 text-red-700" };
        }
        return { label: "Noma'lum", color: "bg-gray-100 text-gray-700" };
    };

    const getPaymentType = (payment) => {
        if (payment.order_id?.orderNumber?.includes('TECH')) {
            return { label: "Texnik Profil", color: "bg-purple-100 text-purple-700" };
        }
        if (payment.order_id?.orderNumber?.includes('PATIENT')) {
            return { label: "Bemor to'lovi", color: "bg-blue-100 text-blue-700" };
        }
        return { label: "Boshqa to'lov", color: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <Link to="/" className="hover:text-blue-600 transition-colors capitalize">{t('dashboard')}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 capitalize">{t('app_payments')}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Barcha to'lovlar</h1>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowSearchResults(true)}
                            placeholder="Qidirish (summa, ID, usul)..."
                            className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors text-gray-700"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-gray-600 cursor-pointer"
                    >
                        <Filter className="w-5 h-5" />
                    </button>

                    <button
                        onClick={fetchAllPayments}
                        className="p-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Yangilash"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Holati</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="all">Barchasi</option>
                                <option value="paid">To'langan</option>
                                <option value="pending">Kutilmoqda</option>
                                <option value="cancelled">Bekor qilingan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sana</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="all">Barcha vaqtlar</option>
                                <option value="today">Bugun</option>
                                <option value="week">Oxirgi 7 kun</option>
                                <option value="month">Oxirgi 30 kun</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Jami to'lovlar</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">To'langan</p>
                    <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Kutilayotgan</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Bekor qilingan</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Umumiy summa</p>
                    <p className="text-2xl font-bold text-blue-600">{formatAmount(stats.totalAmount)} so'm</p>
                </div>
            </div>

            {searchTerm && (
                <div className="mb-4 text-sm text-gray-600">
                    "{searchTerm}" bo'yicha <span className="font-semibold">{filteredPayments.length}</span> ta natija topildi
                </div>
            )}

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
                                    To'lov turi
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Summa
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tranzaksiya ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    To'lov usuli
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    Holati
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                    To'lov sanasi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="flex items-center justify-center py-20">
                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((payment, index) => {
                                    const statusInfo = getStatusInfo(payment);
                                    const paymentType = getPaymentType(payment);
                                    
                                    return (
                                        <tr key={payment._id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${paymentType.color}`}>
                                                    {paymentType.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {formatAmount(payment.amount)} so'm
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {payment.transaction_id?.charAt(0)?.toUpperCase() || 'T'}
                                                    </div>
                                                    <span className="font-mono text-xs">{payment.transaction_id || 'Noma\'lum'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {payment.payment_method || 'Payme'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-600">
                                                {formatDate(payment.created_at)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7">
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