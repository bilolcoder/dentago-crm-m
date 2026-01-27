import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataProvider';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Sahifalar – guruhlab joylashtirdim
import DashboardContent from './components/DashboardContent';
import PaymentsContent from './components/PaymentsContent';
import LeadStatisticsContent from './components/LeadStatisticsContent';
import DailyExpensesContent from './components/DailyExpensesContent';
import DailyExpenseCategoriesContent from './components/DailyExpenseCategoriesContent';
import SmsTemplatesContent from './components/SmsTemplatesContent';
import SmsSettingsContent from './components/SmsSettingsContent';
import GeneralSettingsContent from './components/GeneralSettingsContent';
import ManualContent from './components/ManualContent';

// Storage
import DocumentsContent from './components/storage/DocumentsContent';
import ProductsContent from './components/storage/ProductsContent';
import CategoriesContent from './components/storage/CategoriesContent';
import BrandsContent from './components/storage/BrandsContent';
import UnitsContent from './components/storage/UnitsContent';
import SuppliersContent from './components/storage/SuppliersContent';
import ProductUsageContent from './components/storage/ProductUsageContent';

// BTS / Orders
import OrderList from './components/pages/BTS/OrderList';
import Yetkazibberish from './components/pages/BTS/yetkazibBeruvchi';
import Cards from './components/pages/BTS/cards';
import MahsulotQoshish from './components/pages/BTS/MahsulotQAdd';

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

// Boshqa sahifalar
import Results from './components/Results';
import ProfileContent from './components/ProfileContent';
import AppPaymentsContent from './components/AppPaymentsContent';
import TariffsContent from './components/TariffsContent';
import Addproduct from './components/pages/addMahsulot';
import MyInformation from './components/MyInformayion';
import Bemorlarim from './components/Bemorlarim';
import Login from './components/Login';
import Registration from './components/registration';

// Icons
import { ShoppingCart } from 'lucide-react';

const getCurrentPageTitle = (pathname) => {
  const routes = {
    '/dashboard': 'Dashboard',
    '/hisobot/to\'lovlar': 'To\'lovlar',
    '/hisobot/lead-statistika': 'Lead Statistika',
    '/hisobot/kunilik-xarajatlar': 'Kunlik Xarajatlar',
    '/storage': 'Ombor',
    '/storage/products': 'Mahsulotlar',
    '/storage/documents': 'Hujjatlar',
    '/storage/categories': 'Kategoriyalar',
    '/storage/brands': 'Brendlar',
    '/storage/units': 'O\'lchov birliklari',
    '/storage/suppliers': 'Yetkazib beruvchilar',
    '/storage/usage': 'Mahsulot sarfi',
    '/orders': 'Buyurtmalar',
    '/yetkazibberish': 'Yetkazib beruvchilar',
    '/result': 'Natijalarim',
    '/profile': 'Profil',
    '/payments/app': 'To\'lovlar',
    '/payments/tariffs': 'Tariflar',
    '/cards': 'Kartalar',
    '/addproduct': 'Mahsulot qo\'shish',
    '/MahsulotQoshish': 'Mahsulot qo\'shish',
    '/my-information': 'Mening ma\'lumotlarim',
    '/bemorlarim': 'Bemorlarim',
    '/DentagoStore': 'Dentago Store',
    '/savat': 'Savat',
    '/elonlar': 'E\'lonlar',
    '/texniklar': 'Texniklar',
    '/ustalar': 'Ustalar',
    '/kurs': 'Kurslar',
    '/shifokorlar': 'Shifokorlar',
    '/malumot': 'Ma\'lumot berish',
    '/manual': 'Qo\'llanma',
    '/settings/general': 'Sozlamalar',
    '/sms/shablonlar': 'SMS Shablonlar',
    '/sms/sozlamalar': 'SMS Sozlamalar',
  };
  return routes[pathname] || 'DentaGo Platform';
};

const FloatingButton = () => {
  const { cartCount } = useData();

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={() => window.location.href = '/savat'}
        className="relative w-14 h-14 flex items-center justify-center bg-[#00C2FF] rounded-full shadow-2xl hover:scale-110 transition-all text-white"
        title="Savatga o'tish"
      >
        <ShoppingCart size={26} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[22px] h-5 flex items-center justify-center rounded-full px-1.5 shadow-lg border-2 border-white">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};
const ProtectedLayout = () => {
  const { isAuthenticated } = useData();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentPage = getCurrentPageTitle(location.pathname);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-white text-black">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <Header
            setIsSidebarOpen={setIsSidebarOpen}
            isSidebarOpen={isSidebarOpen}
            currentPage={currentPage}
          />
          <div className="p-4 md:p-6 lg:p-8">
            <Routes>
              {/* Asosiy */}
              <Route path="/dashboard" element={<DashboardContent />} />

              {/* Hisobotlar */}
              <Route path="/hisobot/to'lovlar" element={<PaymentsContent />} />
              <Route path="/hisobot/lead-statistika" element={<LeadStatisticsContent />} />
              <Route path="/hisobot/kunilik-xarajatlar" element={<DailyExpensesContent />} />
              <Route
                path="/hisobot/kunilik-xarajatlar-kategoriyalari"
                element={<DailyExpenseCategoriesContent />}
              />

              {/* SMS */}
              <Route path="/sms/shablonlar" element={<SmsTemplatesContent />} />
              <Route path="/sms/sozlamalar" element={<SmsSettingsContent />} />

              {/* Sozlamalar */}
              <Route path="/settings/general" element={<GeneralSettingsContent />} />
              <Route path="/manual" element={<ManualContent />} />

              {/* Ombor / Storage */}
              <Route path="/storage" element={<ProductsContent />} />
              <Route path="/storage/products" element={<ProductsContent />} />
              <Route path="/storage/documents" element={<DocumentsContent />} />
              <Route path="/storage/categories" element={<CategoriesContent />} />
              <Route path="/storage/brands" element={<BrandsContent />} />
              <Route path="/storage/units" element={<UnitsContent />} />
              <Route path="/storage/suppliers" element={<SuppliersContent />} />
              <Route path="/storage/usage" element={<ProductUsageContent />} />

              {/* Buyurtmalar / BTS */}
              <Route path="/orders" element={<OrderList />} />
              <Route path="/yetkazibberish" element={<Yetkazibberish />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/MahsulotQoshish" element={<MahsulotQoshish />} />

              {/* Dentago Store */}
              <Route path="/DentagoStore" element={<DentagoStore />} />
              <Route path="/savat" element={<Savat />} />
              <Route path="/mahsulot/:id" element={<ProductDetail />} />

              {/* Boshqa sahifalar */}
              <Route path="/addproduct" element={<Addproduct />} />
              <Route path="/result" element={<Results />} />
              <Route path="/profile" element={<ProfileContent />} />
              <Route path="/payments/app" element={<AppPaymentsContent />} />
              <Route path="/payments/tariffs" element={<TariffsContent />} />
              <Route path="/my-information" element={<MyInformation />} />
              <Route path="/bemorlarim" element={<Bemorlarim />} />

              {/* Dentago Store qo'shimcha sahifalar */}
              <Route path="/elonlar" element={<Elonlar />} />
              <Route path="/kurs" element={<Kurs />} />
              <Route path="/ustalar" element={<Ustalar />} />
              <Route path="/texniklar" element={<Texniklar />} />
              <Route path="/shifokorlar/:id" element={<DoctorDetail />} />
              <Route path="/malumot" element={<MalumotBerish />} />

              {/* settings general */}
              {/* <Route path="/settings/general" element={<GeneralSettingsContent />} /> */}

              {/* 404 */}
              <Route path="*" element={<div className="text-center text-3xl mt-20 text-gray-500">404 — Sahifa topilmadi</div>} />
            </Routes>
          </div>
        </main>
      </div>

      <FloatingButton />
    </>
  );
};

const App = () => {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </DataProvider>
  );
};

export default App;