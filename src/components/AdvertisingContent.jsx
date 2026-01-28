// src/components/AdvertisingContent.jsx

import React, { useState } from 'react';
import { useData } from '../context/DataProvider';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';

// Yangi reklama qo'shish uchun Modal
const AddAdvertisementModal = ({ isOpen, onClose }) => {
    const { addAdvertisement, t } = useData();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('active');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && content) {
            addAdvertisement({ title, content, status });
            onClose();
            setTitle('');
            setContent('');
            setStatus('active');
        } else {
            alert(t('fill_required'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md border border-gray-100">
                <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-tight">Yangi Reklama Qo'shish</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sarlavha</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full rounded-xl border border-gray-100 p-4 bg-gray-50 text-sm font-bold text-slate-700 outline-none focus:border-[#00BCE4] focus:bg-white transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kontent</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="3"
                            className="block w-full rounded-xl border border-gray-100 p-4 bg-gray-50 text-sm font-bold text-slate-700 outline-none focus:border-[#00BCE4] focus:bg-white transition-all resize-none"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('status')}</label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setStatus('active')}
                                className={`flex-1 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'bg-[#00BCE4] text-white' : 'bg-gray-50 text-slate-400 hover:bg-gray-100'}`}
                            >
                                {t('active')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('inactive')}
                                className={`flex-1 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${status === 'inactive' ? 'bg-rose-500 text-white' : 'bg-gray-50 text-slate-400 hover:bg-gray-100'}`}
                            >
                                {t('inactive')}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#00BCE4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#00BCE4]/20 transition-all"
                        >
                            {t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdvertisingContent = () => {
    const { data, t } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const advertisements = data.advertisements || [];

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link to="/" className="hover:text-[#00BCE4] transition-colors">{t('dashboard')}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-[#00BCE4]">{t('advertising')}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic mt-2">
                        Reklamalar <span className="text-[#00BCE4]">Boshqaruvi</span>
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-8 py-4 bg-[#00BCE4] text-white rounded-2xl hover:brightness-110 transition duration-150 shadow-xl shadow-[#00BCE4]/20 text-[10px] font-black uppercase tracking-widest active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" /> {t('add')}
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-white border-b border-gray-50">
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">#</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sarlavha</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kontent</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('status')}</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('date')}</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {advertisements.length > 0 ? (
                            advertisements.map((ad, index) => (
                                <tr key={ad.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-[#00BCE4]">{index + 1}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-700">{ad.title}</td>
                                    <td className="px-8 py-5 max-w-xs text-sm text-slate-500 truncate">{ad.content}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-4 py-1.5 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full border ${ad.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {ad.status === 'active' ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-400">{ad.date}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-slate-400 hover:bg-[#00BCE4] hover:text-white rounded-xl transition-all">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center bg-white">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <Plus className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hozircha reklama mavjud emas.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddAdvertisementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default AdvertisingContent;
