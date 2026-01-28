import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Chair from "../../../../../assets/usta.png";
import Logo from "../../../../../assets/logo.png";
import DoctorCard from "./DoctorCard"; // Shu fayl mavjudligini tekshiring
import { Search, Users, Megaphone, Bell, ArrowLeft } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";



const doctors = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1606813907291-d86efa6c94db",
    name: "Dr. Aliyev",
    job: "Tish-texnik",
    rating: 4.8,
    distance: "1.2 km",
    price: "150 000",
    patients: 1200,
    exp: 8,
    service: true,
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
    name: "Dr. Karimova",
    job: "Tish-texnik",
    rating: 4.6,
    distance: "2.5 km",
    price: "180 000",
    patients: 980,
    exp: 6,
    service: false,
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5",
    name: "Dr. Usmonov",
    job: "Tish-texnik",
    rating: 4.7,
    distance: "0.8 km",
    price: "140 000",
    patients: 1500,
    exp: 10,
    service: true,
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
    name: "Dr. Saidova",
    job: "Tish-texnik",
    rating: 4.9,
    distance: "3.1 km",
    price: "160 000",
    patients: 2000,
    exp: 9,
    service: true,
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1550831107-1553da8c8464",
    name: "Dr. Rasulov",
    job: "Tish-texnik",
    rating: 4.5,
    distance: "4.0 km",
    price: "300 000",
    patients: 700,
    exp: 7,
    service: false,
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
    name: "Dr. Nasirova",
    job: "Tish-texnik",
    rating: 4.6,
    distance: "2.0 km",
    price: "170 000",
    patients: 1100,
    exp: 5,
    service: false,
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    name: "Dr. Xolmatov",
    job: "Tish-texnik",
    rating: 4.9,
    distance: "1.5 km",
    price: "250 000",
    patients: 1600,
    exp: 11,
    service: true,
  },
];
const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
];
function DentoGoApp() {
  const [activeTab, setActiveTab] = useState("texniklar");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Tish-texniklar sizning\nxizmatingizda",
      description: "Sifatli va qulay tish yasashda bizga ishonsangiz bo’ladi!",
      img: Chair,
    },
    {
      title: "Professional texniklar\nva aniq natijalar",
      description: "Tajribali mutaxassislar bilan tez va sifatli xizmat!",
      img: Chair,
    },
  ];

  // Avtomatik slayder (5 sekundda o'tadi)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="p-4 sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Shifokor qidirish..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none"
              />
            </div>
            <button className="p-3 bg-gray-100 rounded-xl">
              <Bell />
            </button>
          </div>
        </header>

       {/* HERO BANNER – Barcha sahifalarda bir xil dizayn uslubi */}
<section className="px-4 md:px-8 py-6">
  <div className="relative group">
    <div className="overflow-hidden rounded-3xl shadow-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-[300px] md:h-[450px] p-8 md:p-16 flex items-center relative overflow-hidden">
              {/* Chap taraf – logo + text */}
              <div className="w-full md:w-1/2 z-10">
                <img
                  src={Logo}
                  className="w-52 transform max-sm:w-32 translate-x-[-12px] mb-4 md:mb-6"
                  alt="Logo"
                />
                <h2 className="text-2xl md:text-5xl text-white mb-4 leading-tight whitespace-pre-line font-bold max-h-[140px] md:max-h-[200px] overflow-hidden">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg text-cyan-50 mb-8 max-w-md line-clamp-3 md:line-clamp-none">
                  {slide.description}
                </p>
              </div>

              {/* O'ng taraf – rasm (tish texnikasi bilan ishlashga mos) */}
              <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                <img
                  src={slide.img || Chair}
                  alt={slide.title}
                  className="h-48 md:h-[350px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = Chair; }} // agar rasm yuklanmasa fallback
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Oldinga / Orqaga tugmalar */}
    <button
      onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <ArrowLeft className="text-white" size={24} />
    </button>
    <button
      onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity rotate-180"
    >
      <ArrowLeft className="text-white" size={24} />
    </button>

 
  </div>
</section>

         {/* 3. CATEGORIES (Grid ko'rinishi) */}
         <section className="px-4 md:px-8 pb-12">
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            {categories.map(({ id, label, Icon, path }) => (
              <Link key={id} to={path} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex border-2 items-center justify-center transition-all
                  ${activeTab === id ? 'bg-[#00C2FF] border-[#00C2FF] text-white shadow-lg' : 'bg-white border-[#00C2FF] text-[#00C2FF]'}`}>
                  <Icon className="text-2xl md:text-3xl" />
                </div>
                <span className={`text-xs md:text-lg font-semibold ${activeTab === id ? 'text-[#00C2FF]' : 'text-gray-600'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* DOCTORS LIST (BU YERDA DOCTORCARD CHIQISHI KERAK) */}
        <section className="px-4 mt-6 pb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Hozirda mavjud mutaxassislar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} {...doctor} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">
                Mutaxassislar topilmadi
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DentoGoApp;
