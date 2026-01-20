import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaChevronLeft,
    FaSearch,
    FaRegBell,
    FaCalendarAlt,
    FaUser,
    FaClock
} from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { LuMessageSquareText } from "react-icons/lu";
import { FiPhone } from "react-icons/fi";
import axios from 'axios';

// Rang konstantalari
const primaryTeal = '#00BCE4';
const darkText = '#272937';
const accentRed = '#FF6F47';

function Yoqtirishlar() {
    const navigate = useNavigate();

    // === STATE LAR ===
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // === API DAN MA'LUMOT OLISH ===
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get('https://app.dentago.uz/api/admin/appointments', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // API javobiga qarab data ni olish (response.data yoki response.data.data bo'lishi mumkin)
                console.log('API Response:', response.data);
                const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setAppointments(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    // === FUNKSIYALAR ===
    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToNotifications = () => {
        navigate('/Notification');
    };

    const handleGoToChat = () => {
        navigate('/chats');
    };

    return (
        <div className='min-h-screen bg-gray-50 pb-[80px]'>

            {/* Yuqori Sarlavha */}
            <header
                className="p-4 pb-16 pt-8 rounded-b-[40px] shadow-lg relative"
                style={{ backgroundColor: primaryTeal }}
            >
                <div className="flex justify-between items-center mb-6">
                    <FaChevronLeft
                        className="text-white text-2xl cursor-pointer"
                        onClick={handleGoBack}
                    />
                    <LuMessageSquareText
                        className="text-white text-2xl cursor-pointer"
                        onClick={handleGoToChat}
                    />
                </div>

                <h1 className="text-white text-2xl font-bold mb-4">
                    Qabullar (Appointments)
                </h1>

                <div className='relative'>
                    <input
                        type="text"
                        placeholder="Qabulni qidirish..."
                        className="w-full h-12 bg-white rounded-xl shadow-md pl-12 pr-12 text-sm focus:outline-none"
                    />
                    <FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <FaRegBell
                        className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg cursor-pointer'
                        onClick={handleGoToNotifications}
                    />
                </div>
            </header>

            {/* Asosiy Kontent - Qabullar Ro'yxati */}
            <div className='p-4 space-y-5'>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00BCE4]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-xl text-red-500 text-center">
                        {error}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                        <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Qabullar mavjud emas
                        </h3>
                    </div>
                ) : (
                    appointments.map((item, index) => (
                        <div
                            key={item.id || index}
                            className='bg-white rounded-2xl shadow-md p-4 flex flex-col'
                        >
                            {/* Qabul haqida ma'lumot */}
                            <div className='flex items-start space-x-4 mb-2'>
                                <div className='p-3 bg-blue-50 rounded-xl'>
                                    <FaCalendarAlt className="text-[#00BCE4] text-xl" />
                                </div>

                                <div className='flex-grow'>
                                    <div className="flex justify-between items-start">
                                        <h3
                                            className="text-lg font-bold"
                                            style={{ color: darkText }}
                                        >
                                            {/* Bemor ismi yoki ID */}
                                            {item.patient_name || item.patient?.name || `Bemor #${item.patient_id || 'Noma\'lum'}`}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${items_status_color(item.status)
                                            }`}>
                                            {item.status || 'Holat yo\'q'}
                                        </span>
                                    </div>

                                    <div className='text-sm text-gray-500 mt-1 flex flex-col gap-1'>
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-gray-400 w-3 h-3" />
                                            <span>Doktor: {item.doctor_name || item.doctor?.name || 'Belgilanmagan'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-gray-400 w-3 h-3" />
                                            <span>Vaqt: {formatDate(item.appointment_date || item.date)}</span>
                                        </div>
                                        {item.service && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-xs">Xizmat:</span>
                                                <span>{item.service}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Yordamchi funksiyalar
const formatDate = (dateString) => {
    if (!dateString) return 'Vaqt belgilanmagan';
    try {
        return new Date(dateString).toLocaleString('uz-UZ');
    } catch (e) {
        return dateString;
    }
};

const items_status_color = (status) => {
    switch (String(status).toLowerCase()) {
        case 'pending':
        case 'kutilmoqda': return 'bg-yellow-100 text-yellow-600';
        case 'confirmed':
        case 'tasdiqlandi': return 'bg-green-100 text-green-600';
        case 'cancelled':
        case 'bekor qilindi': return 'bg-red-100 text-red-600';
        case 'completed':
        case 'yakunlandi': return 'bg-blue-100 text-blue-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export default Yoqtirishlar;