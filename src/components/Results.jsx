// src/components/Results.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataProvider';
import { Image as ImageIcon, X, Plus, Loader2 } from 'lucide-react';

function Results() {
  const { t } = useData();
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const MAX_IMAGES = 4;

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const canAdd = MAX_IMAGES - selectedImages.length;
    if (files.length > canAdd) {
      console.log(t('max_images_alert') || `Maksimal ${MAX_IMAGES} ta rasm yuklash mumkin`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    event.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const img = selectedImages[index];
    if (img?.preview) URL.revokeObjectURL(img.preview);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (selectedImages.length === 0) {
      console.log('Kamida bitta rasm tanlang');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Access token topilmadi. Tizimga kiring.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Barcha doktorlarni olish
      const doctorsRes = await fetch('https://app.dentago.uz/api/admin/doctors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!doctorsRes.ok) {
        throw new Error(`Doktorlarni olishda xato: ${doctorsRes.status}`);
      }

      const doctorsData = await doctorsRes.json();
      // Turli formatlarni qo'llab-quvvatlash
      let allDoctors = Array.isArray(doctorsData)
        ? doctorsData
        : doctorsData.data || doctorsData.doctors || doctorsData.items || [];

      if (allDoctors.length === 0) {
        throw new Error('Hech qanday doktor topilmadi');
      }

      console.log(`Topilgan doktorlar soni: ${allDoctors.length}`);

      // 2. Rasmlarni yuklash va URL larni olish (bir marta)
      const uploadPromises = selectedImages.map(async (img) => {
        const formData = new FormData();
        formData.append('image', img.file);

        const uploadRes = await fetch('https://app.dentago.uz/api/upload/image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(`Rasm yuklash xatosi: ${uploadRes.status}`);

        const uploadData = await uploadRes.json();
        const filename = uploadData?.file?.savedName || uploadData?.filename;
        if (!filename) throw new Error('Fayl nomi topilmadi');

        return `https://app.dentago.uz/images/${filename}`;
      });

      const newImageUrls = await Promise.all(uploadPromises);

      // 3. Har bir doktor uchun PUT so'rov – faqat gallery ni yangilash/qo'shish
      const updatePromises = allDoctors.map(async (doctor) => {
        const doctorId = doctor._id || doctor.id;
        if (!doctorId) return null; // ID yo'q bo'lsa o'tkazib yuborish

        const response = await fetch(`https://app.dentago.uz/api/admin/doctors/${doctorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            gallery: newImageUrls,  // ← faqat gallery (oldingi rasmlarni o'chirib, yangisini qo'yadi)
            // Agar eski rasmlarni saqlab qo'shmoqchi bo'lsangiz:
            // gallery: [...(doctor.gallery || []), ...newImageUrls]
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          console.warn(`Doktor ${doctorId} uchun xato:`, err);
          return { id: doctorId, success: false, error: err.message || 'Xato' };
        }

        return { id: doctorId, success: true };
      });

      const results = await Promise.all(updatePromises);
      const failed = results.filter(r => r && !r.success);

      if (failed.length > 0) {
        throw new Error(`${failed.length} ta doktor uchun yangilash muvaffaqiyatsiz bo'ldi`);
      }

      console.log('Barcha doktorlar gallereyasi yangilandi');
      setSuccess(true);

      // Tozalash
      selectedImages.forEach(img => img.preview && URL.revokeObjectURL(img.preview));
      setSelectedImages([]);

    } catch (err) {
      console.error('Umumiy xato:', err);
      setError(err.message || 'Operatsiyada xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screenpy-8'>
      <div className="">
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-500 mb-8">
          <Link to="/" className="hover:text-[#00BCE4] transition-colors duration-200">{t('dashboard') || 'Dashboard'}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{t('my_results') || 'Natijalarim'}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gray-50">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-[#00BCE4] rounded-xl shadow-md">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Natijalar <span className="text-[#00BCE4]">Gallereyasi</span>
                </h1>
                <p className="text-slate-600 mt-1">
                  Tanlangan rasmlar barcha doktorlar gallereyasiga qo'shiladi.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className='text-lg font-bold text-slate-700 flex items-center gap-2'>
                <ImageIcon className="w-5 h-5 text-[#00BCE4]" />
                Rasm Galereyasi
              </h2>
              <span className={`text-sm font-semibold px-4 py-2 rounded-full ${selectedImages.length === MAX_IMAGES ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gray-400 text-white'}`}>
                {selectedImages.length} / {MAX_IMAGES} rasm
              </span>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
              {selectedImages.length < MAX_IMAGES && (
                <div className="group">
                  <button
                    className='w-full aspect-square border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00BCE4] hover:text-[#00BCE4] hover:bg-[#00BCE4]/5 transition-all duration-300 group'
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    <div className="p-4 bg-slate-100 rounded-full group-hover:bg-white group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className='mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-[#00BCE4]'>
                      Rasm tanlash
                    </span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id='imageInput'
                    multiple
                    onChange={handleImageChange}
                  />
                </div>
              )}

              {selectedImages.map((image, index) => (
                <div key={index} className='relative aspect-square rounded-2xl overflow-hidden shadow-lg group border border-slate-200 transition-transform duration-300 hover:shadow-xl'>
                  <img
                    src={image.preview}
                    alt={`Rasm ${index + 1}`}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-full p-2 hover:bg-red-500 hover:text-white transition-all shadow-lg z-10'
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Rasm #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                <p><strong>{selectedImages.length}</strong> ta rasm tanlandi</p>
              </div>
              <button
                onClick={handleSave}
                disabled={loading || selectedImages.length === 0}
                className={`px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-3 transition-all duration-300 ${
                  loading || selectedImages.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00BCE4] to-[#0099d4] hover:from-[#0099d4] hover:to-[#007bb0] active:scale-95'
                }`}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Saqlanmoqda...' : 'Barcha doktorlarga saqlash'}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="text-red-500 font-bold text-lg">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Xatolik yuz berdi</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <div className="text-green-500 font-bold text-lg">✓</div>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Muvaffaqiyatli bajarildi!</h3>
                  <p className="text-green-600 text-sm">Rasmlar barcha doktorlar gallereyasiga muvaffaqiyatli qo'shildi!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;