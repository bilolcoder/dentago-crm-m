// src/components/Results.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataProvider';
import { Image as ImageIcon, Video, X, Plus, Film, UploadCloud } from 'lucide-react';

function Results() {
    const { t } = useData();
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        if (selectedImages.length + files.length <= 4) {
            const newImages = files.map(file => ({
                file: file,
                preview: URL.createObjectURL(file)
            }));
            setSelectedImages(prevImages => [...prevImages, ...newImages]);
        } else {
            alert(t('max_images_alert') || "Maksimal 4 ta rasm yuklash mumkin");
        }
        event.target.value = null;
    };

    const handleVideoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedVideo({
                file: file,
                preview: URL.createObjectURL(file)
            });
        }
        event.target.value = null;
    };

    const handleRemoveFile = (type, index) => {
        if (type === 'image') {
            URL.revokeObjectURL(selectedImages[index].preview);
            setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
        } else if (type === 'video') {
            if (selectedVideo) {
                URL.revokeObjectURL(selectedVideo.preview);
            }
            setSelectedVideo(null);
        }
    };

    return (
        <div className='p-4 md:p-8 space-y-10 min-h-screen'>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Link to="/" className="hover:text-[#00BCE4] transition-colors">{t('dashboard')}</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900">{t('my_results')}</span>
            </nav>

            <header className="space-y-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Natijalar <span className="text-[#00BCE4]">Gallereyasi</span></h2>
                <p className="text-sm text-slate-500 font-medium italic">Bemor davolanish natijalarini rasm va video shaklida saqlang.</p>
            </header>

            {/* --- Rasm Yuklash Qismi --- */}
            <section className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className='text-sm font-black text-slate-700 uppercase tracking-wider'>{t('images')}</h3>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-lg ${selectedImages.length === 4 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedImages.length} / 4
                    </span>
                </div>

                <div className='flex flex-wrap gap-5'>
                    {/* Yangi rasm tanlash tugmasi */}
                    {selectedImages.length < 4 && (
                        <button
                            className='w-40 h-40 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#00BCE4] hover:text-[#00BCE4] hover:bg-[#00BCE4]/5 transition-all duration-300 group'
                            onClick={() => document.getElementById('imageInput').click()}
                        >
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className='mt-3 text-[10px] font-black uppercase tracking-tighter'>{t('select_image')}</span>
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

                    {/* Tanlangan rasmlarni ko'rsatish */}
                    {selectedImages.map((image, index) => (
                        <div key={index} className='relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-md group border border-slate-100'>
                            <img
                                src={image.preview}
                                alt={`Result ${index + 1}`}
                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                onClick={() => handleRemoveFile('image', index)}
                                className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl p-2 hover:bg-red-500 hover:text-white transition-all shadow-sm'
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Video Yuklash Qismi --- */}
            <section className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Film className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className='text-sm font-black text-slate-700 uppercase tracking-wider'>{t('video')}</h3>
                </div>

                <div className='flex flex-wrap gap-5'>
                    {!selectedVideo ? (
                        <button
                            className='w-full max-w-md h-48 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#00BCE4] hover:text-[#00BCE4] hover:bg-[#00BCE4]/5 transition-all duration-300 group'
                            onClick={() => document.getElementById('videoInput').click()}
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <span className='mt-4 text-[11px] font-black uppercase tracking-widest'>{t('select_video')}</span>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">MP4, MOV (max. 50MB)</p>
                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                id='videoInput'
                                onChange={handleVideoChange}
                            />
                        </button>
                    ) : (
                        <div className='relative w-full max-w-2xl aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 bg-black'>
                            <video
                                src={selectedVideo.preview}
                                controls
                                className='w-full h-full object-contain'
                            />
                            <button
                                onClick={() => handleRemoveFile('video')}
                                className='absolute top-5 right-5 bg-white text-red-500 rounded-2xl p-3 hover:bg-red-500 hover:text-white transition-all shadow-xl z-10'
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Results;
