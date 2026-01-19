import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { Link } from "react-router-dom";

function DoctorCard({ id, img, name, job, rating, distance, price, patients, exp, service }) {

  // Rasm yuklanmagan holat 
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "";
  };

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">

      {/* Image */}
      <div className="relative w-full h-[300px] rounded-[20px] overflow-hidden">
        <img
          src={img}
          className="w-full h-full object-cover"
          alt={`${name} - ${job}`}
          onError={handleImageError}
        />

        <div className="absolute bottom-0 left-0 w-full h-[55px] bg-gradient-to-t from-[#00A7D7] to-transparent opacity-80"></div>

        {/* Rating + distance */}
        {/* <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white text-[12px]">
          <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
            ⭐️ {rating}
          </span>
          <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
            <HiOutlineLocationMarker /> {distance}
          </span>
        </div> */}

        {/* 24/7 badge */}
        {service && (
          <div className="absolute top-2 right-2 bg-[#4cd964] text-white text-[10px] px-2 py-1 rounded-xl">
            24/7
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p className="font-semibold text-[14px] leading-4 line-clamp-2 h-10">{name}</p>
        <p className="text-gray-500 text-[12px] mt-1">{job}</p>

        <div className="flex items-center justify-between mt-3 text-[12px] text-gray-600">
          <div>
            {/* <span className="block">{patients} ta bemor</span> */}
            <span className="block">{exp} yil tajriba</span>
          </div>
        </div>

        <p className="font-semibold text-[13px] mt-3 text-blue-600">
          {price}
        </p>

        <Link to={`/shifokorlar/${id}`}>
          <button
            className="w-full bg-[#00C1F3] text-white py-2.5 rounded-full mt-2 text-[14px] hover:bg-[#00a8d9] transition-colors duration-300"
          >
            Profilni ko'rish
          </button>
        </Link>
      </div>
    </div>
  );
}

export default DoctorCard;
