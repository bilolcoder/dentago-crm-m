import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Megaphone, Users } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";

const categories = [
    { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
    { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
    { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
    { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
];

const StoreCategories = () => {
    const location = useLocation();

    const getActiveTab = (path) => {
        if (location.pathname === path) return true;
        // For /DentagoStore, it might match exactly or match root Store path
        return false;
    };

    return (
        <section className="pb-12">
            <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 md:gap-8">
                {categories.map(({ id, label, Icon, path }) => {
                    const isActive = location.pathname === path || (path === '/DentagoStore' && location.pathname === '/store'); // Handle potential alias if any, or just strict match. 
                    // Actually let's assume strict match for now, or check includes if subpaths exist.
                    // For now, strict match is safest based on user's code which used activeTab state.
                    // However, since we are navigating, location.pathname should update.

                    const isSelected = location.pathname.toLowerCase() === path.toLowerCase();

                    return (
                        <Link key={id} to={path} className="flex flex-col items-center gap-3 decoration-none">
                            <div
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex border-2 items-center justify-center transition-all
                  ${isSelected ? 'bg-[#00BCE4] border-[#00BCE4] text-white shadow-sm' : 'bg-white border-[#00BCE4] text-[#00BCE4]'}`}
                            >
                                <Icon className="text-2xl md:text-3xl" />
                            </div>
                            <span
                                className={`text-xs md:text-lg font-semibold ${isSelected ? 'text-[#00BCE4]' : 'text-gray-600'}`}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default StoreCategories;
