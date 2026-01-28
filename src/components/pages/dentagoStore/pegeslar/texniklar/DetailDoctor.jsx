import React, { useState } from 'react';
import { Settings, FlaskConical, Trash2, MoreHorizontal, Search, Bell, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import MalumotBerish from './MalumotBerish';

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
  const [selectedXizmatId, setSelectedXizmatId] = useState(null);
  const navigate = useNavigate();
  const handleBackMinus = () => {
    navigate(-1);
  }
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: "Eng yaxshi uskunalarni\nbizdan topasiz", description: "Bizning mahsulotlar sifatli, ishonchli va qulay narxlarda!" },
    { title: "Professional stomatologiya\nasboblari", description: "Yuqori sifatli texnika va ishonchli xizmat." },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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



  return (
    <div className="w-full bg-white min-h-screen flex flex-col px-4 md:px-8">

      {/* HEADER */}
      <header className="py-4 top-0 bg-white w-full">
        <div className="flex items-center gap-4">
          <button onClick={handleBackMinus} className='p-3 text-gray-400 bg-gray-100 cursor-pointer rounded-2xl text-2xl'><IoMdArrowRoundBack /></button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Shifokor qidirish..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          {/* <button className="p-3 bg-gray-100 rounded-xl">
            <Bell />
          </button> */}
        </div>
      </header>

      {/* Hero Banner */}
        <section className="px-4 md:px-8 py-6">
          <div className="relative group">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-[300px] md:h-[450px] p-8 md:p-16 flex items-center relative">
                      <div className="w-full md:w-1/2 z-10">
                        <img src={Logo} className="w-52 transform max-sm:w-32 translate-x-[-12px]" alt="Logo" />
                        <h2 className="text-2xl md:text-5xl text-white mb-4 leading-tight whitespace-pre-line font-bold">{slide.title}</h2>
                        <p className="text-sm md:text-lg text-cyan-50 mb-8 max-w-md">{slide.description}</p>
                      </div>
                      <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                        <img src={Chair} alt="Dental Chair" className="h-48 md:h-[350px] object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"><ArrowLeft className="text-white" /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 rotate-180"><ArrowLeft className="text-white" /></button>
          </div>
        </section>

      <div className="max-w-7xl mx-auto w-full flex-grow">
        {/* XIZMATLAR BO'LIMI */}
        <section className="mb-12 mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] mb-6">Xizmatlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {xizmatlar.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedXizmatId(item.id)}
                className={`${item.bgColor} rounded-[32px] p-5 md:p-8 h-44 md:h-60 relative flex flex-col justify-start transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer border-4 ${selectedXizmatId === item.id ? 'border-cyan-400' : 'border-transparent'}`}
              >
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
            ))}
          </div>
        </section>

        {selectedXizmatId && (
          <section className="mt-12">
            <MalumotBerish isEmbedded={true} />
          </section>
        )}

      
      </div>

      {/* BUYURTMA BERISH TUGMASI */}
      {/* <div className="pb-10 mt-4 flex justify-center max-w-7xl mx-auto w-full">
        <button className="w-full md:w-auto md:min-w-[400px] bg-[#00BCD4] hover:bg-[#00ACC1] text-white text-lg md:text-xl font-bold py-4 md:py-5 px-10 rounded-2xl md:rounded-3xl shadow-lg shadow-cyan-100 transition-all active:scale-95">
          Buyurtma berish
        </button>
      </div> */}

    </div>
  );
}

export default DetailDoctors;
