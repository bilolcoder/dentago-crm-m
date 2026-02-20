import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Megaphone, Users } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";

const allCategories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar',   label: 'Elonlar',   Icon: Megaphone,  path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar',   label: 'Ustalar',   Icon: Users,      path: '/ustalar' },
];

const StoreCategories = () => {
  const location = useLocation();

  const userRole = localStorage.getItem("userRole") || ""; // null bo'lmasligi uchun

  // "texniklar" faqat doctor yoki admin uchun ko'rinadi
  const categories = allCategories.filter(cat => {
    if (cat.id === "texniklar") {
      return userRole === "doctor", "admin";
    }
    return true;
  });

  return (
    <section className="pb-10 md:pb-12 mx-auto max-w-7xl">
      <div
        className={`
          grid gap-4 md:gap-6 lg:gap-8
          grid-cols-2 sm:grid-cols-3
          ${categories.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-' + categories.length}
        `}
      >
        {categories.map(({ id, label, Icon, path }) => {
          const isSelected = location.pathname.toLowerCase() === path.toLowerCase();

          return (
            <Link
              key={id}
              to={path}
              className="flex flex-col items-center gap-2 sm:gap-3 no-underline transition-transform hover:scale-105"
            >
              <div
                className={`
                  w-16 h-16 sm:w-20 sm:h-20
                  rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${isSelected
                    ? 'bg-[#00BCE4] border-[#00BCE4] text-white shadow-md'
                    : 'bg-white border-[#00BCE4]/60 text-[#00BCE4] hover:border-[#00BCE4] hover:shadow-sm'}
                `}
              >
                <Icon className="text-2xl sm:text-3xl" />
              </div>
              <span
                className={`
                  text-xs sm:text-sm md:text-base font-semibold text-center
                  ${isSelected ? 'text-[#00BCE4]' : 'text-gray-700'}
                `}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default StoreCategories;
