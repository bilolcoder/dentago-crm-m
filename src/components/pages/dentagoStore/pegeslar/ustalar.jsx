import React, { useState } from "react";
import { Search, Plus, X, Loader2 } from "lucide-react"; // ← Loader2 ni qo'shing
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// Rasmlar
import Chair from "../../../../assets/tex.png";
import Logo from "../../../../assets/logo.png";
import StoreBanner from "../components/StoreBanner";
import StoreCategories from "../components/StoreCategories";

function Ustalar() {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // ← yangi state

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const notification = () => {
    navigate('/notification');
  };

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

  const removeImage = (index) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Telegram yuborish funksiyasi (o'zgarmagan)
  const TELEGRAM_BOT_TOKEN = "8578281350:AAEgaGPPo5CWs866-6rr3iVnCHEXwVMRgQM";
  const ADMIN_CHAT_IDS = ["7548230903", "7800450778"];

  const sendToTelegram = async (messageText, images = []) => {
    const results = [];
    for (const chatId of ADMIN_CHAT_IDS) {
      try {
        if (images.length === 0) {
          const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
              parse_mode: "HTML",
            }),
          });
          if (!res.ok) throw new Error(await res.text());
        } else {
          const formData = new FormData();
          const media = images.map((img, idx) => {
            const field = `photo${idx}`;
            formData.append(field, img.file);
            return {
              type: "photo",
              media: `attach://${field}`,
              caption: idx === 0 ? messageText : "",
            };
          });
          formData.append("chat_id", chatId);
          formData.append("media", JSON.stringify(media));

          const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
          const res = await fetch(url, { method: "POST", body: formData });
          if (!res.ok) throw new Error(await res.text());
        }
        results.push({ chatId, success: true });
      } catch (err) {
        console.error(`Xato (${chatId}):`, err);
        results.push({ chatId, success: false, error: err.message });
      }
    }
    return results;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true); // ← loading boshlanadi

    const muammo = data.muammo?.trim() || "Ma'lumot kiritilmagan";
    const tel1 = data.telRaqam || "-";
    const tel2 = data.telRaqam2 || "-";

    const messageText = `
Yangi murojaat!

Muammo:
${muammo}

Tel 1: ${tel1}
Tel 2: ${tel2}
    `.trim();

    try {
      const sendResults = await sendToTelegram(messageText, selectedImages);
      const atLeastOneSuccess = sendResults.some(r => r.success);

      if (atLeastOneSuccess) {
        console.log("Murojaatingiz yuborildi!");
        reset({ muammo: "", telRaqam: "", telRaqam2: "" });
        setSelectedImages([]);
      } else {
        console.log("Hamma adminlarga yuborishda xato yuz berdi. Iltimos keyinroq urinib ko'ring.");
      }
    } catch (error) {
      console.error("Umumiy xato:", error);
      console.log("Xatolik yuz berdi. Internet yoki bot tokenni tekshiring.");
    } finally {
      setIsSubmitting(false); // ← loading tugaydi (muvaffaqiyatli yoki xato bo'lsa ham)
    }
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

  return (
    <div className="bg-white pb-24 font-sans">
      <div className="">
        <StoreBanner slides={slides} />
        <StoreCategories />

        <div className="mb-6">
          <h1 className="font-bold text-[20px] md:text-[28px] text-gray-800 mb-6">
            Muammo haqida murojaat qiling
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div className="space-y-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold text-sm">Tel. raqamingiz <span className="text-red-500">*</span></label>
                <input
                  {...register("telRaqam", { required: "Telefon raqam kiritish shart", minLength: { value: 17, message: "Raqam to'liq emas" } })}
                  type="tel"
                  placeholder="+998-90-123-45-67"
                  onChange={(e) => { e.target.value = formatPhoneNumber(e.target.value); }}
                  className={`w-full p-4 bg-gray-50 border ${errors.telRaqam ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold text-sm">Tel. raqamingiz 2 <span className="text-red-500">*</span></label>
                <input
                  {...register("telRaqam2", { required: "Telefon raqam kiritish shart", minLength: { value: 17, message: "Raqam to'liq emas" } })}
                  type="tel"
                  placeholder="+998-90-123-45-67"
                  onChange={(e) => { e.target.value = formatPhoneNumber(e.target.value); }}
                  className={`w-full p-4 bg-gray-50 border ${errors.telRaqam2 ? 'border-red-500' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#00C2FF]`}
                />
              </div>
              {errors.telRaqam && <span className="text-red-500 text-xs col-span-2">{errors.telRaqam.message}</span>}
              {errors.telRaqam2 && <span className="text-red-500 text-xs col-span-2">{errors.telRaqam2.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}                    // ← tugma faol bo'lmasligi
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all
                ${isSubmitting
                  ? 'bg-[#00C2FF]/70 cursor-not-allowed text-white/90'
                  : 'bg-[#00C2FF] text-white active:scale-95 hover:bg-[#00B0E0] cursor-pointer'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                "Yuborish"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Ustalar;
