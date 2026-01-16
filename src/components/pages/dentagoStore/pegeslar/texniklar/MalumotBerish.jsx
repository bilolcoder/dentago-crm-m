import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MalumotBerish() {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  const [selectedImages, setSelectedImages] = useState([]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file: file
      }));

      const updatedList = [...selectedImages, ...newImages];
      setSelectedImages(updatedList);
      setValue('images', updatedList);
    }
    event.target.value = '';
  };

  const removeImage = (id) => {
    const filtered = selectedImages.filter(img => img.id !== id);
    setSelectedImages(filtered);
    setValue('images', filtered);
  };

  const onSubmit = (data) => {
    console.log("Yuborilgan ma'lumotlar:", data);
    reset();
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={galleryInputRef}
        onChange={handleFileChange}
      />

      <div className="flex items-center py-5 border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="w-full flex items-center">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="flex-1 text-center text-xl md:text-2xl font-bold text-gray-800 mr-10">
            Buyurtma berish
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 md:mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          {/* Ism */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-gray-700 font-bold text-sm">Be'mor ism-familiyasi *</label>
            <input
              {...register("fullName", { required: "Ismni kiritish shart" })}
              type="text"
              placeholder="Ism va familiyani kiriting"
              className={`w-full p-4 bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8]`}
            />
          </div>

          {/* Yoshi */}
          <div className="space-y-2">
            <label className="text-gray-700 font-bold text-sm">Yoshi *</label>
            <input
              {...register("age", { required: true })}
              type="number"
              placeholder="Masalan: 25"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Og'iz tuzilishi */}
          <div className="space-y-2">
            <label className="text-gray-700 font-bold text-sm">Og'iz tuzilishi *</label>
            <input
              {...register("jawType", { required: true })}
              type="text"
              placeholder="Kiriting"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Tish rangi */}
          <div className="space-y-2">
            <label className="text-gray-700 font-bold text-sm">Tish rangi *</label>
            <input
              {...register("toothColor", { required: true })}
              type="text"
              placeholder="Masalan: A1"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Material */}
          <div className="space-y-2">
            <label className="text-gray-700 font-bold text-sm">Material *</label>
            <input
              {...register("material", { required: true })}
              type="text"
              placeholder="Kiriting"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Tavsif */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-gray-700 font-bold text-sm">Tavsif (izoh)</label>
            <textarea
              {...register("description")}
              rows="4"
              placeholder="Qo'shimcha ma'lumotlar..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none"
            />
          </div>

          {/* TO'LOV + YETKAZIB BERISH (flex yonma-yon) */}
          <div className="md:col-span-2 flex flex-col md:flex-row gap-6">

            {/* To'lov qiluvchi */}
            <div className="flex-1 space-y-3">
              <label className="text-gray-700 font-bold text-sm">To'lov qiluvchi *</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl cursor-pointer">
                  <input type="radio" value="zub_texnik" {...register("payer", { required: true })} />
                  Zub texnik
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl cursor-pointer">
                  <input type="radio" value="stamatolog" {...register("payer", { required: true })} />
                  Stamatolog
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl cursor-pointer">
                  <input type="radio" value="ikkisixam" {...register("payer", { required: true })} />
                  Ikkisixam
                </label>
              </div>
            </div>

            {/* Yetkazib berish */}
            <div className="flex-1 space-y-3">
              <label className="text-gray-700 font-bold text-sm">Yetkazib berish *</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl cursor-pointer">
                  <input type="radio" value="btc" {...register("delivery", { required: true })} />
                  BTC
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-2xl cursor-pointer">
                  <input type="radio" value="yandex_go" {...register("delivery", { required: true })} />
                  YandexGo
                </label>
              </div>
            </div>

          </div>

          {/* Rasm qo'shish */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-gray-700 font-bold text-sm">Rasm qo'shish *</label>

            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative w-20 h-20">
                    <img src={img.url} className="w-full h-full object-cover rounded-xl border-2 border-cyan-100" />
                    <button type="button" onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => cameraInputRef.current.click()} className="flex items-center justify-center gap-2 p-4 bg-cyan-50 text-cyan-600 rounded-2xl font-bold border">
                <Camera className="w-5 h-5" /> Kamera
              </button>
              <button type="button" onClick={() => galleryInputRef.current.click()} className="flex items-center justify-center gap-2 p-4 bg-cyan-50 text-cyan-600 rounded-2xl font-bold border">
                <ImageIcon className="w-5 h-5" /> Galereya
              </button>
            </div>
          </div>

        </div>

        <div className="mt-10">
          <button type="submit" className="w-full bg-[#00B4D8] text-white py-5 rounded-2xl font-bold text-lg">
            Buyurtma berish
          </button>
        </div>
      </form>
    </div>
  );
}

export default MalumotBerish;
