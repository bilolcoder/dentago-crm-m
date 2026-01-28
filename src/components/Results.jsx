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
      alert(t('max_images_alert') || `Maksimal ${MAX_IMAGES} ta rasm yuklash mumkin`);
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
      alert('Kamida bitta rasm tanlang');
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
    <div className='space-y-6'>

      <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Link to="/" className="hover:text-[#00BCE4] transition-colors">{t('dashboard') || 'Dashboard'}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">{t('my_results') || 'Natijalarim'}</span>
      </nav>

      <header className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Natijalar <span className="text-[#00BCE4]">Gallereyasi</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium italic">
          Tanlangan rasmlar barcha doktorlar gallereyasiga qo'shiladi.
        </p>
      </header>

      <section className="space-y-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className='text-sm font-black text-slate-700 uppercase tracking-wider'>Rasmlar</h3>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-lg ${selectedImages.length === MAX_IMAGES ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
            {selectedImages.length} / {MAX_IMAGES}
          </span>
        </div>

        <div className='flex flex-wrap gap-5'>
          {selectedImages.length < MAX_IMAGES && (
            <button
              className='w-40 h-40 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#00BCE4] hover:text-[#00BCE4] hover:bg-[#00BCE4]/5 transition-all duration-300 group'
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className='mt-3 text-[10px] font-black uppercase tracking-tighter'>Rasm tanlash</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id='imageInput'
                multiple
                onChange={handleImageChange}
              />
            </button>
          )}

          {selectedImages.map((image, index) => (
            <div key={index} className='relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-md group border border-slate-100'>
              <img
                src={image.preview}
                alt={`Rasm ${index + 1}`}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => handleRemoveImage(index)}
                className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl p-2 hover:bg-red-500 hover:text-white transition-all shadow-sm'
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading || selectedImages.length === 0}
            className={`px-8 py-3 rounded-full font-bold text-white flex items-center gap-2 transition-all ${
              loading || selectedImages.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#00BCE4] hover:bg-[#0099d4] active:scale-95'
            }`}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Barchaga saqlanmoqda...' : 'Barcha doktorlarga saqlash'}
          </button>
        </div>

        {error && <p className="text-red-600 bg-red-50 p-4 rounded-xl mt-4">{error}</p>}
        {success && <p className="text-green-600 bg-green-50 p-4 rounded-xl mt-4">Rasmlar barcha doktorlar gallereyasiga muvaffaqiyatli qo'shildi!</p>}
      </section>
    </div>
  );
}

export default Results;