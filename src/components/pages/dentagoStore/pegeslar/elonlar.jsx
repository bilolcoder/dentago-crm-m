import React, { useState, useEffect } from "react";
import { Search, Bell, Megaphone, Users, Heart, Home, ShoppingBag, User, ArrowLeft } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

// Rasmlar
import Chair from "../../../../assets/elon.png";
import Logo from "../../../../assets/logo.png";

const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
];

const ads = [
  {
    id: 1,
    name: "Max Piezo 7+ Ultravush skaleri",
    price: "2 500 000",
    status: "b/u",
    img: "https://i.ibb.co/prz4dbJ4/images.jpg",
  },
  {
    id: 2,
    name: "Endomotor T-Fine II Pro Bru...",
    price: "1 800 000",
    status: "yangi",
    img: "https://i.ibb.co/mFCVPgvP/download.jpg",
  }
];

function Elonlar() {
  const [activeTab, setActiveTab] = useState("elonlar");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Sotmoqchimisiz? Muammo emas!",
      description: "Mahsulotingizni e’lonlar bo’limiga joylang va tezda soting!"
    },
    {
      title: "Sotmoqchimisiz? Muammo emas!",
      description: "Mahsulotingizni e’lonlar bo’limiga joylang va tezda soting!"
    },
  ];
  const notification = () => {
    navigate('/notification');
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* Bosh sahifadagidek Max-width Konteyner */}
      <div className="max-w-7xl mx-auto">

        {/* 1. HEADER (Bosh sahifa bilan bir xil dizayn) */}
        <header className="p-4 sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none text-[16px]"
              />
            </div>
            <button className="p-3 bg-gray-100 rounded-xl cursor-pointer">
              <Bell size={24} className="text-gray-600"
              onClick={notification}/>
            </button>
          </div>
        </header>

        {/* 2. HERO BANNER (Bosh sahifa kabi keng va baland) */}
        <section className="px-4 md:px-8 py-6">
          <div className="relative group overflow-hidden rounded-[30px] shadow-sm">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 bg-[#76F6D7] p-8 md:p-16 h-[300px] md:h-[400px] flex items-center relative">
                  <div className="z-10 w-full md:w-1/2">
                    <img src={Logo} alt="dentaGo" className="w-32 md:w-48 mb-6 translate-x-[-10px]" />
                    <h2 className="text-white  text-2xl md:text-4xl leading-tight mb-4 whitespace-pre-line">
                      {slide.title}
                    </h2>
                    <p className="text-white text-sm md:text-lg opacity-90 max-w-md">
                      {slide.description}
                    </p>
                  </div>
                  <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                    <img
                      src={Chair}
                      alt="Chair"
                      className="h-48 md:h-[320px] object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'w-10 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
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

        {/* 4. TITLE */}
        <div className="px-4 md:px-8 mb-6">
          <h1 className="font-bold text-[22px] md:text-[28px] text-gray-800">Barcha e'lonlar</h1>
        </div>

        {/* 5. ADS LIST (Bosh sahifa kabi sifatli Card dizayni) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-[30px] p-4 shadow-sm border border-gray-100 flex gap-5 relative group hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/mahsulot/${ad.id}`)}
            >
              {/* Rasm qismi */}
              <div className="w-40 h-32 md:w-48 md:h-40 bg-gray-50 rounded-[25px] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={ad.img} alt={ad.name} className="object-contain h-full w-full p-3 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Ma'lumot qismi */}
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <h3 className="text-gray-800 font-bold text-[16px] md:text-[19px] leading-tight mb-1 pr-8 line-clamp-2">
                    {ad.name}
                  </h3>
                  <span className="bg-gray-100 text-gray-500 text-[12px] px-3 py-1 rounded-full font-medium">
                    {ad.status}
                  </span>
                </div>

                <div className="mt-auto">
                  <p className="text-[#00C2FF] font-extrabold text-[20px] md:text-[24px]">
                    {ad.price} <span className="text-sm font-semibold text-gray-500 uppercase">uzs</span>
                  </p>
                </div>
              </div>

              {/* Sevimlilar tugmasi */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute right-5 top-5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Heart size={24} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400">
          <Home size={24} />
          <span className="text-[10px] font-medium">Bosh sahifa</span>
        </Link>
        <Link to="/savat" className="flex flex-col items-center gap-1 text-gray-400">
          <ShoppingBag size={24} />
          <span className="text-[10px] font-medium">Savatcha</span>
        </Link>
        <Link to="/qidiruv" className="flex flex-col items-center gap-1 text-gray-400">
          <Search size={24} />
          <span className="text-[10px] font-medium">Qidiruv</span>
        </Link>
        <Link to="/profil" className="flex flex-col items-center gap-1 text-gray-400">
          <User size={24} />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}

export default Elonlar;
