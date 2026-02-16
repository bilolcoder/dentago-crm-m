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

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error("Token topilmadi!");

        // 1. Buyurtmalar tarixi
        const historyRes = await axios.get(`${BASE_URL}/api/order/history`, {
          params: { page: 1, limit: 500 },
          headers: { Authorization: `Bearer ${token}` }
        });

        let ordersData = [];
        if (historyRes.data.success) {
          ordersData = Array.isArray(historyRes.data.data) ? historyRes.data.data : [];
        }

        // 2. Umumiy statistika (stats endpoint)
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
          const statsRes = await axios.get(`${BASE_URL}/api/order/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statsRes.data.success && statsRes.data.data) {
            stats = statsRes.data.data;
          }
        } catch (statsErr) {
          console.warn("Stats endpoint xatosi:", statsErr);
        }

        setOrderStats(stats);

        // Buyurtmalarni flat qilish
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

          return (order.items || []).map((item, index) => ({
            id: `${order._id}-${index}`,
            orderNumber,
            createdAt,
            mahsulotNomi: item.productSnapshot?.name || "Noma'lum mahsulot",
            soni: item.quantity || 1,
            totalNarx: (item.productSnapshot?.price || 0) * (item.quantity || 1),
            tadbirkor: item.productSnapshot?.company || "Dentago",
            status: displayStatus,
          }));
        });

        // Statik ma'lumotlar
        const staticOrders = [
          {
            id: "static-1-0",
            orderNumber: "ORD001",
            createdAt: "15.02.2026 14:30",
            mahsulotNomi: "Tish shifonieri Premium",
            soni: 2,
            totalNarx: 300000,
            tadbirkor: "Dentago",
            status: "yetkazib berildi",
          },
          {
            id: "static-2-0",
            orderNumber: "ORD002",
            createdAt: "14.02.2026 09:15",
            mahsulotNomi: "Implant atsessorlar to'plami",
            soni: 1,
            totalNarx: 850000,
            tadbirkor: "Dentago",
            status: "to'langan",
          }
        ];

        setAllFlatOrders([...flatOrders, ...staticOrders]);
      } catch (err) {
        console.error("Xatolik:", err);
        setAllFlatOrders([
          {
            id: "fallback-1",
            orderNumber: "TEST001",
            createdAt: new Date().toLocaleString('uz-UZ'),
            mahsulotNomi: "Test mahsulot",
            soni: 3,
            totalNarx: 450000,
            tadbirkor: "Dentago",
            status: "yetkazib berildi",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    const totalItems = allFlatOrders.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = allFlatOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        case 'pendingpayment':
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
              Jami: {totalItems} ta mahsulot
            </p>
          </div>

        </div>

        {/* Umumiy statistika kartalari - chiroyli dizayn */}
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

          {/* Qo'shimcha holatlar (agar kerak bo'lsa ko'paytirish mumkin) */}
          {orderStats.processing > 0 && (
            <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-indigo-700 mb-1">Jarayonda</p>
              <p className="text-3xl font-bold text-indigo-700">{orderStats.processing.toLocaleString()}</p>
            </div>
          )}
          {orderStats.shipped > 0 && (
            <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-purple-700 mb-1">Jo'natilgan</p>
              <p className="text-3xl font-bold text-purple-700">{orderStats.shipped.toLocaleString()}</p>
            </div>
          )}
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
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">ID / Mahsulot</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Kompaniya</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Soni</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Narxi</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Sana / Vaqt</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#00BCE4]/[0.03] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#00BCE4] mb-1">#{order.orderNumber}</span>
                        <span className="text-sm font-bold text-slate-800">{order.mahsulotNomi}</span>
                      </div>
                    </td>
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
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {order.id.includes("static-2") ? (
                          <button className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">
                            <X className="w-6 h-6" />
                          </button>
                        ) : (
                          <button className="w-9 h-9 rounded-xl flex justify-center items-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer">
                            <MdCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-slate-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">Hech qanday buyurtma topilmadi</p>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#00BCE4] text-white border-[#00BCE4] cursor-pointer'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
                    }`}
                  >
                    {page}
                  </button>
                ))}

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