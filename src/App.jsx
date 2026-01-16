import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import DentagoStore from './components/pages/dentagoStore/dentagoStore';
import Savat from './components/pages/dentagoStore/savat/Savat';

import Login from './components/Login';
import Registration from './components/registration';

// Lucide-react dan savat ikonkasi
import { ShoppingCart } from 'lucide-react';

const FloatingButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // DentagoStore sahifasida savatcha, qolgan hamma joyda Telegram GO
  const isDentagoStore = location.pathname === '/DentagoStore';

  if (isDentagoStore) {
    return (
      <button
        onClick={() => navigate('/savat')}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 flex items-center justify-center bg-[#00C2FF] rounded-full shadow-2xl hover:scale-110 transition-all text-white"
        title="Savatga o'tish"
      >
        <ShoppingCart size={26} />
      </button>
    );
  }

  // Telegram GO tugmasi (boshqa barcha sahifalarda)
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

const TelegramButton = () => (
  <a
    href="https://t.me/Denta_go_bazar"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-[9999] w-14 h-14 flex items-center justify-center bg-[#00BCE4] rounded-full shadow-2xl hover:scale-110 transition-all"
  >
    <i className="text-2xl font-bold text-white">GO</i>
  </a>
);

const ProtectedLayout = () => {
  const { isAuthenticated, theme, t } = useData();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;

  const getCurrentPageName = () => {
    if (path === '/' || path === '/dashboard') return t('main') || 'Bosh sahifa';
    if (path === "/hisobot/to'lovlar") return t('payments') || "To'lovlar";
    if (path === '/hisobot/lead-statistika') return t('lead_statistics') || 'Lead Statistika';
    if (path === '/hisobot/kunilik-xarajatlar') return t('daily_expenses') || 'Kunlik xarajatlar';
    if (path === '/hisobot/kunilik-xarajatlar-kategoriyalari') return t('daily_expense_categories') || 'Xarajat kategoriyalari';
    if (path === '/sms/shablonlar') return t('sms_templates') || 'SMS Shablonlar';
    if (path === '/sms/sozlamalar') return t('sms_settings') || 'SMS Sozlamalari';
    if (path === '/settings/general') return t('general_settings') || 'Umumiy sozlamalar';
    if (path === '/manual') return t('manual') || "Qo'llanma";
    if (path === '/storage/documents') return t('documents') || 'Hujjatlar';
    if (path === '/storage/products' || path === '/storage') return t('products') || 'Mahsulotlar';
    if (path === '/storage/categories') return t('categories') || 'Kategoriyalar';
    if (path === '/storage/brands') return t('brands') || 'Brendlar';
    if (path === '/storage/units') return t('units') || "O'lchov birliklari";
    if (path === '/storage/suppliers') return t('suppliers') || 'Yetkazib beruvchilar';
    if (path === '/storage/usage') return t('product_usage') || 'Mahsulot sarfi';
    if (path === '/orders') return t('orders_bts') || 'Buyurtmalar';
    if (path === '/profile') return t('my_profile') || 'Mening profilim';
    if (path === '/payments/app') return t('app_payments') || "To'lovlar";
    if (path === '/payments/tariffs') return t('tariffs') || 'Tariflar';
    if (path === '/yetkazibberish') return 'Yetkazib berish';
    if (path === '/result') return t('my_results') || 'Natijalarim';
    if (path === '/cards') return 'Kartalar';
    if (path === '/addproduct') return "Mahsulot qo'shish";
    if (path === '/MahsulotQoshish') return "Mahsulot qo'shish";
    if (path === '/my-information') return t('my_information') || "Ma'lumotlarim";
    if (path === '/bemorlarim') return t('bemorlarim') || 'Bemorlarim';
    return 'Sahifa';
  };

  const renderContent = () => {
    if (path === '/' || path === '/dashboard') return <DashboardContent />;
    if (path === "/hisobot/to'lovlar") return <PaymentsContent />;
    if (path === '/hisobot/lead-statistika') return <LeadStatisticsContent />;
    if (path === '/hisobot/kunilik-xarajatlar') return <DailyExpensesContent />;
    if (path === '/hisobot/kunilik-xarajatlar-kategoriyalari') return <DailyExpenseCategoriesContent />;
    if (path === '/sms/shablonlar') return <SmsTemplatesContent />;
    if (path === '/sms/sozlamalar') return <SmsSettingsContent />;
    if (path === '/settings/general') return <GeneralSettingsContent />;
    if (path === '/manual') return <ManualContent />;
    if (path === '/storage/documents') return <DocumentsContent />;
    if (path === '/storage/products' || path === '/storage') return <ProductsContent />;
    if (path === '/storage/categories') return <CategoriesContent />;
    if (path === '/storage/brands') return <BrandsContent />;
    if (path === '/storage/units') return <UnitsContent />;
    if (path === '/storage/suppliers') return <SuppliersContent />;
    if (path === '/storage/usage') return <ProductUsageContent />;
    if (path === '/orders') return <OrderList />;
    if (path === '/profile') return <ProfileContent />;
    if (path === '/payments/app') return <AppPaymentsContent />;
    if (path === '/payments/tariffs') return <TariffsContent />;
    if (path === '/yetkazibberish') return <Yetkazibberish />;
    if (path === '/result') return <Results />;
    if (path === '/cards') return <Cards />;
    if (path === '/addproduct') return <Addproduct />;
    if (path === '/MahsulotQoshish') return <MahsulotQoshish />;
    if (path === '/my-information') return <MyInformation />;
    if (path === '/bemorlarim') return <Bemorlarim />;
    if (path === '/DentagoStore') return <DentagoStore />;
    if (path === '/savat') return <Savat />;

    return <div className="text-center text-3xl mt-20 text-gray-500">404 — Sahifa topilmadi</div>;
  };

  return (
    <>
      <div className={`flex h-screen overflow-hidden bg-white text-black`}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            currentPage={getCurrentPageName()}
          />

          <div className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
      <FloatingButton />
    </>
  );
};

const LoginPage = () => (
  <>
    <Login />
    <TelegramButton />
  </>
);

const RegisterPage = () => (
  <>
    <Registration />
    <TelegramButton />
  </>
);

const HomeRedirect = () => {
  const { isAuthenticated } = useData();

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

const App = () => {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </DataProvider>
  );
};

export default App;