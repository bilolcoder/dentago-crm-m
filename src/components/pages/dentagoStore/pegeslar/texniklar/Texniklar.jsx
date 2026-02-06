import React, { useState } from "react";
// import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Chair from "../../../../../assets/usta.png";
import Logo from "../../../../../assets/logo.png";
import DoctorCard from "./DoctorCard";
import { Search } from "lucide-react";
import StoreBanner from "../../components/StoreBanner";
import StoreCategories from "../../components/StoreCategories";



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

];
// Categories removed
const DentoGoApp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // activeTab and currentSlide state removed

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

  // Auto-play useEffect removed (handled in StoreBanner)

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white">
      <div className="">
        {/* HEADER */}
        <header className="sticky top-0 bg-white z-30">
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
            {/* <button className="p-3 bg-gray-100 rounded-xl">
              <Bell />
            </button> */}
          </div>
        </header>


        {/* HERO BANNER – Barcha sahifalarda bir xil dizayn uslubi */}
        <StoreBanner slides={slides} />


        {/* CATEGORIES */}
        <StoreCategories />

        {/* DOCTORS LIST (BU YERDA DOCTORCARD CHIQISHI KERAK) */}
        <section className="mt-6 pb-10">
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
