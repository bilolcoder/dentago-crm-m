import React, { useState, useEffect } from "react";
import { Search, Bell, Megaphone, Users, Heart, Home, ShoppingBag, User, ArrowLeft } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

// Rasmlar
import Chair from "../../../../assets/elon.png";
import Logo from "../../../../assets/logo.png";
import StoreBanner from "../components/StoreBanner";
import StoreCategories from "../components/StoreCategories";

// Categories array removed - used in StoreCategories component

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
  // activeTab state removed
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Sotmoqchimisiz? Muammo emas!",
      description: "Mahsulotingizni e’lonlar bo’limiga joylang va tezda soting!",
      img: Chair
    },
    {
      title: "Sotmoqchimisiz? Muammo emas!",
      description: "Mahsulotingizni e’lonlar bo’limiga joylang va tezda soting!",
      img: Chair
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
      <div className="">

        {/* 1. HEADER (Bosh sahifa bilan bir xil dizayn) */}
        <header className="sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none text-[16px]"
              />
            </div>
            {/* <button className="p-3 bg-gray-100 rounded-xl cursor-pointer">
              <Bell size={24} className="text-gray-600"
              onClick={notification}/>
            </button> */}
          </div>
        </header>

        {/* 2. HERO BANNER – Bosh sahifadagi bilan bir xil dizayn */}

        {/* 2. HERO BANNER – Bosh sahifadagi bilan bir xil dizayn */}
        <StoreBanner slides={slides} />

        {/* CATEGORIES */}

        {/* CATEGORIES */}
        <StoreCategories />

        {/* 4. TITLE */}
        <div className="mb-6">
          <h1 className="font-bold text-[22px] md:text-[28px] text-gray-800">Barcha e'lonlar</h1>
        </div>

        {/* 5. ADS LIST (Bosh sahifa kabi sifatli Card dizayni) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="absolute cursor-pointer right-5 top-5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Heart size={24} />
              </button>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}

export default Elonlar;
