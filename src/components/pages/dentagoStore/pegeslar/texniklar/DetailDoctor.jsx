import React, { useState } from 'react';
import { Settings, FlaskConical, Trash2, MoreHorizontal, Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

// Swiper kutubxonasi komponentlari va modullari
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Swiper stillarini import qilish
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Chair from "../../../../../assets/chair.png";
import Logo from "../../../../../assets/logo.png";
import N1 from "../../../../../assets/dentures.webp";
import N2 from "../../../../../assets/braces.webp";
import N3 from "../../../../../assets/shiny-tooth.webp";
import N4 from "../../../../../assets/dental-drill.webp";

function DetailDoctors() {
  const [searchTerm, setSearchTerm] = useState("");

  const slides = [
    {
      title: "Eng yaxshi uskunalarni\nbizdan topasiz",
      description: "Bizning mahsulotlar sifatli, ishonchli va qulay narxlarda!",
    },
    {
      title: "Professional stomatologiya\nasboblari",
      description: "Yuqori sifatli texnika va ishonchli xizmat.",
    },
  ];

  const xizmatlar = [
    {
      id: 1,
      title: "Sun'iy tish protezlari tayyorlash",
      bgColor: "bg-[#E3F2FD]",
      image: N1
    },
    {
      id: 2,
      title: "Breket tayyorlash",
      bgColor: "bg-[#E3F2FD]",
      image: N2
    },
    {
      id: 3,
      title: "Vinir va kappar tayyorlash",
      bgColor: "bg-[#E8F5E9]",
      image: N3
    },
    {
      id: 4,
      title: "Protezlarni ta'mirlash va qayta ishlash",
      bgColor: "bg-[#E3F2FD]",
      image: N4
    }
  ];

  const materiallar = [
    { id: 1, name: "Metall", icon: <Settings className="text-[#00BCD4] w-6 h-6" /> },
    { id: 2, name: "Keramika", icon: <FlaskConical className="text-[#00BCD4] w-6 h-6" /> },
    { id: 3, name: "Plastmassa", icon: <Trash2 className="text-[#00BCD4] w-6 h-6" /> },
    { id: 4, name: "Boshqa", icon: <MoreHorizontal className="text-[#00BCD4] w-6 h-6" /> },
  ];

  return (
    <div className="w-full bg-white min-h-screen flex flex-col px-4 md:px-8">

      {/* HEADER */}
      <header className="py-4 sticky top-0 bg-white z-30 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Shifokor qidirish..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button className="p-3 bg-gray-100 rounded-xl">
            <Bell />
          </button>
        </div>
      </header>

      {/* HERO BANNER - SWIPER IMPLEMENTATION */}
      <section className="py-6 max-w-7xl mx-auto w-full">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="rounded-[32px] overflow-hidden shadow-xl"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-[300px] md:h-[450px] p-8 md:p-16 flex items-center relative">
                <div className="w-full md:w-1/2 z-10">
                  <img src={Logo} className="w-40 md:w-52 mb-6 -ml-2" alt="Logo" />
                  <h2 className="text-2xl md:text-5xl font-extrabold text-white mb-4 leading-tight whitespace-pre-line">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-lg text-cyan-50 mb-8 max-w-md">
                    {slide.description}
                  </p>
                </div>

                <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                  <img
                    src={Chair}
                    alt="Dental Chair"
                    className="h-48 md:h-[380px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <div className="max-w-7xl mx-auto w-full flex-grow">
        {/* XIZMATLAR BO'LIMI */}
        <section className="mb-12 mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] mb-6">Xizmatlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {xizmatlar.map((item) => (
              <Link to="/malumot" key={item.id} className="block">
                <div className={`${item.bgColor} rounded-[32px] p-5 md:p-8 h-44 md:h-60 relative flex flex-col justify-start transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}>
                  <h3 className="text-[14px] md:text-xl font-bold text-[#2C3E50] leading-tight z-10 max-w-[85%]">
                    {item.title}
                  </h3>
                  <div className="absolute bottom-4 right-4 w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MATERIALLAR BO'LIMI */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] mb-6">Materiallar</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {materiallar.map((mat) => (
                <Link to="/malumot" key={mat.id} className="block">
              <div
                key={mat.id}
                className="bg-white rounded-2xl p-4 md:p-6 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 hover:border-cyan-200 transition-all cursor-pointer"
                >
                <div className="bg-[#F8F9FA] p-3 rounded-xl">
                  {mat.icon}
                </div>
                <span className="text-sm md:text-lg font-bold text-gray-700">{mat.name}</span>
              </div>
                  </Link>
            ))}
          </div>
        </section>
      </div>

      {/* BUYURTMA BERISH TUGMASI */}
      <div className="pb-10 mt-4 flex justify-center max-w-7xl mx-auto w-full">
        <button className="w-full md:w-auto md:min-w-[400px] bg-[#00BCD4] hover:bg-[#00ACC1] text-white text-lg md:text-xl font-bold py-4 md:py-5 px-10 rounded-2xl md:rounded-3xl shadow-lg shadow-cyan-100 transition-all active:scale-95">
          Buyurtma berish
        </button>
      </div>

    </div>
  );
}

export default DetailDoctors;
