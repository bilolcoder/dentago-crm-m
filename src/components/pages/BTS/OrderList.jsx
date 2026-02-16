import React, { useState, useEffect } from 'react';
import { MdCheck } from "react-icons/md";
import { Search, Package, Loader2, X, Phone, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import { useData } from '../../../context/DataProvider';
import Rasm from "../../../assets/dentago.png";
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { FaScrewdriverWrench } from "react-icons/fa6";

function Aperator() {
  const { user } = useData();
  const navigate = useNavigate();
  const PRIMARY_COLOR = "#00BCE4";
  const BASE_URL = "https://app.dentago.uz";

  const ITEMS_PER_PAGE = 10;

  // States
  const [allFlatOrders, setAllFlatOrders] = useState([]); // har bir mahsulot alohida qator
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMasterOrder, setSelectedMasterOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Namuna uchun ustaga buyurtmalar ma'lumotlari (to'liq saqlangan)
  const masterOrders = [
    {
      id: 1,
      images: [
        "https://via.placeholder.com/400x400?text=Rasm+1",
        "https://via.placeholder.com/400x400?text=Rasm+2",
        "https://via.placeholder.com/400x400?text=Rasm+3"
      ],
      description: "Tish protezini ta'mir lash kerak, uzoq vaqtdan beri ishlatilmoqda va sinish belgilari bor.",
      phone1: "+998700386666",
      phone2: "+998 95 219 26 99",
      status: "kutilmoqda",
      date: "29.01.2026"
    },
    {
      id: 2,
      images: [
        "https://via.placeholder.com/400x400?text=Mahsulot+1",
        "https://via.placeholder.com/400x400?text=Mahsulot+2",
        "https://via.placeholder.com/400x400?text=Mahsulot+3"
      ],
      description: "Yangi uskuna o'rnatish bo'yicha maslahat so'ralmoqda.",
      phone1: "+998700386666",
      phone2: "+998 95 219 26 99",
      status: "tasdiqlandi",
      date: "28.01.2026"
    },
    {
      id: 3,
      images: [
        "https://via.placeholder.com/400x400?text=Uskuna+1",
        "https://via.placeholder.com/400x400?text=Uskuna+2",
        "https://via.placeholder.com/400x400?text=Uskuna+3"
      ],
      description: "Eski uskunani yangilash bo'yicha buyurtma rad etildi.",
      phone1: "+998700386666",
      phone2: "+998 95 219 26 99",
      status: "bekor qilindi",
      date: "27.01.2026"
    },
    {
      id: 4,
      images: [
        "https://via.placeholder.com/400x400?text=Implant+1",
        "https://via.placeholder.com/400x400?text=Implant+2"
      ],
      description: "Tish implantatsiyasi uchun konsultatsiya kerak, bemor yangi tish o'rnatishni xohlaydi.",
      phone1: "+998 90 123 45 67",
      phone2: "+998 91 234 56 78",
      status: "kutilmoqda",
      date: "30.01.2026"
    },
    {
      id: 5,
      images: [
        "https://via.placeholder.com/400x400?text=Ortopediya+1",
        "https://via.placeholder.com/400x400?text=Ortopediya+2"
      ],
      description: "Tish ortopediyasi bo'yicha mutaxassislik, protez tayyorlash kerak.",
      phone1: "+998 93 456 78 90",
      phone2: "+998 94 567 89 01",
      status: "tasdiqlandi",
      date: "31.01.2026"
    }
  ];

  const getMasterStatusStyle = (status) => {
    switch (status) {
      case 'tasdiqlandi': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'kutilmoqda': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'bekor qilindi': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const determineStatus = (order) => {
    if (order.paymentStatus === "paid") {
      return order.deliveryStatus === "delivered" ? "yaxshi" : "o'rtacha";
    }
    return "yomon";
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi!");

      const response = await axios.get(`${BASE_URL}/api/order/history`, {
        params: { page: 1, limit: 500 },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = response.data;
      if (!result.success) throw new Error(result.message || "Ma'lumotlar olinmadi");

      const ordersData = Array.isArray(result.data) ? result.data : [];

      // Har bir itemni alohida qator qilish
      const flatOrders = ordersData.flatMap(order => {
        const orderNumber = order.orderNumber || order._id.slice(-8).toUpperCase();
        const createdAt = order.createdAt
          ? new Date(order.createdAt).toLocaleString('uz-UZ', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            })
          : '—';

        return order.items?.map((item, index) => {
          const snapshot = item.productSnapshot || {};
          return {
            id: `${order._id}-${index}`,
            orderNumber,
            createdAt,
            mahsulotNomi: snapshot.name || "Noma'lum mahsulot",
            soni: item.quantity || 1,
            totalNarx: (snapshot.price || 0) * (item.quantity || 1),
            tadbirkor: snapshot.company || "Dentago",
            status: determineStatus(order),
          };
        }) || [];
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
          status: "yaxshi",
        },
        {
          id: "static-2-0",
          orderNumber: "ORD002",
          createdAt: "14.02.2026 09:15",
          mahsulotNomi: "Implant atsessorlar to'plami",
          soni: 1,
          totalNarx: 850000,
          tadbirkor: "Dentago",
          status: "o'rtacha",
        }
      ];

      setAllFlatOrders([...flatOrders, ...staticOrders]);
    } catch (err) {
      console.error("Xatolik:", err);
      // fallback statik ma'lumotlar
      setAllFlatOrders([
        {
          id: "static-1-0",
          orderNumber: "ORD001",
          createdAt: "15.02.2026 14:30",
          mahsulotNomi: "Tish shifonieri Premium",
          soni: 2,
          totalNarx: 300000,
          tadbirkor: "Dentago",
          status: "yaxshi",
        },
        {
          id: "static-2-0",
          orderNumber: "ORD002",
          createdAt: "14.02.2026 09:15",
          mahsulotNomi: "Implant atsessorlar to'plami",
          soni: 1,
          totalNarx: 850000,
          tadbirkor: "Dentago",
          status: "o'rtacha",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pagination hisoblash
  const totalItems = allFlatOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = allFlatOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'yaxshi': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'o\'rtacha': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'yomon': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
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
    <div className="bg-white font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 px-6 pt-6">
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

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Qidiruv..." className="pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-full md:w-80 text-sm font-bold" />
        </div>
      </div>

      {/* Buyurtmalar jadvali */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-[1rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">ID / Mahsulot</th>
                  <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Kompaniya</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Soni</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Narxi</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Sana / Vaqt</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#00BCE4]/[0.03] transition-colors duration-150">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#00BCE4] mb-1">#{order.orderNumber}</span>
                        <span className="text-sm font-bold text-slate-800">{order.mahsulotNomi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{order.tadbirkor}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">{order.soni} ta</span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-black text-slate-800">
                      {order.totalNarx.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700">
                      {order.createdAt}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {order.id.includes("static-2") ? (
                          <button className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        ) : (
                          <button className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                            <MdCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <Package size={64} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-xl font-bold text-slate-400 mb-2">Hech qanday buyurtma topilmadi</p>
                      <p className="text-sm text-slate-500">Yangi buyurtmalar paydo bo'lganda bu yerda ko'rinadi</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
         {/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
    {/* Chap tarafdagi ma'lumot */}
    <div className="text-sm text-slate-600">
      Jami: {totalItems} ta mahsulot, Sahifa {currentPage} dan {totalPages}
    </div>

    {/* Sahifalar raqamlari va tugmalar */}
    <div className="flex items-center gap-2">
      {/* Oldingi */}
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-9 h-9 rounded-md border border-slate-300
          ${currentPage === 1 
            ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
            : 'text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
          }
        `}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Raqamlar */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`
            flex items-center justify-center w-9 h-9 rounded-md border font-medium text-sm
            ${currentPage === page
              ? 'bg-[#00BCE4] text-white border-[#00BCE4] cursor-pointer'
              : 'text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer transition-colors'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Keyingi */}
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-9 h-9 rounded-md border border-slate-300
          ${currentPage === totalPages 
            ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
            : 'text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
          }
        `}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
)}
        </div>
      </div>

      {/* Ustaga buyurtmalar bo'limi */}
      {user?.role !== 'master' && (
        <div className="mb-8 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-[#00BCE4]/10 text-[#00BCE4]">
              <FaScrewdriverWrench size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
              Ustaga <span style={{ color: PRIMARY_COLOR }}>Buyurtmalar</span>
            </h2>
          </div>

          <div className="bg-white rounded-[1rem] shadow-sm overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rasmi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tavsif (Description)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aloqa (Tel)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Batafsil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {masterOrders.map((mOrder) => (
                    <tr
                      key={mOrder.id}
                      onClick={() => {
                        setSelectedMasterOrder(mOrder);
                        setIsDetailModalOpen(true);
                      }}
                      className="hover:bg-[#00BCE4]/[0.02] transition-all cursor-pointer group"
                    >
                      <td className="px-8 py-5">
                        <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-[#00BCE4]/30 transition-all">
                          <img src={Rasm} alt="order" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-700 max-w-[400px] truncate">
                          {mOrder.description}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-black text-[#00BCE4]">
                            <Phone size={12} strokeWidth={3} />
                            <span>+99870 038 66 66</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getMasterStatusStyle(mOrder.status)}`}>
                          {mOrder.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button className="p-2 rounded-xl cursor-pointer bg-slate-50 text-slate-400 group-hover:bg-[#00BCE4] group-hover:text-white transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ustaga buyurtma tafsilotlari Modali */}
      {isDetailModalOpen && selectedMasterOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
                  Buyurtma <span style={{ color: PRIMARY_COLOR }}>Tafsilotlari</span>
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedMasterOrder(null);
                }}
                className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90 cursor-pointer"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="aspect-square rounded-[2rem] border-2 border-slate-100 overflow-hidden bg-slate-50 group relative">
                    <Swiper
                      modules={[Navigation, SwiperPagination]}
                      navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                      }}
                      pagination={{ clickable: true }}
                      slidesPerView={1}
                      spaceBetween={0}
                      className="w-full h-full"
                    >
                      {selectedMasterOrder.images?.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={Rasm}
                            alt={`Order detail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-2xl border-white flex items-center justify-center text-[#00BCE4] transition-all active:scale-90 disabled:opacity-0 cursor-pointer">
                      <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <button className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-2xl border-white flex items-center justify-center text-[#00BCE4] transition-all active:scale-90 disabled:opacity-0 cursor-pointer">
                      <ChevronRight size={24} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        selectedMasterOrder.status === 'tasdiqlandi' ? 'text-emerald-500' :
                        selectedMasterOrder.status === 'kutilmoqda' ? 'text-amber-500' :
                        'text-rose-500'
                      }`}>
                        {selectedMasterOrder.status}
                      </span>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sana</p>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{selectedMasterOrder.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tavsif</h3>
                      <p className="text-slate-700 font-bold leading-relaxed text-sm bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        {selectedMasterOrder.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Aloqa ma'lumotlari</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#00BCE4]/5 border border-[#00BCE4]/10 group hover:border-[#00BCE4]/30 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-[#00BCE4] flex items-center justify-center text-white shadow-lg shadow-[#00BCE4]/20">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asosiy raqam</p>
                            <p className="text-sm font-black text-[#00BCE4]">{selectedMasterOrder.phone1}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qo'shimcha</p>
                            <p className="text-sm font-bold text-slate-700">{selectedMasterOrder.phone2}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full mt-8 py-5 rounded-3xl bg-[#00BCE4] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-[#00BCE4]/30 hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                    onClick={() => alert("Mijoz bilan bog'lanish tizimi tayyorlanmoqda...")}
                  >
                    Mijoz bilan bog'lanish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aperator;