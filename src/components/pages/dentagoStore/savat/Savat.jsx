import React, { useState, useEffect } from 'react';
import { useCart } from '../../.././../components/pages/dentagoStore/CartContent';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaSyncAlt, FaTruck, FaStore, FaShieldAlt, FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import PurchaseModal from '../../../modals/PurchaseModal';

const BASE_URL = "https://app.dentago.uz";

// Token olish funksiyasi
const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Auth tekshiruvi
const checkAuth = (navigate) => {
  const token = getToken();
  if (!token) {
    navigate('/login');
    return false;
  }
  return true;
};

// API orqali savatga mahsulot qo'shish (boshqa fayllarda ishlatiladi)
export const addToCartAPI = async (productId, productName, productPrice, quantity = 1) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Token topilmadi");

    const cartData = {
      product_id: productId,
      quantity: quantity,
      price: productPrice
    };

    const response = await axios.post(`${BASE_URL}/api/cart/add`, cartData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
      
    if (response.data.success) {
      return { success: true, message: "Mahsulot savatga muvaffaqiyatli qo'shildi!", data: response.data };
    } else {
      return { success: false, message: response.data.message || "Noma'lum xato" };
    }
  } catch (error) {
    console.error("addToCartAPI xatosi:", error);
    let message = "Xato yuz berdi";
    if (error.response?.status === 401) message = "Sessiya muddati tugagan. Iltimos, qayta kiring.";
    else if (error.code === 'ECONNABORTED') message = "Serverga ulanish vaqti o'tdi.";
    else if (error.request) message = "Internet aloqasini tekshiring.";
    else message = error.message;

    return { success: false, message };
  }
};

// AddToCartButton komponenti — Savatdan tashqarida aniqlangan va export qilingan
export const AddToCartButton = ({ productId, productName, productPrice, quantity = 1, className = "", children }) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!checkAuth(navigate)) return;

    setAdding(true);
    const result = await addToCartAPI(productId, productName, productPrice, quantity);
    console.log(result.message);

    if (result.message.includes("sessiya") || result.message.includes("kiring")) {
      navigate('/login');
    }
    setAdding(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className={`bg-[#00C2FF] text-white px-4 py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0099DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {adding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Qo'shilmoqda...
        </>
      ) : (
        children || (
          <>
            <FaPlus /> Savatga qo'shish
          </>
        )
      )}
    </button>
  );
};

// Asosiy Savat sahifasi komponenti
const Savat = () => {
  const [apiCartItems, setApiCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState({});
  const [clearing, setClearing] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartFromAPI();
  }, []);

  const handleBackMinus = () => {
    navigate(-1);
  }

  const fetchCartFromAPI = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = getToken();
      if (!token) {
        setError("Iltimos, avval tizimga kiring!");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });

      if (response.data.success && response.data.data) {
        const items = response.data.data.items || [];
        const formattedItems = items.map(item => ({
          id: item._id,
          product_id: item.product_id?._id || item.productSnapshot?._id || item.product_id,
          nomi: item.productSnapshot?.name || item.product_id?.name || "Nomsiz mahsulot",
          narxi: item.price || item.productSnapshot?.price || 0,
          quantity: item.quantity || 1,
          image: item.productSnapshot?.imageUrl && item.productSnapshot.imageUrl.length > 0
            ? `${BASE_URL}/images/${item.productSnapshot.imageUrl[0]}`
            : "",
          category: item.productSnapshot?.category || "",
          company: item.productSnapshot?.company || ""
        }));

        setApiCartItems(formattedItems);
        setError(null);
      } else {
        setError("Savat ma'lumotlarini olishda xato");
      }
    } catch (error) {
      console.error("Savat yuklash xatosi:", error);
      if (error.response?.status === 401) {
        setError("Sessiya muddati tugagan. Iltimos, qayta kiring.");
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        setError("Savat yuklanmadi: " + (error.message || "Noma'lum xato"));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  const handleUpdateQuantity = async (itemId, change) => {
    if (!checkAuth(navigate)) return;

    const item = apiCartItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.quantity <= 1 && change === -1) return;

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));

      const result = await addToCartAPI(
        item.product_id,
        item.nomi,
        item.narxi,
        change
      );

      if (result.success) {
        await fetchCartFromAPI(false);
        // updateQuantity(itemId, item.quantity + change);
      } else {
        console.log(result.message);
      }
    } catch (err) {
      console.error("Yangilashda xato:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };
  
  const handleRemoveFromCart = async (itemId) => {
    if (!checkAuth(navigate)) return;

    try {
      setRemoving(prev => ({ ...prev, [itemId]: true }));
      setApiCartItems(prev => prev.filter(i => i.id !== itemId));

      const token = getToken();
      if (!token) return;

      await axios.delete(`${BASE_URL}/api/cart/item/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });

      // if (cartItems.find(i => i.id === itemId)) {
      //   removeFromCart(itemId);
      // }
    } catch (error) {
      fetchCartFromAPI(false);
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!checkAuth(navigate)) return;
    if (apiCartItems.length === 0) return;

    try {
      setClearing(true);
      const oldItems = [...apiCartItems];
      setApiCartItems([]);

      const token = getToken();
      if (!token) return;

      await Promise.all(oldItems.map(item =>
        axios.delete(`${BASE_URL}/api/cart/item/${item.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        })
      ));

      // clearCart();
    } catch (error) {
      fetchCartFromAPI(false);
    } finally {
      setClearing(false);
    }
  };

  const jamiSumma = apiCartItems.reduce((acc, item) => acc + item.narxi * item.quantity, 0);
  const jamiTovarlar = apiCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const yetkazibBerishNarxi = jamiSumma > 0 ? 0 : 0; // Bepul yetkazish
  const chegirma = 0; // Agar chegirma bo'lsa qo'shish mumkin

  const handlePurchase = async (purchaseData) => {
    try {
      console.log('Purchase data:', purchaseData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await handleClearCart();
    } catch (error) {
      console.error('Purchase error:', error);
      console.log('Xato yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center">
        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-3 sm:border-4 border-[#00C2FF] border-t-transparent mb-3 sm:mb-4"></div>
        <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800">Savat yuklanmoqda...</h2>
        <p className="text-gray-500 text-xs sm:text-sm">Bu bir necha soniya vaqt olishi mumkin</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center">
        <div className="text-red-500 text-3xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
        <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800">Xato yuz berdi</h2>
        <p className="text-gray-600 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap justify-center w-full sm:w-auto">
          <button onClick={() => fetchCartFromAPI()} className="bg-[#00C2FF] cursor-pointer text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0099DD] transition-colors text-sm sm:text-base w-full sm:w-auto">
            <FaSyncAlt className="text-sm" /> Qayta yuklash
          </button>
          <button onClick={() => navigate('/login')} className="bg-gray-200 cursor-pointer text-gray-800 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold hover:bg-gray-300 transition-colors text-sm sm:text-base w-full sm:w-auto">
            Kirish
          </button>
          <button onClick={() => navigate('/')} className="bg-green-500 cursor-pointer text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto">
            Asosiy sahifaga
          </button>
        </div>
      </div>
    );
  }

  if (apiCartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center">
        <div className="bg-gray-100 p-6 sm:p-8 rounded-full mb-4 sm:mb-6 text-gray-300">
          <FaShoppingCart size={60} className="sm:w-20 sm:h-20" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800">Savatda hali hech narsa yo'q</h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-md">
          Mahsulotlarni ko'rib chiqing va savatingizni to'ldiring!
        </p>
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center w-full sm:w-auto">
          <button onClick={() => navigate('/DentagoStore')} className="bg-[#00C2FF] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#0099DD] transition-colors text-sm sm:text-base w-full sm:w-auto">
            Mahsulotlarga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-28 md:pb-32">
      {/* Header - Responsive */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handleBackMinus} 
                className='p-1.5 sm:p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors'
              >
                <ChevronLeft size={20} className='sm:w-6 sm:h-6 text-gray-700' />
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Korzinka</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-gray-500">{jamiTovarlar} ta</span>
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="text-red-500 text-xs sm:text-sm cursor-pointer hover:text-red-700 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-200 rounded-full hover:bg-red-50 flex items-center gap-1 sm:gap-1.5 disabled:opacity-50 transition-colors"
              >
                {clearing ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <>
                    <FaTrash size={10} className="sm:w-3 sm:h-3" /> 
                    <span className="hidden xs:inline">Tozalash</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => fetchCartFromAPI(true)} 
                className="text-gray-500 cursor-pointer hover:text-[#00C2FF] p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaSyncAlt size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Yetkazib berish ma'lumotlari - Responsive */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <FaTruck className="text-[#00C2FF] text-base sm:text-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800">Yetkazib berish: </span>
              <span className="text-gray-600">Ertaga, 24-fevral</span>
            </div>
            <span className="text-green-600 font-medium text-xs sm:text-sm flex-shrink-0">Bepul</span>
          </div>
        </div>

        {/* Mahsulotlar ro'yxati - Responsive */}
        <div className="space-y-2 sm:space-y-3">
          {apiCartItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 relative hover:shadow-md transition-all">
              {/* O'chirish tugmasi */}
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                disabled={removing[item.id]}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 cursor-pointer text-gray-400 hover:text-red-500 p-1.5 disabled:opacity-50 z-10 rounded-full hover:bg-red-50 transition-colors"
              >
                {removing[item.id] ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                )}
              </button>

              {/* Mahsulot qatori - Responsive */}
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                {/* Rasm - Responsive */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden cursor-pointer shrink-0 border border-gray-100 hover:border-[#00C2FF] transition-colors"
                  onClick={() => navigate(`/mahsulot/${item.product_id}`)}
                >
                  <img 
                    src={item.image} 
                    alt={item.nomi} 
                    className="w-full h-full object-contain p-1 sm:p-1.5 md:p-2" 
                    loading="lazy" 
                  />
                </div>

                {/* Mahsulot ma'lumotlari - Responsive */}
                <div className="flex-1 min-w-0 pr-6 sm:pr-7 md:pr-8">
                  <h3
                    className="font-medium text-gray-800 text-xs sm:text-sm leading-tight cursor-pointer hover:text-[#00C2FF] line-clamp-2 mb-1"
                    onClick={() => navigate(`/mahsulot/${item.product_id}`)}
                  >
                    {item.nomi}
                  </h3>
                  
                  {/* Kategoriya va kompaniya - Responsive */}
                  {item.category && (
                    <p className="text-gray-500 text-[10px] sm:text-xs mb-1.5 truncate">
                      {item.category}{item.company && ` • ${item.company}`}
                    </p>
                  )}

                  {/* Sotuvchi ma'lumoti - Responsive */}
                  <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                    <FaStore className="text-gray-400 text-[10px] sm:text-xs" />
                    <span className="text-[10px] sm:text-xs text-gray-500">Sotuvchi: Dentago</span>
                  </div>

                  {/* Narx va miqdor - Responsive */}
                  <div className="flex flex-col xs:flex-row xs:items-end xs:justify-between gap-1 xs:gap-2 mt-1 sm:mt-2">
                    <div>
                      <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">
                        {(item.narxi * item.quantity).toLocaleString()} so'm
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {item.narxi.toLocaleString()} so'm × {item.quantity}
                        </p>
                      )}
                    </div>

                    {/* Miqdor tanlagich - Responsive */}
                    <div className="flex items-center bg-[#F2F3F5] rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 gap-1.5 sm:gap-2 md:gap-3 self-start xs:self-auto">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={updating[item.id] || item.quantity <= 1}
                        className="text-[#00C2FF] cursor-pointer hover:bg-white rounded-md p-1 sm:p-1.5 disabled:opacity-50 transition-colors"
                      >
                        {updating[item.id] ? (
                          <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-[#00C2FF] border-t-transparent"></div>
                        ) : (
                          <FaMinus size={8} className="sm:w-2.5 sm:h-2.5" />
                        )}
                      </button>
                      <span className="font-bold text-xs sm:text-sm min-w-5 sm:min-w-6 md:min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        disabled={updating[item.id]}
                        className="text-[#00C2FF] cursor-pointer hover:bg-white rounded-md p-1 sm:p-1.5 disabled:opacity-50 transition-colors"
                      >
                        {updating[item.id] ? (
                          <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-[#00C2FF] border-t-transparent"></div>
                        ) : (
                          <FaPlus size={8} className="sm:w-2.5 sm:h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* To'lov ma'lumotlari - Responsive */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4 shadow-sm border border-gray-100">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Mahsulotlar ({jamiTovarlar} ta)</span>
              <span className="font-medium text-gray-800">{jamiSumma.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Yetkazib berish</span>
              <span className="text-green-600 font-medium">Bepul</span>
            </div>
            {chegirma > 0 && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Chegirma</span>
                <span className="text-red-500 font-medium">-{chegirma.toLocaleString()} so'm</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm sm:text-base">Jami:</span>
                <span className="font-bold text-base sm:text-lg md:text-xl text-[#00C2FF]">{jamiSumma.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Panel - Responsive */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 sm:flex-none">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Jami to'lov:</div>
              <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-[#00C2FF] truncate max-w-[120px] sm:max-w-none">
                {jamiSumma.toLocaleString()} so'm
              </div>
            </div>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex-1 sm:flex-1 md:max-w-sm py-2.5 sm:py-3 md:py-3.5 cursor-pointer bg-[#00C2FF] text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-md hover:bg-[#0099DD] active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={clearing}
            >
              {clearing ? 'Kutilmoqda...' : 'Sotib olish'}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        totalAmount={jamiSumma}
        items={apiCartItems}
        itemsCount={jamiTovarlar}
        onConfirm={handlePurchase}
      />
    </div>
  );
};

export default Savat;