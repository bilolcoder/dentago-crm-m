// src/components/TariffsContent.jsx
import React from 'react';
import { useData } from '../context/DataProvider';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const TariffsContent = () => {
    const { t } = useData();

    // Mock Data requested by user
    const tariffs = [
        {
            id: 1,
            name: "",
            price: "0 so'm",
            doctorCount: "20 dona",
            startDate: "11.09.2025",
            endDate: "20.12.2025"
        }
    ];

    return (
        <div className="bg-white">
            {/* Top Section: Breadcrumb & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                {/* Breadcrumb */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <Link to="/" className="hover:text-blue-600 transition-colors capitalize">{t('dashboard')}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 capitalize">{t('tariffs')}</span>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('search')}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors text-gray-700"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-gray-600">
                        <ChevronDown className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <ChevronUp className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content: Table */}
            <div className="bg-white rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                    #
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t('tariff_name')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    {t('price')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    {t('doctor_count')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    {t('start_date')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    {t('end_date')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tariffs.map((tariff) => (
                                <tr key={tariff.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {tariff.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {tariff.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                        {tariff.price}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                        {tariff.doctorCount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                        {tariff.startDate}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                        {tariff.endDate}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TariffsContent;
