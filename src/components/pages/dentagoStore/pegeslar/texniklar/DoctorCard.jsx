import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { Link } from "react-router-dom";
import logo from "../../../../../assets/logo.png";

function DoctorCard({
  id,
  img,
  name,
  job,
  rating,
  distance,
  price,
  patients,
  exp,
  service,
}) {
  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md">

      {/* Image */}
      <div className="relative w-full h-[120px] overflow-hidden">
        <img src={img} className="w-full h-full object-cover" alt={name} />

        {/* Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-[55px] bg-gradient-to-t from-[#00A7D7] to-transparent opacity-80" />

        {/* Rating + distance */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white text-[12px]">
          <span className="flex items-center gap-1">⭐ {rating}</span>
          <span className="flex items-center gap-1">
            <HiOutlineLocationMarker /> {distance}
          </span>
        </div>

        {/* 24/7 */}
        {service && (
          <div className="absolute bottom-2 right-2 bg-[#4cd964] text-white text-[10px] px-2 py-1 rounded-xl">
            24/7
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-2">
        <p className="font-semibold text-[14px] leading-4">{name}</p>
        <p className="text-gray-500 text-[12px]">{job}</p>

        <div className="flex items-center gap-4 mt-1 text-[12px] text-gray-600 relative">
          <span>{patients} ta bemor</span>
          <span>{exp}+ tajriba</span>

          <img
            className="w-[65px] absolute right-0 -top-6 rounded-[12px]"
            src={logo}
            alt="logo"
          />
        </div>

        <p className="font-semibold text-[13px] mt-1">
          {price} so‘m o‘rtacha narx
        </p>

        <Link to={`/shifokorlar`}>
          <button className="w-full bg-[#00C1F3] text-white py-2 rounded-full mt-2 text-[14px]">
            Profilni ko‘rish
          </button>
        </Link>
      </div>
    </div>
  );
}

export default DoctorCard;
