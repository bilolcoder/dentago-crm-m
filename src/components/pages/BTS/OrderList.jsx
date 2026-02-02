import React, { useState, useEffect } from 'react';
import { MdDeleteOutline, MdCheck } from "react-icons/md";
import { Search, Filter, Download, MoreHorizontal, Package, Truck, Loader2, X, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Rasm from "../../../assets/dentago.png"
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaScrewdriverWrench } from "react-icons/fa6";

function Aperator() {
  const navigate = useNavigate();
  const PRIMARY_COLOR = "#00BCE4";
  const BASE_URL = "https://app.dentago.uz";

  // Statelar
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null); // Qaysi qator menyusi ochiqligini saqlaydi
  const [selectedMasterOrder, setSelectedMasterOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Namuna uchun ustaga buyurtmalar ma'lumotlari
  const masterOrders = [
    {
      id: 1,
      images: [
        "https://via.placeholder.com/400x400?text=Rasm+1",
        "https://via.placeholder.com/400x400?text=Rasm+2",
        "https://via.placeholder.com/400x400?text=Rasm+3"
      ],
      description: "Tish protezini ta'mir lash kerak, uzoq vaqtdan beri ishlatilmoqda va sinish belgilari bor.",
      phone1: "+998 77 297 22 22",
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
      phone1: "+998 77 297 22 22",
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
      phone1: "+998 77 297 22 22",
      phone2: "+998 95 219 26 99",
      status: "bekor qilindi",
      date: "27.01.2026"
    },
    // Statik ma'lumotlar
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // API dan ma'lumot olish
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error("Token topilmadi! Tizimga qayta kiring.");
      }

      const response = await axios.get(`${BASE_URL}/api/order/history`, {
        params: { page: 1, limit: 10 },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Ma'lumotlar olinmadi");
      }

      const ordersData = Array.isArray(result.data) ? result.data : [];

      const mappedOrders = ordersData.map(order => {
        const firstItem = order.items?.[0] || {};
        const snapshot = firstItem.productSnapshot || {};

        // Statusni aniqlash
        let status = "o'rtacha";
        if (order.paymentStatus === "paid") {
          if (order.deliveryStatus === "delivered") status = "yaxshi";
          else status = "o'rtacha";
        } else {
          status = "yomon";
        }

        return {
          id: order._id,
          orderNumber: order.orderNumber || order._id.slice(-8).toUpperCase(),
          mahsulotNomi: snapshot.name || "Noma'lum mahsulot",
          mahsulotNarxi: snapshot.price || 0,
          soni: firstItem.quantity || 1,
          mijoz: order.user?.username || order.user?.name || "Mijoz",
          totalNarx: order.totalAmount || (snapshot.price * firstItem.quantity) || 0,
          tadbirkor: snapshot.company || "Dentago",
          status,
          selectedAction: null,
          manzil: order.shippingAddress || "Manzil ko'rsatilmagan",
        };
      });

      // Statik ma'lumotlar qo'shish
      const staticOrders = [
        {
          id: "static-1",
          orderNumber: "ORD001",
          mahsulotNomi: "Tish shifonieri Premium",
          mahsulotNarxi: 150000,
          soni: 2,
          mijoz: "Ibrohimov Shaxzod",
          totalNarx: 300000,
          tadbirkor: "Dentago",
          status: "yaxshi",
          selectedAction: null
        },
        {
          id: "static-2",
          orderNumber: "ORD002",
          mahsulotNomi: "Implant atsessorlar to'plami",
          mahsulotNarxi: 850000,
          soni: 1,
          mijoz: "Karimova Nigora",
          totalNarx: 850000,
          tadbirkor: "Dentago",
          status: "o'rtacha",
          selectedAction: null
        }
      ];

      // API ma'lumotlari va statik ma'lumotlarni birlashtirish
      const allOrders = [...mappedOrders, ...staticOrders];

      setOrders(allOrders);

      const pag = result.pagination || {};
      setTotalOrders(pag.total + staticOrders.length || allOrders.length);
      setTotalPages(pag.pages || 1);
      setCurrentPage(pag.page || 1);

    } catch (err) {
      console.error("Xatolik:", err);
      setError(err.message || "Internet yoki server bilan muammo");
      
      // API ishlamasa ham statik ma'lumotlar ko'rinadi
      const staticOrders = [
        {
          id: "static-1",
          orderNumber: "ORD001",
          mahsulotNomi: "Tish shifonieri Premium",
          mahsulotNarxi: 150000,
          soni: 2,
          // mijoz: "Ibrohimov Shaxzod",
          totalNarx: 300000,
          tadbirkor: "Dentago",
          // status: "yaxshi",
          selectedAction: null
        },
        {
          id: "static-2",
          orderNumber: "ORD002",
          mahsulotNomi: "Implant atsessorlar to'plami",
          mahsulotNarxi: 850000,
          soni: 1,
          // mijoz: "Karimova Nigora",
          totalNarx: 850000,
          tadbirkor: "Dentago",
          // status: "o'rtacha",
          selectedAction: null
        }
      ];
      
      setOrders(staticOrders);
      setTotalOrders(staticOrders.length);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Amalni tanlash funksiyasi
  const handleAction = (orderId, actionName) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, selectedAction: actionName } : order
    ));
    setActiveMenu(null);
  };

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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
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
            Jami: {totalOrders} ta buyurtma
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Qidiruv..." className="pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-full md:w-80 text-sm font-bold" />
          </div>
          <button className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:text-[#00BCE4] transition-all"><Filter size={20} /></button>
          <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#00BCE4] text-white font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer"><Download size={16} />Eksport</button>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-[1rem] shadow-sm border border-slate-100 mb-12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">ID / Mahsulot</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Kompaniya</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Soni</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Narxi</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? orders.map(order => (
                <tr key={order.id} className="hover:bg-[#00BCE4]/[0.03] transition-colors duration-150">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#00BCE4] mb-1">#{order.orderNumber}</span>
                      <span className="text-sm font-bold text-slate-800">{order.mahsulotNomi}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">Dentago</td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">{order.soni} ta</span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-black text-slate-800">
                    {order.totalNarx.toLocaleString()} so'm
                  </td>
                  
                  {/* Amallar Ustuni */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {order.id === "static-2" ? (
                        // Ikkinchi statik ma'lumot uchun "x" tugmasi
                        <button className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors">
                          <X className="w-6 h-6" />
                        </button>
                      ) : (
                        // Boshqa buyurtmalar uchun "tick" tugmasi
                        <button className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                          <MdCheck size={18} />
                        </button>
                      )}
                      {/* <button className="w-9 h-9 rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <MoreHorizontal size={20} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-24 text-center">
                    <Package size={64} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-xl font-bold text-slate-400 mb-2">Hech qanday buyurtma topilmadi</p>
                    <p className="text-sm text-slate-500">Yangi buyurtmalar paydo bo'lganda bu yerda ko'rinadi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ustaga buyurtmalar bo'limi */}
      <div className="mb-8">
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
                        <img 
                          src={Rasm} 
                          alt="order" 
                          className="w-full h-full object-cover"
                          // onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Rasm'; }}
                        />
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
                          {/* <span>+998 77 297 22 22</span> */}
                          <span>+998 95 219 26 99</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getMasterStatusStyle(mOrder.status)}`}>
                        {mOrder.status}
                      </span>
                    </td>
                    <td className="px-8  py-5 text-center">
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
      {/* Ustaga buyurtma tafsilotlari Modali */}
      {isDetailModalOpen && selectedMasterOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
                  Buyurtma <span style={{ color: PRIMARY_COLOR }}>Tafsilotlari</span>
                </h2>
                {/* <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: #{selectedMasterOrder.id}</p> */}
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedMasterOrder(null);
                }}
                className="w-14 cursor-pointer h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Rasm (Swiper) */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-[2rem] border-2 border-slate-100 overflow-hidden bg-slate-50 group relative">
                    <Swiper
                      modules={[Navigation, Pagination]}
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

                    {/* Custom Navigation Buttons */}
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

                {/* Malumotlar */}
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
                          <div className="w-10 cursor-pointer h-10 rounded-xl bg-[#00BCE4] flex items-center justify-center text-white shadow-lg shadow-[#00BCE4]/20">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asosiy raqam</p>
                            <p className="text-sm font-black text-[#00BCE4]">+998 77 297 22 22</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qo'shimcha</p>
                            <p className="text-sm font-bold text-slate-700">+998 95 219 26 99</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="w-full cursor-pointer mt-8 py-5 rounded-3xl bg-[#00BCE4] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-[#00BCE4]/30 hover:-translate-y-1 transition-all active:scale-95"
                    onClick={() => {
                      // API call placeholder
                      console.log("Bog'lanish uchun so'rov yuborildi ID:", selectedMasterOrder.id);
                      alert("Mijoz bilan bog'lanish tizimi tayyorlanmoqda...");
                    }}
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