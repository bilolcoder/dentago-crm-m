import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataProvider';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import DashboardContent from './components/DashboardContent';
import PaymentsContent from './components/PaymentsContent';
import LeadStatisticsContent from './components/LeadStatisticsContent';
import DailyExpensesContent from './components/DailyExpensesContent';
import DailyExpenseCategoriesContent from './components/DailyExpenseCategoriesContent';
import SmsTemplatesContent from './components/SmsTemplatesContent';
import SmsSettingsContent from './components/SmsSettingsContent';
import GeneralSettingsContent from './components/GeneralSettingsContent';
import ManualContent from './components/ManualContent';
import DocumentsContent from './components/storage/DocumentsContent';
import ProductsContent from './components/storage/ProductsContent';
import CategoriesContent from './components/storage/CategoriesContent';
import BrandsContent from './components/storage/BrandsContent';
import UnitsContent from './components/storage/UnitsContent';
import SuppliersContent from './components/storage/SuppliersContent';
import ProductUsageContent from './components/storage/ProductUsageContent';
import OrderList from './components/pages/BTS/OrderList';
import Yetkazibberish from './components/pages/BTS/yetkazibBeruvchi';
import Results from './components/Results';
import ProfileContent from './components/ProfileContent';
import AppPaymentsContent from './components/AppPaymentsContent';
import TariffsContent from './components/TariffsContent';
import Cards from './components/pages/BTS/cards';
import Addproduct from './components/pages/addMahsulot';
import MahsulotQoshish from './components/pages/BTS/MahsulotQAdd';
import MyInformation from './components/MyInformayion';
import Bemorlarim from './components/Bemorlarim';

// Dentago Store
import DentagoStore from './components/pages/dentagoStore/dentagoStore';
import Savat from './components/pages/dentagoStore/savat/Savat';
import ProductDetail from './components/pages/dentagoStore/savat/ProductDetail';
import Elonlar from './components/pages/dentagoStore/pegeslar/elonlar';
import Kurs from './components/pages/dentagoStore/pegeslar/kurs';
import Ustalar from './components/pages/dentagoStore/pegeslar/ustalar';
import Texniklar from './components/pages/dentagoStore/pegeslar/texniklar/Texniklar';
import DoctorDetail from './components/pages/dentagoStore/pegeslar/texniklar/DetailDoctor';
import MalumotBerish from './components/pages/dentagoStore/pegeslar/texniklar/MalumotBerish';

// Auth
import Login from './components/Login';
import Registration from './components/registration';

// Floating button
import { ShoppingCart } from 'lucide-react';

const FloatingButton = () => {
  const location = useLocation();

  if (location.pathname === '/DentagoStore' || location.pathname === '/dentago') {
    return (
      <button
        onClick={() => (window.location.href = '/savat')}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 flex items-center justify-center bg-[#00C2FF] rounded-full shadow-2xl hover:scale-110 transition-all text-white"
      >
        <ShoppingCart size={26} />
      </button>
    );
  }

  return (
    <a
      href="https://t.me/Denta_go_bazar"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] w-14 h-14 flex items-center justify-center bg-[#00BCE4] rounded-full shadow-2xl hover:scale-110 transition-all"
    >
      <i className="text-2xl font-bold text-white">GO</i>
    </a>
  );
};

// 🔐 AUTH + LAYOUT (HAMMASI APP.JSX ICHIDA)
const AppLayout = () => {
  const { isAuthenticated } = useData();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-white text-black">
        {/* SIDEBAR */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentPage=""
          />

          <div className="p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/dashboard" element={<DashboardContent />} />
              <Route path="/hisobot/to'lovlar" element={<PaymentsContent />} />
              <Route path="/hisobot/lead-statistika" element={<LeadStatisticsContent />} />
              <Route path="/hisobot/kunilik-xarajatlar" element={<DailyExpensesContent />} />
              <Route path="/hisobot/kunilik-xarajatlar-kategoriyalari" element={<DailyExpenseCategoriesContent />} />
              <Route path="/sms/shablonlar" element={<SmsTemplatesContent />} />
              <Route path="/sms/sozlamalar" element={<SmsSettingsContent />} />
              <Route path="/settings/general" element={<GeneralSettingsContent />} />
              <Route path="/manual" element={<ManualContent />} />

              {/* Storage */}
              <Route path="/storage/documents" element={<DocumentsContent />} />
              <Route path="/storage/products" element={<ProductsContent />} />
              <Route path="/storage" element={<ProductsContent />} />
              <Route path="/storage/categories" element={<CategoriesContent />} />
              <Route path="/storage/brands" element={<BrandsContent />} />
              <Route path="/storage/units" element={<UnitsContent />} />
              <Route path="/storage/suppliers" element={<SuppliersContent />} />
              <Route path="/storage/usage" element={<ProductUsageContent />} />

              {/* BTS */}
              <Route path="/orders" element={<OrderList />} />
              <Route path="/yetkazibberish" element={<Yetkazibberish />} />
              <Route path="/cards" element={<Cards />} />

              {/* Others */}
              <Route path="/result" element={<Results />} />
              <Route path="/profile" element={<ProfileContent />} />
              <Route path="/payments/app" element={<AppPaymentsContent />} />
              <Route path="/payments/tariffs" element={<TariffsContent />} />
              <Route path="/addproduct" element={<Addproduct />} />
              <Route path="/MahsulotQoshish" element={<MahsulotQoshish />} />
              <Route path="/my-information" element={<MyInformation />} />
              <Route path="/bemorlarim" element={<Bemorlarim />} />

              {/* Dentago Store */}
              <Route path="/DentagoStore" element={<DentagoStore />} />
              <Route path="/savat" element={<Savat />} />
              <Route path="/mahsulot/:id" element={<ProductDetail />} />
              <Route path="/elonlar" element={<Elonlar />} />
              <Route path="/kurs" element={<Kurs />} />
              <Route path="/ustalar" element={<Ustalar />} />
              <Route path="/texniklar" element={<Texniklar />} />
              <Route path="/shifokorlar" element={<DoctorDetail />} />
              <Route path="/malumot" element={<MalumotBerish />} />

              {/* 404 */}
              <Route
                path="*"
                element={<div className="text-center text-3xl mt-20 text-gray-500">404 — Sahifa topilmadi</div>}
              />
            </Routes>
          </div>
        </main>
      </div>

      <FloatingButton />
    </>
  );
};

// 🚀 ROOT APP
const App = () => {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </DataProvider>
  );
};

export default App;
