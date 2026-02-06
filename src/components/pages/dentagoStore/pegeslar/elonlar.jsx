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


        <StoreBanner slides={slides} />
        <StoreCategories />

              <h1 className="font-bold text-center text-[22px] md:text-[28px] text-[#00BCE4]">Tez kunda...</h1>
      </div>
    </div>
  );
}

export default Elonlar;
