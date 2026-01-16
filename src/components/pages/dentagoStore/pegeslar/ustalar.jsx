import React, { useState, useEffect } from "react";
import { Search, Bell, Megaphone, Users, Home, ShoppingBag, User, Plus, X } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// Rasmlar
import Chair from "../../../../assets/tex.png";
import Logo from "../../../../assets/logo.png";

const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
];

function Ustalar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ustalar");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // 1. Sahifaga o'tish funksiyasi
  const notification = () => {
    navigate('/notification');
  };

  // 2. Telefon raqamni formatlash (Siz aytgan +998-XX-XXX-XX-XX holati)
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

  // 3. Rasm tanlash
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

  // 4. Rasmni o'chirish
  const removeImage = (index) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // 5. Formani yuborish
  const onSubmit = (data) => {
    const finalData = { ...data, images: selectedImages.map(img => img.file) };
    console.log("Yuborilayotgan ma'lumotlar:", finalData);
    alert("Murojaatingiz qabul qilindi!");
  };

  const slides = [
    {
      title: "Muammo haqida xabar bering",
      description: "Uskunangiz nosoz bo’lsa uni tuzatishga yordam beramiz",
    },
    {
      title: "Muammo haqida xabar bering",
      description: "Uskunangiz nosoz bo’lsa uni tuzatishga yordam beramiz",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="p-4 sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Qidiruv..." className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none" />
            </div>
            <button onClick={notification} className="p-3 bg-gray-100 rounded-xl cursor-pointer">
              <Bell size={24} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* HERO BANNER */}
        <section className="px-4 md:px-8 py-6">
          <div className="relative group overflow-hidden rounded-[30px] shadow-sm">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 bg-gradient-to-r from-[#c4f5e9] to-[#66bba6] p-8 md:p-16 h-[250px] md:h-[400px] flex items-center relative text-white">
                  <div className="z-10 w-full md:w-1/2">
                    <img src={Logo} alt="dentaGo" className="w-24 md:w-48 mb-4" />
                    <h2 className="font-bold text-[#009571] text-xl md:text-4xl leading-tight mb-2 whitespace-pre-line">{slide.title}</h2>
                    <p className="text-xs md:text-lg text-gray-600 opacity-90 max-w-md">{slide.description}</p>
                  </div>
                  <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/3 flex justify-end">
                    <img src={Chair} alt="Chair" className="h-32 md:h-[320px] object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="px-4 md:px-8 pb-8">
          <div className="grid grid-cols-4 gap-4">
            {categories.map(({ id, label, Icon, path }) => (
              <Link key={id} to={path} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-2 text-center">
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex border-2 items-center justify-center transition-all
                  ${activeTab === id ? 'bg-[#00C2FF] border-[#00C2FF] text-white shadow-md' : 'bg-white border-[#00C2FF] text-[#00C2FF]'}`}>
                  <Icon className="text-xl md:text-3xl" />
                </div>
                <span className={`text-[10px] md:text-sm font-semibold ${activeTab === id ? 'text-[#00C2FF]' : 'text-gray-500'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FORM SECTION */}
        <div className="px-4 md:px-8 mb-6">
          <h1 className="font-bold text-[20px] md:text-[28px] text-gray-800 mb-6">Muammo haqida murojaat qiling</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Muammo haqida batafsil yozing <span className="text-red-500">*</span></label>
              <textarea {...register("muammo", { required: true })} placeholder="Kiriting" rows="4" className={`w-full p-4 bg-gray-50 border ${errors.muammo ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none resize-none`} />
            </div>

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

            {/* TEL RAQAM */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold text-sm">Tel. raqamingiz <span className="text-red-500">*</span></label>
              <input
                {...register("telRaqam", { required: "Telefon raqam kiritish shart", minLength: { value: 17, message: "Raqam to'liq emas" } })}
                type="tel"
                placeholder="+998-90-123-45-67"
                onChange={(e) => { e.target.value = formatPhoneNumber(e.target.value); }}
                className={`w-full p-4 bg-gray-50 border ${errors.telRaqam ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`}
              />
              {errors.telRaqam && <span className="text-red-500 text-xs">{errors.telRaqam.message}</span>}
            </div>

            {/* MANZIL */}
            <div className="space-y-2 pb-6">
              <label className="block text-gray-700 font-semibold text-sm">Manzilingiz</label>
              <input {...register("manzil")} placeholder="Manzilingizni kiriting" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#00C2FF]" />
            </div>

            <button type="submit" className="w-full bg-[#00C2FF] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">
              Yuborish
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default Ustalar;
