import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import { MdStorefront, MdDeleteSweep } from 'react-icons/md';
import { RiSecurePaymentLine } from 'react-icons/ri';
import PurchaseModal from '../../../modals/PurchaseModal';

const BASE_URL = "https://app.dentago.uz";

// Token olish
const getToken = () => localStorage.getItem('accessToken');

// Auth tekshirish
const checkAuth = (navigate) => {
  const token = getToken();
  if (!token) {
    navigate('/login');
    return false;
  }
  return true;
};

// ────────────────────────────────────────────────
// API: mahsulotni savatga qo'shish / miqdorni o'zgartirish
// ────────────────────────────────────────────────
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
      return { success: true, message: "Mahsulot savatga qo'shildi", data: response.data };
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

// ────────────────────────────────────────────────
// API: butun savatni tozalash
// ────────────────────────────────────────────────
export const clearCartAPI = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error("Token topilmadi");

    const response = await axios.post(
      `${BASE_URL}/api/cart/clear`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.success) {
      return { success: true, message: "Savat tozalandi" };
    } else {
      return { success: false, message: response.data.message || "Xato yuz berdi" };
    }
  } catch (error) {
    console.error("clearCartAPI xatosi:", error);
    let message = "Xato yuz berdi";
    if (error.response?.status === 401) message = "Sessiya muddati tugagan. Iltimos, qayta kiring.";
    else if (error.code === 'ECONNABORTED') message = "Server javob bermadi.";
    else message = error.message || "Internet aloqasi muammosi";

    return { success: false, message };
  }
};

// AddToCartButton komponenti
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
      className={`bg-[#7000FF] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#5c00cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {adding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Qo'shilmoqda...
        </>
      ) : (
        children || (
          <>
            <FaPlus size={14} /> Savatga qo'shish
          </>
        )
      )}
    </button>
  );
};

// ────────────────────────────────────────────────
// ASOSIY SAVAT KOMPONENTI
// ────────────────────────────────────────────────
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
      } else {
        console.log(result.message);
      }
    } catch (err) {
      console.error("Miqdor yangilashda xato:", err);
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
    } catch (error) {
      console.error("O'chirishda xato:", error);
      fetchCartFromAPI(false); // agar xato bo'lsa sinxronlashtirish
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!checkAuth(navigate)) return;

    if (!window.confirm("Savatdagi barcha mahsulotlarni o‘chirmoqchimisiz? Bu amal qaytarib bo‘lmaydi.")) {
      return;
    }

    try {
      setClearing(true);
      const result = await clearCartAPI();

      if (result.success) {
        setApiCartItems([]);
        setError(null);
      } else {
        alert(result.message || "Savat tozalanmadi");
      }
    } catch (err) {
      console.error("Savat tozalashda xato:", err);
      alert("Xatolik yuz berdi");
    } finally {
      setClearing(false);
    }
  };

  const handlePurchase = async (purchaseData) => {
    try {
      console.log('Barcha mahsulotlar sotib olinmoqda:', apiCartItems);
      console.log('Purchase ma\'lumotlari:', purchaseData);

      // Bu yerda real checkout API so'rovi bo'lishi kerak
      // Hozircha simulyatsiya
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Muvaffaqiyatdan keyin savatni tozalash
      const token = getToken();
      if (token && apiCartItems.length > 0) {
        await Promise.all(apiCartItems.map(item =>
          axios.delete(`${BASE_URL}/api/cart/item/${item.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          })
        ));
      }

      await fetchCartFromAPI(false);
      console.log(`${apiCartItems.length} ta mahsulot muvaffaqiyatli sotib olindi!`);

    } catch (error) {
      console.error('Sotib olish xatosi:', error);
    }
  };

  const totalCount = apiCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = apiCartItems.reduce((acc, item) => acc + item.narxi * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#00BCE4] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Savat yuklanmoqda</h2>
        <p className="text-sm text-gray-500">Bir necha soniya vaqt olishi mumkin</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">😕</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Xatolik yuz berdi</h2>
        <p className="text-gray-500 text-center mb-8 max-w-sm">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => fetchCartFromAPI()}
            className="px-6 py-3 bg-[#7000FF] text-white rounded-xl font-medium hover:bg-[#5c00cc] transition-colors"
          >
            Qayta urinish
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    );
  }

  if (apiCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="py-3 px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaChevronLeft size={18} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Savat</h1>
            </div>
          </div>
        </div>

        <div className="py-12 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-gray-50">
              <IoCartOutline size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Savat bo'sh</h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Savatingizga mahsulot qo'shing va xarid qilishni boshlang
            </p>
            <button
              onClick={() => navigate('/DentagoStore')}
              className="w-full max-w-xs py-4 bg-[#00BBE3] text-white rounded-xl font-semibold hover:bg-[#0099c2] transition-colors"
            >
              Mahsulotlar katalogi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaChevronLeft size={18} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Savat</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {apiCartItems.length} ta mahsulot
              </span>

              <button
                onClick={handleClearCart}
                disabled={clearing || apiCartItems.length === 0}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-40 transition-colors"
                title="Butun savatni tozalash"
              >
                {clearing ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MdDeleteSweep size={18} />
                    <span className="hidden sm:inline">Tozalash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mahsulotlar */}
      <div className="space-y-3 p-4">
        {apiCartItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 shadow-sm relative"
          >
            <div className="flex gap-3">
              <div
                className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer"
                onClick={() => navigate(`/mahsulot/${item.product_id}`)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nomi}
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Rasm yo‘q
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-[#7000FF]"
                  onClick={() => navigate(`/mahsulot/${item.product_id}`)}
                >
                  {item.nomi}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                  <MdStorefront size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Dentago</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="font-bold text-base text-gray-900">
                      {(item.narxi * item.quantity).toLocaleString()} so'm
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        {item.narxi.toLocaleString()} so'm × {item.quantity}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      disabled={updating[item.id] || item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg disabled:opacity-50 transition-colors"
                    >
                      {updating[item.id] ? (
                        <div className="w-3 h-3 border-2 border-[#00BCE4] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaMinus size={10} />
                      )}
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      disabled={updating[item.id]}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg disabled:opacity-50 transition-colors"
                    >
                      {updating[item.id] ? (
                        <div className="w-3 h-3 border-2 border-[#00BCE4] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaPlus size={10} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemoveFromCart(item.id)}
                disabled={removing[item.id]}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                {removing[item.id] ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaTrash size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pastki panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10 lg:left-72">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Jami to'lov</p>
              <p className="font-bold text-lg text-gray-900">
                {totalAmount.toLocaleString()} so'm
              </p>
              {totalCount > 0 && (
                <p className="text-xs text-gray-500">
                  {totalCount} ta mahsulot
                </p>
              )}
            </div>

            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              disabled={totalCount === 0}
              className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all ${
                totalCount > 0
                  ? 'bg-[#00BCE4] text-white hover:bg-[#00a3c2] active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Sotib olish
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 mt-2">
            <RiSecurePaymentLine size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Xavfsiz to'lov</span>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        totalAmount={totalAmount}
        items={apiCartItems}
        itemsCount={totalCount}
        onConfirm={handlePurchase}
      />
    </div>
  );
};

export default Savat;
