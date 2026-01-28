import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataProvider';
import Modal from './common/Modal';

const AnnouncementsContent = () => {
    const { data, updateData, t } = useData();
    const announcements = data.announcements || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [viewingAnnouncement, setViewingAnnouncement] = useState(null);

    const [formData, setFormData] = useState({
        image: '',
        description: '',
        paymentStatus: 'Kutilmoqda'
    });

    // 7 kun qo'shish funksiyasi
    const addSevenDays = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 7);
        return newDate.toISOString().split('T')[0];
    };

    // Muddati o'tganligini tekshirish
    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };

    // Qolgan kunlarni hisoblash
    const getDaysRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const handleOpenModal = (announcement = null) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                image: announcement.image,
                description: announcement.description,
                paymentStatus: announcement.paymentStatus
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({
                image: '',
                description: '',
                paymentStatus: 'Kutilmoqda'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = (id, description) => {
        if (window.confirm(`"${description.substring(0, 30)}..." e'lonini o'chirmoqchimisiz?`)) {
            updateData('announcements', { id }, 'DELETE');
        }
    };

    const handleSave = () => {
        if (!formData.image || !formData.description) {
            alert(t('fill_required'));
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const expiryDate = addSevenDays(currentDate);

        const dataToSend = {
            ...formData,
            createdAt: editingAnnouncement ? editingAnnouncement.createdAt : currentDate,
            expiresAt: editingAnnouncement ? editingAnnouncement.expiresAt : expiryDate,
            isActive: true
        };

        if (editingAnnouncement) {
            updateData('announcements', { id: editingAnnouncement.id, ...dataToSend }, 'UPDATE');
        } else {
            updateData('announcements', dataToSend, 'ADD');
        }
        setIsModalOpen(false);
        setFormData({ image: '', description: '', paymentStatus: 'Kutilmoqda' });
    };

    const handleExtendLimit = (announcement) => {
        const newExpiryDate = addSevenDays(new Date().toISOString().split('T')[0]);
        updateData('announcements', {
            id: announcement.id,
            expiresAt: newExpiryDate,
            isActive: true
        }, 'UPDATE');
        alert('E\'lon muddati 7 kunga uzaytirildi!');
    };

    const handleViewAnnouncement = (announcement) => {
        setViewingAnnouncement(announcement);
        setIsViewModalOpen(true);
    };

    return (
        <div className="space-y-6 bg-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link to="/" className="hover:text-[#00BCE4] transition-colors capitalize">{t('dashboard')}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-[#00BCE4] capitalize">{t('announcements')}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic mt-2">
                        E'lonlar <span className="text-[#00BCE4]">Boshqaruvi</span>
                    </h1>
                </div>

                <button
                    onClick={() => handleOpenModal(null)}
                    className='flex items-center gap-2 py-4 px-8 bg-[#00BCE4] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-xl shadow-[#00BCE4]/20 transition-all active:scale-95 whitespace-nowrap'
                >
                    <Plus className='w-5 h-5' /> {t('add')} {t('announcement')}
                </button>
            </div>

            {/* E'lonlar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.length > 0 ? (
                    announcements.map((announcement) => {
                        const expired = isExpired(announcement.expiresAt);
                        const daysLeft = getDaysRemaining(announcement.expiresAt);

                        return (
                            <div
                                key={announcement.id}
                                className={`bg-white rounded-2xl border ${expired ? 'border-rose-200 bg-rose-50/10' : 'border-gray-100'} overflow-hidden transition-all hover:border-gray-200 group`}
                            >
                                {/* Rasm */}
                                <div className="relative h-56 bg-gray-50">
                                    <img
                                        src={announcement.image}
                                        alt="E'lon rasmi"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Rasm+Topilmadi';
                                        }}
                                    />
                                    {expired && (
                                        <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            Muddati tugagan
                                        </div>
                                    )}
                                    {!expired && (
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            {daysLeft} kun qoldi
                                        </div>
                                    )}
                                </div>

                                {/* Mazmun */}
                                <div className="p-6">
                                    <p className="text-sm font-bold text-slate-700 mb-4 line-clamp-3 leading-relaxed">
                                        {announcement.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {announcement.createdAt}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${announcement.paymentStatus === 'To\'landi' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {announcement.paymentStatus}
                                        </span>
                                    </div>

                                    {/* Amallar */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewAnnouncement(announcement)}
                                            className='flex-1 py-3 rounded-xl text-slate-400 bg-gray-50 hover:bg-[#00BCE4] hover:text-white transition-all flex items-center justify-center'
                                            title="Ko'rish"
                                        >
                                            <Eye className='w-4 h-4' />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(announcement)}
                                            className='flex-1 py-3 rounded-xl text-slate-400 bg-gray-50 hover:bg-[#00BCE4] hover:text-white transition-all flex items-center justify-center'
                                            title="Tahrirlash"
                                        >
                                            <Edit className='w-4 h-4' />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id, announcement.description)}
                                            className='flex-1 py-3 rounded-xl text-slate-400 bg-gray-50 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center'
                                            title="O'chirish"
                                        >
                                            <Trash2 className='w-4 h-4' />
                                        </button>
                                    </div>

                                    {/* Limit uzaytirish */}
                                    {expired && (
                                        <button
                                            onClick={() => handleExtendLimit(announcement)}
                                            className='w-full mt-3 py-3 bg-amber-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 transition-all'
                                        >
                                            Limitni uzaytirish (+7 kun)
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-32 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Plus className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                            E'lonlar topilmadi. Yangi e'lon qo'shing!
                        </p>
                    </div>
                )}
            </div>

            {/* Qo'shish/Tahrirlash Modali */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAnnouncement(null);
                    setFormData({ image: '', description: '', paymentStatus: 'Kutilmoqda' });
                }}
                title={editingAnnouncement ? "E'lonni tahrirlash" : "Yangi e'lon yaratish"}
                footer={
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-[#00BCE4] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#00BCE4]/20 active:scale-95"
                    >
                        {editingAnnouncement ? t('save') : "E'lonni yaratish"}
                    </button>
                }
            >
                <div className="space-y-6 py-4">
                    {/* Rasm URL */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            E'lon rasmi (URL)*
                        </label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#00BCE4] focus:bg-white transition-all"
                        />
                        {formData.image && (
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="mt-4 w-full h-48 object-cover rounded-2xl border border-gray-100"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x200?text=Noto\'g\'ri+URL';
                                }}
                            />
                        )}
                    </div>

                    {/* Tavsif */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Tavsif (E'lon matni)*
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="E'lon haqida batafsil ma'lumot yozing..."
                            rows={4}
                            className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#00BCE4] focus:bg-white transition-all resize-none"
                        />
                    </div>

                    {/* To'lov holati (placeholder) */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            To'lov holati
                        </label>
                        <select
                            value={formData.paymentStatus}
                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                            className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#00BCE4] focus:bg-white transition-all appearance-none"
                        >
                            <option value="Kutilmoqda">Kutilmoqda</option>
                            <option value="To'landi">To'landi</option>
                            <option value="Bekor qilindi">Bekor qilindi</option>
                        </select>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">
                            * To'lov tizimi keyinchalik API orqali ulanadi
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Ko'rish Modali */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="E'lon tafsilotlari"
            >
                {viewingAnnouncement && (
                    <div className="space-y-4">
                        <img
                            src={viewingAnnouncement.image}
                            alt="E'lon rasmi"
                            className="w-full h-64 object-cover rounded-lg"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x400?text=Rasm+Topilmadi';
                            }}
                        />
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Tavsif:</h3>
                            <p className="text-gray-700 dark:text-gray-300">{viewingAnnouncement.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Yaratilgan:</span>
                                <p className="text-gray-800 dark:text-white">{viewingAnnouncement.createdAt}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Tugash sanasi:</span>
                                <p className="text-gray-800 dark:text-white">{viewingAnnouncement.expiresAt}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">To'lov holati:</span>
                                <p className="text-gray-800 dark:text-white">{viewingAnnouncement.paymentStatus}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Qolgan kunlar:</span>
                                <p className="text-gray-800 dark:text-white">
                                    {isExpired(viewingAnnouncement.expiresAt) ? 'Muddati tugagan' : `${getDaysRemaining(viewingAnnouncement.expiresAt)} kun`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AnnouncementsContent;
