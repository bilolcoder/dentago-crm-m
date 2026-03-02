import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Store, FileText, Stethoscope, Send, Users, Settings, BookOpen,
    ChevronDown, ListOrdered, Archive, User, PlusCircle, X, Package,
    MessageSquare, BriefcaseMedical, ChevronLeft, ChevronRight
} from 'lucide-react';
import { IoIosStats } from "react-icons/io";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { BsInstagram, BsTelegram } from 'react-icons/bs';
import { FaYoutube } from "react-icons/fa";
import { useData } from '../../context/DataProvider';
import Logo from '../../assets/dentago.png';
import Need from '../Need';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, user } = useData();

    const [isCollapsed, setIsCollapsed] = useState(false); // faqat desktop uchun
    const [openMenus, setOpenMenus] = useState({
        ombor: false,
        hisobot: false,
        sms: false,
        settings: false,
    });
    const [showNeedModal, setShowNeedModal] = useState(false);

    // Markazlashgan navigatsiya
    const handleNavigation = (route, isExternal = false) => {
        if (isExternal) {
            window.open(route, '_blank', 'noopener,noreferrer');
        } else {
            navigate(route);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        }
    };

    const handleMenuToggle = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const handleOverlayClick = () => {
        setIsSidebarOpen(false);
    };

    const handleClose = () => {
        setIsSidebarOpen(false);
    };

    // Sahifa o‘zgarganda avto ochiladigan menyular
    useEffect(() => {
        if (location.pathname.startsWith('/storage')) setOpenMenus(prev => ({ ...prev, ombor: true }));
        if (location.pathname.startsWith('/hisobot')) setOpenMenus(prev => ({ ...prev, hisobot: true }));
        if (location.pathname.startsWith('/sms')) setOpenMenus(prev => ({ ...prev, sms: true }));
        if (location.pathname.startsWith('/settings')) setOpenMenus(prev => ({ ...prev, settings: true }));
    }, [location.pathname]);

    const navItems = [
        { icon: Home, label: "Dentago", route: "/DentagoStore", type: "link" },
        { icon: IoIosStats, label: t('main'), route: "/dashboard", type: "link" },
        { icon: HiOutlineInformationCircle, label: t('my_information'), route: "/my-information", type: "link" },
        { icon: Users, label: t('bemorlarim'), route: "/bemorlarim", type: "link" },
        { icon: ListOrdered, label: t('orders_bts'), route: "/orders", type: "link" },
        { icon: User, label: t('my_results'), route: "/result", type: "link" },
        { icon: PlusCircle, label: "Mahsulot qo'shish", route: "/addproduct", type: "link" },
        { icon: Package, label: "Admin Product", route: "/admin-product", type: "link" },
        { icon: Package, label: "All Doctors Edit", route: "/AllDoctorsEdit", type: "link" },
        { icon: BriefcaseMedical, label: "Texniklar", route: "/technicians", type: "link" },
        { icon: BriefcaseMedical, label: "All Texniks", route: "/alltechnicals", type: "link" },
        { icon: BriefcaseMedical, label: "Texnikga Buyurtma", route: "/technician-orders", type: "link" },
        { icon: BriefcaseMedical, label: "Buyurtma Sotuvchi", route: "/order-seller", type: "link" },
    ];

    const getVisibleNavItems = () => {
        const role = user?.role;

        if (role === 'admin') return navItems;

        if (role === 'doctor') {
            return navItems.filter(item =>
                ["/DentagoStore", "/dashboard", "/my-information", "/bemorlarim", "/orders", "/result", "/technician-orders"]
                    .includes(item.route)
            );
        }

        if (role === 'seller') {
            return navItems.filter(item =>
                ["/DentagoStore", "/dashboard", "/orders", "/addproduct", "/order-seller"]
                    .includes(item.route)
            );
        }

        if (role === 'technician') {
            return navItems.filter(item =>
                ["/DentagoStore", "/dashboard", "/orders", "/technicians"]
                    .includes(item.route)
            );
        }

        if (role === 'master') {
            return navItems.filter(item =>
                ["/DentagoStore", "/dashboard", "/orders"]
                    .includes(item.route)
            );
        }

        return navItems.filter(item => item.route === "/DentagoStore");
    };

    const visibleNavItems = getVisibleNavItems();

    const needButton = {
        icon: MessageSquare,
        label: "Nima kerak?",
        type: "button",
        action: () => setShowNeedModal(true)
    };

    const renderNavItem = (item, index) => {
        const isActive = item.route === "/"
            ? location.pathname === "/"
            : location.pathname === item.route || (item.type === "group" && location.pathname.startsWith(item.route));

        if (item.type === "link") {
            return (
                <div key={index} className="space-y-1">
                    <div
                        onClick={() => handleNavigation(item.route)}
                        className={`
                            flex items-center gap-4 px-5 py-3 rounded-[7px] cursor-pointer transition-all duration-300
                            ${isActive
                                ? 'bg-[#00BCE4] text-white font-bold'
                                : 'text-slate-400 font-bold hover:bg-[#00BCE4] hover:text-slate-50'}
                        `}
                    >
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                    </div>
                </div>
            );
        }

        // Agar group bo'lsa (hozircha faol emas, lekin saqlab qo'yilgan)
        return (
            <div key={index} className="space-y-1">
                <button
                    onClick={() => handleMenuToggle(item.name)}
                    className={`
                        w-full flex items-center justify-between px-5 py-3 rounded-[7px] transition-all duration-300
                        ${isActive
                            ? 'bg-slate-50 text-[#00BCE4]'
                            : 'text-slate-400 font-bold hover:bg-[#00BCE4] hover:text-slate-50'}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openMenus[item.name] ? 'rotate-180' : ''}`} />
                </button>

                <div className={`
                    overflow-hidden transition-all duration-500
                    ${openMenus[item.name] ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
                `}>
                    <div className="pl-5 space-y-1">
                        {item.subItems?.map((sub, sIdx) => {
                            const isSubActive = location.pathname === sub.route;
                            return (
                                <div
                                    key={sIdx}
                                    onClick={() => handleNavigation(sub.route)}
                                    className={`
                                        cursor-pointer block py-3 px-4 rounded-[7px] text-[10px] font-black uppercase tracking-tight transition-all
                                        ${isSubActive
                                            ? 'text-white bg-[#00BCE4]'
                                            : 'text-slate-400 hover:text-[#00BCE4] hover:translate-x-1'}
                                    `}
                                >
                                    {sub.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Collapse/Expand tugmalari */}
            <div className="hidden md:block">
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="
                            fixed left-[265px] top-6 z-[51]
                            bg-white border border-gray-200 rounded-full shadow-lg p-2.5
                            hover:bg-gray-100 transition-all duration-200 cursor-pointer
                        "
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                )}

                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="
                            fixed left-[55px] top-6 z-[100]
                            bg-white border border-gray-200 rounded-full shadow-lg p-2.5
                            hover:bg-gray-100 transition-all duration-200 cursor-pointer
                        "
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight size={24} className="text-gray-700" />
                    </button>
                )}
            </div>

            {/* Mobil overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-500"
                    onClick={handleOverlayClick}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-white z-50
                transition-all duration-500 ease-in-out
                border-r border-blue-50 flex flex-col justify-between
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:h-screen
                ${isCollapsed ? 'md:w-20' : 'md:w-72'}
            `}>
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Brand Identity */}
                    <div className={`flex bg-white items-center justify-between relative ${isCollapsed ? 'p-4' : 'p-8 pb-6'}`}>
                        <div onClick={() => handleNavigation("/DentagoStore")} className="cursor-pointer flex items-center justify-center gap-3 group">
                            <img
                                className={isCollapsed ? 'h-10 ml-0' : 'h-37.5 -mt-15 ml-[32px]'}
                                src={Logo}
                                alt="Logo"
                            />
                        </div>
                        {/* Yopish tugmasi - faqat mobilda */}
                        <button
                            onClick={handleClose}
                            className="hidden max-md:flex absolute top-4 right-4 p-2 text-slate-400 hover:text-[#00BCE4] hover:bg-blue-50 rounded-lg transition-all"
                            aria-label="Yopish"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 z-50 overflow-y-auto bg-white ${isCollapsed ? 'px-2 mt-3' : 'mt-[-60px]  px-4'} space-y-1 custom-scrollbar pb-4`}>
                        {visibleNavItems.map((item, index) =>
                            isCollapsed ? (
                                <div key={index} className="flex   justify-center">
                                    <button
                                        onClick={() => handleNavigation(item.route)}
                                        className={`
                                            p-3 rounded-xl cursor-pointer transition-colors duration-200
                                            ${location.pathname === item.route
                                                ? 'bg-[#00BCE4] text-white shadow-md'
                                                : 'text-slate-400 hover:bg-[#00BCE4]/10 hover:text-[#00BCE4]'}
                                        `}
                                        title={item.label}
                                    >
                                        <item.icon size={24} strokeWidth={location.pathname === item.route ? 2.5 : 2} />
                                    </button>
                                </div>
                            ) : (
                                renderNavItem(item, index)
                            )
                        )}

                        {/* Nima kerak? tugmasi - collapse bo'lsa ko'rinmaydi */}
                        {!isCollapsed && (
                            <div className="">
                                <div
                                    onClick={() => {
                                        setShowNeedModal(true);
                                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                                    }}
                                    className="
                                        flex items-center gap-4 px-5 py-3 rounded-[7px] cursor-pointer
                                        text-slate-400 font-bold hover:bg-[#00BCE4] hover:text-white
                                        transition-all duration-300
                                    "
                                >
                                    <MessageSquare size={20} strokeWidth={2} />
                                    <span className="text-[11px] uppercase tracking-widest">
                                        {needButton.label}
                                    </span>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Footer - collapse bo'lsa yashirin */}
                {!isCollapsed && (
                    <div className="px-6 py-4 bg-white border-t border-blue-50">
                        <div className="flex justify-center gap-6 mb-3">
                            <div onClick={() => handleNavigation("https://t.me/Dentago_uz", true)} className="cursor-pointer text-[#00BCE4] hover:scale-110 transition-transform">
                                <BsTelegram size={22} />
                            </div>
                            <div onClick={() => handleNavigation("https://www.instagram.com/dentago__uz", true)} className="cursor-pointer text-red-600 hover:scale-110 transition-transform">
                                <BsInstagram size={22} />
                            </div>
                            <div onClick={() => handleNavigation("https://www.youtube.com/@Dentago_uz", true)} className="cursor-pointer text-red-500 hover:scale-110 transition-transform">
                                <FaYoutube size={24} />
                            </div>
                        </div>
                        <p className="text-center text-[10px] font-medium text-gray-700 uppercase tracking-tighter">
                            © 2026 DentaGo Platform
                        </p>
                    </div>
                )}
            </aside>

            {showNeedModal && <Need onClose={() => setShowNeedModal(false)} />}
        </>
    );
};

export default Sidebar;
