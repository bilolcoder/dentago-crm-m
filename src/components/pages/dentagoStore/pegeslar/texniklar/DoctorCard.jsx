import React from "react";
import { Link } from "react-router-dom";

function TechnicianCard({ id, img, name, exp, description }) {
  // Rasm bo'lmasa yoki xato yuklansa, default rasm qo'yish
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300x300?text=Rasm+yo'q";
  };

  // Textni 20 ta harfdan keyin qisqartirish
  const truncateText = (text, limit = 20) => {
    if (!text) return "Tavsif mavjud emas";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">

      {/* Image Section */}
      <div className="relative w-full h-[250px] overflow-hidden">
        <img
          src={img || "https://via.placeholder.com/300x300?text=No+Image"}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          alt={name}
          onError={handleImageError}
        />
        {/* Pastki qismidagi gradient */}
        <div className="absolute bottom-0 left-0 w-full h-[40px] bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Info Section */}
      <div className="px-4 py-4">
        <h3 className="font-bold text-[16px] text-gray-800 truncate" title={name}>
          {name || "Ism Familiya"}
        </h3>

        <p className="text-[#00BCE4] font-medium text-[13px] mt-1">
          {exp || 0} yil tajriba
        </p>

        <p className="text-gray-500 text-[12px] mt-2 h-8 leading-4 italic">
          {truncateText(description, 20)}
        </p>

        <Link to={`/technician/${id}`}>
          <button
            className="w-full bg-[#00BCE4] text-white py-2.5 rounded-xl mt-4 text-[14px] font-semibold hover:bg-[#00a8d9] transition-all duration-300 shadow-sm active:scale-95"
          >
            Profilni ko'rish
          </button>
        </Link>
      </div>
    </div>
  );
}

export default TechnicianCard;
