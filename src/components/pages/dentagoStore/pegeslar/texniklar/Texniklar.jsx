import React, { useState, useEffect } from "react";
import axios from "axios";
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Chair from "../../../../../assets/usta.png";
import DoctorCard from "./DoctorCard";
import { Search, Loader2 } from "lucide-react";
import StoreBanner from "../../components/StoreBanner";
import StoreCategories from "../../components/StoreCategories";

const DentoGoApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [technicians, setTechnicians] = useState([]); // API-dan keladigan ma'lumotlar
  const [isLoading, setIsLoading] = useState(true);

  // API-dan ma'lumotlarni yuklash
  useEffect(() => {
    const fetchTechs = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("https://app.dentago.uz/api/public/technicians");
        const data = res.data?.data || res.data || [];
        setTechnicians(data);
      } catch (error) {
        console.error("Texniklarni yuklashda xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechs();
  }, []);

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

  // Qidiruv funksiyasi (ism bo'yicha)
  const filteredTechnicians = technicians.filter((tech) =>
    tech.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white px-4"> {/* Padding qo'shildi chekkalar yopishib qolmasligi uchun */}
      <div>
        {/* HEADER */}
        <header className="sticky top-0 bg-white z-30 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Texnik qidirish..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00C1F3] transition-all"
              />
            </div>
          </div>
        </header>

        {/* HERO BANNER */}
        <StoreBanner slides={slides} />

        {/* CATEGORIES */}
        <StoreCategories />

        {/* TECHNICIANS LIST */}
        <section className="mt-8 pb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Hozirda mavjud mutaxassislar
            </h2>
            <span className="text-sm text-gray-500">{filteredTechnicians.length} ta</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#00C1F3] mb-2" size={32} />
              <p className="text-gray-500">Mutaxassislar yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTechnicians.length > 0 ? (
                filteredTechnicians.map((tech) => (
                  <DoctorCard
                    key={tech._id}
                    id={tech._id}
                    img={tech.avatar}
                    name={tech.fullName}
                    exp={tech.experienceYears}
                    description={tech.description}
                    // Agar Card ichida boshqa proplar kerak bo'lsa:
                    job="Tish-texnik"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-gray-50 rounded-3xl">
                  <p className="text-gray-500">
                    "{searchTerm}" bo'yicha mutaxassis topilmadi
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DentoGoApp;
