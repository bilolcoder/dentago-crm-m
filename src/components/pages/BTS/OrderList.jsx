import React, { useState, useEffect } from 'react';
import { MdCheck } from "react-icons/md";
import { Search, Package, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useData } from '../../../context/DataProvider';
import { useNavigate } from 'react-router-dom';

function Aperator() {
  const { user } = useData();
  const navigate = useNavigate();
  const PRIMARY_COLOR = "#00BCE4";
  const BASE_URL = "https://app.dentago.uz";

  const ITEMS_PER_PAGE = 10;

  const [allFlatOrders, setAllFlatOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingPayment: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Admin ekanligini tekshirish
  const isAdmin = user?.role === 'admin' || user?.role === 'operator' || user?.isAdmin === true;

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi!");

      // 1. Buyurtmalar tarixi - AGAR ADMIN BO'LSA ?all=true QO'SHAMIZ
      const historyUrl = isAdmin 
        ? `${BASE_URL}/api/order/history?all=true&page=1&limit=500`
        : `${BASE_URL}/api/order/history?page=1&limit=500`;

      const historyRes = await axios.get(historyUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let ordersData = [];
      if (historyRes.data.success) {
        ordersData = Array.isArray(historyRes.data.data) ? historyRes.data.data : [];
        console.log("Ma'lumotlar keldi:", ordersData.length, "ta buyurtma");
      }

      // 2. Statistika - ADMIN UCHUN ?all=true QO'SHAMIZ
      let stats = {
        totalOrders: 0,
        totalAmount: 0,
        pendingPayment: 0,
        paid: 0,
        processing: 0,
        shipped: 0,
        delivered: 0
      };
      
      try {
        const statsUrl = isAdmin 
          ? `${BASE_URL}/api/order/stats?all=true`
          : `${BASE_URL}/api/order/stats`;
          
        const statsRes = await axios.get(statsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.data.success && statsRes.data.data) {
          stats = statsRes.data.data;
        }
      } catch (e) {
        console.warn("Stats xatosi:", e);
      }

      setOrderStats(stats);

      // Flat orders + statusni aniqroq boshqarish
      const flatOrders = ordersData.flatMap(order => {
        const orderNumber = order.orderNumber || order._id?.slice(-8)?.toUpperCase() || "—";
        const createdAt = order.createdAt
          ? new Date(order.createdAt).toLocaleString('uz-UZ', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            })
          : '—';

        let displayStatus = "kutilmoqda";
        if (order.paymentStatus === "paid") {
          displayStatus = order.deliveryStatus === "delivered" ? "yetkazib berildi" : "to'langan";
        } else if (order.paymentStatus === "cancelled") {
          displayStatus = "bekor qilingan";
        }

        // Foydalanuvchi ma'lumotlarini olish
        let userName = "Noma'lum foydalanuvchi";
        let userPhone = "—";
        let userEmail = "—";
        
        if (order.userId) {
          if (typeof order.userId === 'object') {
            userName = order.userId.name || order.userId.firstName || order.userId.phone || 'Noma\'lum foydalanuvchi';
            userPhone = order.userId.phone || '—';
            userEmail = order.userId.email || '—';
          } else if (typeof order.userId === 'string') {
            userName = `User ID: ${order.userId.slice(-6)}`;
          }
        }

        return (order.items || []).map((item, index) => ({
          id: order._id,
          itemIndex: index,
          orderNumber,
          createdAt,
          mahsulotNomi: item.productSnapshot?.name || "Noma'lum mahsulot",
          soni: item.quantity || 1,
          totalNarx: (item.productSnapshot?.price || 0) * (item.quantity || 1),
          tadbirkor: item.productSnapshot?.company || "Dentago",
          status: displayStatus,
          paymentStatus: order.paymentStatus || "pending",
          // Foydalanuvchi ma'lumotlari
          userInfo: {
            name: userName,
            phone: userPhone,
            email: userEmail,
            userId: order.userId?._id || order.userId
          }
        }));
      });

      console.log("Flat orders:", flatOrders.length, "ta mahsulot");
      setAllFlatOrders(flatOrders);
      setFilteredOrders(flatOrders);

    } catch (err) {
      console.error("Xatolik:", err);
      alert("Ma'lumotlarni yuklashda xatolik: " + err.message);
      setAllFlatOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filterlash funksiyasi
  useEffect(() => {
    let filtered = [...allFlatOrders];

    // Qidiruv bo'yicha filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(term) ||
        order.mahsulotNomi.toLowerCase().includes(term) ||
        order.tadbirkor.toLowerCase().includes(term) ||
        (order.userInfo?.name && order.userInfo.name.toLowerCase().includes(term)) ||
        (order.userInfo?.phone && order.userInfo.phone.includes(term))
      );
    }

    // Status bo'yicha filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'pending') return order.paymentStatus === 'pending';
        if (statusFilter === 'paid') return order.paymentStatus === 'paid';
        if (statusFilter === 'delivered') return order.status === 'yetkazib berildi';
        if (statusFilter === 'cancelled') return order.paymentStatus === 'cancelled';
        return true;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, allFlatOrders]);

  const handleConfirmPayment = async (orderId) => {
    if (!orderId) return;

    setActionLoading(prev => ({ ...prev, [orderId]: true }));

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${BASE_URL}/api/order/payment/${orderId}`,
        { paymentStatus: "paid" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAllFlatOrders(prev =>
        prev.map(item =>
          item.id === orderId
            ? { ...item, paymentStatus: "paid", status: "to'langan" }
            : item
        )
      );

      alert("To'lov tasdiqlandi!");
    } catch (err) {
      console.error("To'lov tasdiqlash xatosi:", err);
      alert("Xatolik yuz berdi: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status) => {
    let color = 'bg-gray-100 text-gray-700';
    let text = status || '—';

    switch (status?.toLowerCase()) {
      case 'yetkazib berildi':
      case 'delivered':
        color = 'bg-emerald-100 text-emerald-800';
        text = 'Yetkazib berildi';
        break;
      case 'to\'langan':
      case 'paid':
        color = 'bg-blue-100 text-blue-800';
        text = "To'langan";
        break;
      case 'kutilmoqda':
      case 'pending':
        color = 'bg-amber-100 text-amber-800';
        text = 'Kutilmoqda';
        break;
      case 'bekor qilingan':
      case 'cancelled':
        color = 'bg-rose-100 text-rose-800';
        text = 'Bekor qilingan';
        break;
      default:
        color = 'bg-slate-100 text-slate-700';
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00BCE4] mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#00BCE4]/10 text-[#00BCE4]">
              <Package size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
              Buyurtmalar <span style={{ color: PRIMARY_COLOR }}>Tarixi</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
            Jami: {totalItems} ta mahsulot {isAdmin && `(barcha foydalanuvchilar - ${allFlatOrders.length} ta)`}
          </p>
        </div>

        {/* Filter va qidiruv - faqat adminlar uchun */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Qidiruv input */}
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buyurtma ID, mahsulot, foydalanuvchi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/50 focus:border-[#00BCE4] transition-all text-sm"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/50 focus:border-[#00BCE4] transition-all text-sm bg-white"
            >
              <option value="all">Barcha statuslar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="paid">To'langan</option>
              <option value="delivered">Yetkazib berilgan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>
        )}
      </div>

      {/* Umumiy statistika kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-500 mb-1">Jami buyurtmalar</p>
          <p className="text-3xl font-bold text-slate-800">{orderStats.totalOrders.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-amber-700 mb-1">To'lov kutilmoqda</p>
          <p className="text-3xl font-bold text-amber-700">{orderStats.pendingPayment.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-blue-700 mb-1">To'langan</p>
          <p className="text-3xl font-bold text-blue-700">{orderStats.paid.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-emerald-700 mb-1">Yetkazib berilgan</p>
          <p className="text-3xl font-bold text-emerald-700">{orderStats.delivered.toLocaleString()}</p>
        </div>
      </div>

      {/* Umumiy summa */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#00BCE4]/10 to-blue-50 rounded-xl border border-[#00BCE4]/30">
        <p className="text-lg font-medium text-slate-700 mb-2">Umumiy buyurtma summasi</p>
        <p className="text-4xl font-black text-[#00BCE4]">
          {orderStats.totalAmount.toLocaleString()} so'm
        </p>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">ID / Mahsulot</th>
                {isAdmin && (
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Foydalanuvchi</th>
                )}
                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Kompaniya</th>
                <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Soni</th>
                <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Narxi</th>
                <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Sana / Vaqt</th>
                <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                {isAdmin && (
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">To'lov</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length > 0 ? paginatedOrders.map(order => {
                const canConfirm = order.paymentStatus === "pending" || order.paymentStatus === "waiting";
                const isLoading = actionLoading[order.id];

                return (
                  <tr key={`${order.id}-${order.itemIndex}`} className="hover:bg-[#00BCE4]/[0.03] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#00BCE4] mb-1">#{order.orderNumber}</span>
                        <span className="text-sm font-bold text-slate-800">{order.mahsulotNomi}</span>
                      </div>
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{order.userInfo?.name || 'Noma\'lum'}</span>
                          <span className="text-xs text-slate-500">{order.userInfo?.phone || '—'}</span>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{order.tadbirkor}</td>
                    
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">
                        {order.soni} ta
                      </span>
                    </td>
                    
                    <td className="px-6 py-5 text-center text-sm font-black text-slate-800">
                      {order.totalNarx.toLocaleString()} so'm
                    </td>
                    
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700">
                      {order.createdAt}
                    </td>
                    
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-5 text-center">
                        {canConfirm ? (
                          <button
                            onClick={() => handleConfirmPayment(order.id)}
                            disabled={isLoading}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              isLoading
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                            }`}
                            title="To'lovni tasdiqlash"
                          >
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <MdCheck size={20} />
                            )}
                          </button>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed" title="To'lov allaqachon tasdiqlangan">
                            <X size={20} />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6} className="py-20 text-center text-slate-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Hech qanday buyurtma topilmadi</p>
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        className="mt-4 text-[#00BCE4] hover:underline text-sm font-medium"
                      >
                        Filtrlarni tozalash
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
            <div className="text-sm text-slate-600">
              Jami: {totalItems} ta mahsulot, Sahifa {currentPage} dan {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded-md border ${
                  currentPage === 1 
                    ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
                    : 'text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-[#00BCE4] text-white border-[#00BCE4] cursor-pointer'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center rounded-md border ${
                  currentPage === totalPages 
                    ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
                    : 'text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Aperator;