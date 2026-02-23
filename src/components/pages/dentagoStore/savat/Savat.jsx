import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import { MdStorefront } from 'react-icons/md';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';
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

// API orqali savatga mahsulot qo'shish
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

// Asosiy Savat sahifasi komponenti
const Savat = () => {
  const [apiCartItems, setApiCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartFromAPI();
  }, []);

  // API dan savatni yuklash
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

        // Default barcha itemlarni tanlash
        const initialSelected = {};
        formattedItems.forEach(item => {
          initialSelected[item.id] = true;
        });
        setSelectedItems(initialSelected);
        setSelectAll(true);

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

  // Item tanlash
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev, [itemId]: !prev[itemId] };

      // Check if all items are selected
      const allSelected = apiCartItems.every(item => newSelected[item.id]);
      setSelectAll(allSelected);

      return newSelected;
    });
  };

  // Barchasini tanlash
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    const newSelected = {};
    apiCartItems.forEach(item => {
      newSelected[item.id] = newSelectAll;
    });
    setSelectedItems(newSelected);
    setSelectAll(newSelectAll);
  };

  // Miqdorni yangilash
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
      console.error("Yangilashda xato:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Savatdan o'chirish
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

      // Update selected items
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[itemId];
        return newSelected;
      });

    } catch (error) {
      fetchCartFromAPI(false);
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Tanlangan itemlarni o'chirish
  const handleRemoveSelected = async () => {
    if (!checkAuth(navigate)) return;

    const selectedIds = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) return;

    try {
      setClearing(true);

      const token = getToken();
      if (!token) return;

      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/api/cart/item/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        })
      ));

      await fetchCartFromAPI(false);
    } catch (error) {
      fetchCartFromAPI(false);
    } finally {
      setClearing(false);
    }
  };

  const [clearing, setClearing] = useState(false);

  // Tanlangan itemlar soni va summasi
  const selectedItemsList = apiCartItems.filter(item => selectedItems[item.id]);
  const selectedCount = selectedItemsList.reduce((acc, item) => acc + item.quantity, 0);
  const selectedTotal = selectedItemsList.reduce((acc, item) => acc + item.narxi * item.quantity, 0);

  // Sotib olish
  const handlePurchase = async (purchaseData) => {
    try {
      console.log('Purchase data:', purchaseData);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Faqat tanlangan itemlarni o'chirish
      const selectedIds = Object.entries(selectedItems)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);

      const token = getToken();
      if (token && selectedIds.length > 0) {
        await Promise.all(selectedIds.map(id =>
          axios.delete(`${BASE_URL}/api/cart/item/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          })
        ));
      }

      await fetchCartFromAPI(false);
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-3 border-[#00BCE4] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Savat yuklanmoqda</h2>
        <p className="text-sm text-gray-500">Bir necha soniya vaqt olishi mumkin</p>
      </div>
    );
  }

  // Error state
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

  // Empty cart state - Uzum style
  if (apiCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="py-3">
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

        <div className="py-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <IoCartOutline size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Savat bo'sh</h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Savatingizga mahsulot qo'shing va xarid qilishni boshlang
            </p>
            <button
              onClick={() => navigate('/DentagoStore')}
              className="w-full max-w-xs py-4 bg-[#7000FF] text-white rounded-xl font-semibold hover:bg-[#5c00cc] transition-colors"
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
      {/* Header - Uzum style */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="py-3">
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
            <span className="text-sm text-gray-500">{apiCartItems.length} ta mahsulot</span>
          </div>
        </div>
      </div>

      {/* Delivery info - Uzum style */}
      {/* <div className="py-3">
        <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-[#7000FF] bg-opacity-10 rounded-full flex items-center justify-center">
            <TbTruckDelivery size={20} className="text-[#7000FF]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Yetkazib berish bepul</p>
            <p className="text-xs text-gray-500">Toshkent bo'ylab ertaga yetkaziladi</p>
          </div>
        </div>
      </div> */}

      {/* Select all - Uzum style */}
      <div className="my-5">
        <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-3"
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              selectAll
                ? 'bg-[#00BCE4] border-[#00BCE4]'
                : 'border-gray-300 bg-white'
            }`}>
              {selectAll && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">Barchasini tanlash</span>
          </button>

          {Object.values(selectedItems).filter(Boolean).length > 0 && (
            <button
              onClick={handleRemoveSelected}
              className="text-sm text-red-500 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              O'chirish
            </button>
          )}
        </div>
      </div>

      {/* Products list - Uzum style */}
      <div className="space-y-3">
        {apiCartItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 shadow-sm relative"
          >
            <div className="flex gap-3">
              {/* Checkbox */}
              <button
                onClick={() => handleSelectItem(item.id)}
                className="mt-1 flex-shrink-0"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selectedItems[item.id]
                    ? 'bg-[#00BCE4] border-[#00BCE4]'
                    : 'border-gray-300 bg-white'
                }`}>
                  {selectedItems[item.id] && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>

              {/* Product image */}
              <div
                className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer"
                onClick={() => navigate(`/mahsulot/${item.product_id}`)}
              >
                <img
                  src={item.image}
                  alt={item.nomi}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-[#7000FF]"
                  onClick={() => navigate(`/mahsulot/${item.product_id}`)}
                >
                  {item.nomi}
                </h3>

                {/* Seller */}
                <div className="flex items-center gap-1 mb-2">
                  <MdStorefront size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Dentago</span>
                </div>

                {/* Price and quantity */}
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

                  {/* Quantity selector - Uzum style */}
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

              {/* Delete button */}
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

      {/* Bottom fixed panel - Uzum style */}
      <div className="fixed bottom-0 lg:left-70 sm:left-0 max-sm:left-0 md:left-70 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10
">
        <div className="px-10 py-3">
          <div className="flex items-center gap-3">
            {/* Total */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Jami to'lov</p>
              <p className="font-bold text-lg text-gray-900">
                {selectedTotal.toLocaleString()} so'm
              </p>
              {selectedCount > 0 && (
                <p className="text-xs text-gray-500">
                  {selectedCount} ta mahsulot
                </p>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              disabled={selectedCount === 0}
              className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all ${
                selectedCount > 0
                  ? 'bg-[#00BCE4] text-white hover:bg-[#00a3c2] active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Sotib olish
            </button>
          </div>

          {/* Secure payment info */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <RiSecurePaymentLine size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Xavfsiz to'lov</span>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        totalAmount={selectedTotal}
        items={selectedItemsList}
        itemsCount={selectedCount}
        onConfirm={handlePurchase}
      />
    </div>
  );
};

export default Savat;
