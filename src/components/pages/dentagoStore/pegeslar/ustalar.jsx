import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// Rasmlar
import Chair from "../../../../assets/tex.png";
import Logo from "../../../../assets/logo.png";
import StoreBanner from "../components/StoreBanner";
import StoreCategories from "../components/StoreCategories";

// Categories removed

function Ustalar() {
  const navigate = useNavigate();
  // activeTab and currentSlide removed
  const [selectedImages, setSelectedImages] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Sahifaga o'tish funksiyasi
  const notification = () => {
    navigate('/notification');
  };

  // Telefon raqamni formatlash (+998-XX-XXX-XX-XX)
  const formatPhoneNumber = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 0 && !digits.startsWith("998")) {
      digits = "998" + digits;
    }
    digits = digits.substring(0, 12);

    let formatted = "";
    if (digits.length > 0) formatted += "+" + digits.substring(0, 3);
    if (digits.length > 3) formatted += "-" + digits.substring(3, 5);
    if (digits.length > 5) formatted += "-" + digits.substring(5, 8);
    if (digits.length > 8) formatted += "-" + digits.substring(8, 10);
    if (digits.length > 10) formatted += "-" + digits.substring(10, 12);

    return formatted;
  };

  // Rasm tanlash
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file: file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedImages((prevImages) => [...prevImages, ...filesArray].slice(0, 3));
    }
    e.target.value = "";
  };

  // Rasmni o'chirish
  const removeImage = (index) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Formani yuborish
  const onSubmit = (data) => {
    const finalData = { ...data, images: selectedImages.map(img => img.file) };
    console.log("Yuborilayotgan ma'lumotlar:", finalData);
    alert("Murojaatingiz qabul qilindi!");
    reset({
      muammo: "",
      telRaqam: "",
      telRaqam2: ""
    });
    setSelectedImages([]);
  };

  const slides = [
    {
      title: "Ustalar sizning yordamingizda",
      description: "Uskuna nosoz bo'lsa, tez va ishonchli usta toping!",
      img: Chair,
    },
    {
      title: "Tez ta'mirlash xizmati",
      description: "Butun O'zbekiston bo'ylab tajribali ustalar bilan bog'laning",
      img: Chair,
    },
  ];

  /* useEffect for slider removed */

  return (
    <div className="bg-white pb-24 font-sans">
      <div className="">
        {/* HEADER */}
        <header className="sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Qidiruv..." className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none" />
            </div>
            {/* <button onClick={notification} className="p-3 bg-gray-100 rounded-xl cursor-pointer">
              <Bell size={24} className="text-gray-600" />
            </button> */}
          </div>
        </header>


        {/* HERO BANNER – barcha sahifalarda bir xil dizayn */}
        <StoreBanner slides={slides} />


        {/* CATEGORIES */}
        <StoreCategories />

        {/* FORM SECTION */}
        <div className="mb-6">
          <h1 className="font-bold text-[20px] md:text-[28px] text-gray-800 mb-6">Muammo haqida murojaat qiling</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Uskuna nomi <span className="text-red-500">*</span></label>
              <input {...register("uskunaNomi", { required: true })} placeholder="Kiriting" className={`w-full p-4 bg-gray-50 border ${errors.uskunaNomi ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`} />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Markasi <span className="text-red-500">*</span></label>
              <input {...register("markasi", { required: true })} placeholder="Kiriting" className={`w-full p-4 bg-gray-50 border ${errors.markasi ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`} />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Ishlab chiqaruvchi</label>
              <input {...register("ishlabChiqaruvchi")} placeholder="Kiriting" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" />
            </div> */}
            {/* RASM YUKLASH */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Muammoga doir rasmlar bo'lsa yuklang</label>
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 border border-gray-100 rounded-2xl overflow-hidden group">
                    <img src={img.preview} alt="upload" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {selectedImages.length < 3 && (
                  <label className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-100">
                    <Plus className="text-gray-400" size={32} />
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Muammo haqida batafsil yozing <span className="text-red-500">*</span></label>
              <textarea {...register("muammo", { required: true })} placeholder="Kiriting" rows="4" className={`w-full p-4 bg-gray-50 border ${errors.muammo ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none resize-none`} />
            </div>


            {/* TEL RAQAM */}
            <div className="space-y-2 grid grid-cols-2 gap-4">
              <div className="">
                <label className="block text-gray-700 font-semibold text-sm">Tel. raqamingiz <span className="text-red-500">*</span></label>
                <input
                  {...register("telRaqam", { required: "Telefon raqam kiritish shart", minLength: { value: 17, message: "Raqam to'liq emas" } })}
                  type="tel"
                  placeholder="+998-90-123-45-67"
                  onChange={(e) => { e.target.value = formatPhoneNumber(e.target.value); }}
                  className={`w-full p-4 bg-gray-50 border ${errors.telRaqam ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`}
                />
              </div>

              <div className="">
                {/* no2  */}
                <label className="block text-gray-700 font-semibold text-sm">Tel. raqamingiz 2<span className="text-red-500">*</span></label>
                <input
                  {...register("telRaqam2", { required: "Telefon raqam kiritish shart", minLength: { value: 17, message: "Raqam to'liq emas" } })}
                  type="tel"
                  placeholder="+998-90-123-45-67"
                  onChange={(e) => { e.target.value = formatPhoneNumber(e.target.value); }}
                  className={`w-full p-4 bg-gray-50 border ${errors.telRaqam2 ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`}
                />
              </div>

              {errors.telRaqam && <span className="text-red-500 text-xs">{errors.telRaqam.message}</span>}
              {errors.telRaqam2 && <span className="text-red-500 text-xs">{errors.telRaqam2.message}</span>}
            </div>

            {/* MANZIL */}
            {/* <div className="space-y-2 pb-6">
              <label className="block text-gray-700 font-semibold text-sm">Manzilingiz</label>
              <input {...register("manzil")} placeholder="Manzilingizni kiriting" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#00C2FF]" />
            </div> */}

            <button type="submit" className="w-full cursor-pointer bg-[#00C2FF] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">
              Yuborish
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Ustalar;