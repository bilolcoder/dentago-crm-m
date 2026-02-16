import React, { useState } from 'react';
import { MdCheck, MdClose } from "react-icons/md";
import { Eye, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const UstlarBuyurtmasi = () => {
  const PRIMARY_COLOR = "#00BCE4";

  // Statik ma'lumotlar
  const [masterOrders] = useState([
    {
      id: 1,
      masterName: "Usta Sardor",
      avatar: "https://via.placeholder.com/80?text=US",
      description: "Yangi uskuna o'rnatish bo'yicha maslahat so'ralmoqda. Joyida ko'rib chiqish kerak.",
      phone1: "+998 95 219 26 99",
      phone2: null,
      status: "kutilmoqda",
      date: "28.01.2026",
      images: [
        "https://via.placeholder.com/500x500?text=Rasm+1",
        "https://via.placeholder.com/500x500?text=Rasm+2",
        "https://via.placeholder.com/500x500?text=Rasm+3"
      ]
    },
    {
      id: 2,
      masterName: "Usta Kamol",
      avatar: "https://via.placeholder.com/80?text=UK",
      description: "Protezni ta'mirlash kerak, eski model, bir nechta sinish joylari bor.",
      phone1: "+998 95 219 26 99",
      phone2: null,
      status: "tasdiqlandi",
      date: "27.01.2026",
      images: [
        "https://via.placeholder.com/500x500?text=Protez+1",
        "https://via.placeholder.com/500x500?text=Protez+2",
        "https://via.placeholder.com/500x500?text=Protez+3"
      ]
    },
    {
      id: 3,
      masterName: "Usta Dilshod",
      avatar: "https://via.placeholder.com/80?text=UD",
      description: "Implantatsiya uchun material tanlashda yordam kerak. Bemor fotosurat yuborgan.",
      phone1: "+998 95 219 26 99",
      phone2: null,
      status: "bekor qilindi",
      date: "26.01.2026",
      images: [
        "https://via.placeholder.com/500x500?text=Implant+1",
        "https://via.placeholder.com/500x500?text=Implant+2",
        "https://via.placeholder.com/500x500?text=Implant+3"
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'tasdiqlandi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'kutilmoqda':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bekor qilindi':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirm = (id) => {
    alert(`Buyurtma #${id} tasdiqlandi`);
    // Bu yerda real holatda state yangilanadi yoki API chaqiriladi
  };

  const handleCancel = (id) => {
    alert(`Buyurtma #${id} bekor qilindi`);
    // Bu yerda real holatda state yangilanadi yoki API chaqiriladi
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl  text-slate-800 mb-8 tracking-tight">
        Ustalar Buyurtmalari
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            {/* Header / Rasm + ism */}
            <div className="p-5 flex items-center gap-4 border-b border-slate-100 bg-slate-50/70">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                <img
                  src={order.avatar}
                  alt={order.masterName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{order.masterName}</h3>
                <p className="text-xs text-slate-500">{order.date}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                  {order.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-[#00BCE4]" />
                  <span className="font-medium">{order.phone1}</span>
                </div>
                {order.phone2 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} />
                    <span>{order.phone2}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetailModal(order)}
                    className="p-2.5 rounded-xl cursor-pointer bg-slate-100 hover:bg-[#00BCE4]/10 text-slate-600 hover:text-[#00BCE4] transition-colors"
                    title="Batafsil ko'rish"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handleConfirm(order.id)}
                    className="p-2.5 rounded-xl cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="Tasdiqlash"
                  >
                    <MdCheck size={20} />
                  </button>

                  <button
                    onClick={() => handleCancel(order.id)}
                    className="p-2.5 cursor-pointer rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Bekor qilish"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== MODAL ===================== */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="px-8 py-6   flex justify-between items-center bg-gradient-to-r from-[#00BCE4]/5 to-white">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Buyurtma Tafsilotlari
                </h2>
                <p className="text-sm text-slate-500 mt-1">{selectedOrder.masterName} • {selectedOrder.date}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-3 rounded-2xl cursor-pointer hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 grid md:grid-cols-2 gap-10">
              {/* Chap taraf — rasmlar + status/sana */}
              <div className="space-y-6">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 relative">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                      prevEl: '.prev-btn',
                      nextEl: '.next-btn',
                    }}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                  >
                    {selectedOrder.images.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <img
                          src={img}
                          alt={`Rasm ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button className="prev-btn absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-[#00BCE4]">
                    <ChevronLeft size={24} strokeWidth={3} />
                  </button>
                  <button className="next-btn absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full   cursor-pointer flex items-center justify-center text-[#00BCE4]">
                    <ChevronRight size={24} strokeWidth={3} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Status</p>
                    <span className={`font-bold ${selectedOrder.status === 'tasdiqlandi' ? 'text-emerald-600' :
                      selectedOrder.status === 'kutilmoqda' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Sana</p>
                    <p className="font-bold text-slate-700">{selectedOrder.date}</p>
                  </div>
                </div>
              </div>

              {/* O'ng taraf — matn + telefonlar */}
              <div className="flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3">Tavsif</h3>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {selectedOrder.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3">Aloqa</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#00BCE4]/5 border border-[#00BCE4]/20">
                        <div className="w-10 h-10 rounded-xl bg-[#00BCE4] text-white flex items-center justify-center">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Asosiy raqam</p>
                          <p className="font-bold text-[#00BCE4]">{selectedOrder.phone1}</p>
                        </div>
                      </div>

                      {selectedOrder.phone2 && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Qo‘shimcha</p>
                            <p className="font-bold text-slate-700">{selectedOrder.phone2}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button className="mt-8 w-full py-4 bg-[#00BCE4] text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-[#00BCE4]/30 transition-all">
                  Mijoz bilan bog‘lanish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UstlarBuyurtmasi;