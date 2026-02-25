import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import { MdStorefront } from 'react-icons/md';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { X, ShoppingCart, User, MapPin, Navigation, Smartphone, Shield } from 'lucide-react';
import PaymeSvg from '../../../../assets/payme.png';
import ClickSvg from '../../../../assets/click.png';
import RahmatSvg from '../../../../assets/rahmat.png';

const BASE_URL = "https://app.dentago.uz";

const getToken = () => localStorage.getItem('accessToken');

const checkAuth = (navigate) => {
  const token = getToken();
  if (!token) { navigate('/login'); return false; }
  return true;
};

export const addToCartAPI = async (productId, productName, productPrice, quantity = 1) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Token topilmadi");

    const response = await axios.post(`${BASE_URL}/api/cart/add`, {
      product_id: productId,
      quantity: quantity,
      price: productPrice
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.data.success) {
      return { success: true, message: "Mahsulot savatga muvaffaqiyatli qo'shildi!", data: response.data };
    } else {
      return { success: false, message: response.data.message || "Noma'lum xato" };
    }
  } catch (error) {
    let message = "Xato yuz berdi";
    if (error.response?.status === 401) message = "Sessiya muddati tugagan. Iltimos, qayta kiring.";
    else if (error.code === 'ECONNABORTED') message = "Serverga ulanish vaqti o'tdi.";
    else if (error.request) message = "Internet aloqasini tekshiring.";
    else message = error.message;
    return { success: false, message };
  }
};

export const AddToCartButton = ({ productId, productName, productPrice, quantity = 1, className = "", children }) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!checkAuth(navigate)) return;
    setAdding(true);
    const result = await addToCartAPI(productId, productName, productPrice, quantity);
    if (result.message.includes("sessiya") || result.message.includes("kiring")) navigate('/login');
    setAdding(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className={`bg-[#7000FF] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#5c00cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {adding ? (
        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Qo'shilmoqda...</>
      ) : (
        children || <><FaPlus size={14} /> Savatga qo'shish</>
      )}
    </button>
  );
};

// =============================================
// ASOSIY SAVAT SAHIFASI
// =============================================
const Savat = () => {
  const [apiCartItems, setApiCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState({});
  const [clearing, setClearing] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(true);

  // Modal state'lari
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', paymentMethod: 'payme' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending');

  const navigate = useNavigate();

  const paymentMethods = [
    { id: 'payme', name: 'Payme', icon: PaymeSvg, bgColor: 'bg-gradient-to-br from-teal-400 to-teal-600', lightBg: 'bg-teal-50', textColor: 'text-teal-600' },
    { id: 'click', name: 'Click', icon: ClickSvg, bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
    { id: 'rahmat', name: 'Rahmat', icon: RahmatSvg, bgColor: 'bg-gradient-to-br from-red-300 to-red-400', lightBg: 'bg-red-50', textColor: 'text-red-600' }
  ];

  useEffect(() => { fetchCartFromAPI(); }, []);

  useEffect(() => {
    if (isPurchaseModalOpen) {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || userData.username || '',
          phone: localStorage.getItem('userPhone') || userData.phone || ''
        }));
      } catch (e) {}
    }
  }, [isPurchaseModalOpen]);

  const fetchCartFromAPI = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = getToken();
      if (!token) { setError("Iltimos, avval tizimga kiring!"); setLoading(false); return; }

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
          image: item.productSnapshot?.imageUrl?.length > 0 ? `${BASE_URL}/images/${item.productSnapshot.imageUrl[0]}` : "",
          category: item.productSnapshot?.category || "",
          company: item.productSnapshot?.company || ""
        }));

        setApiCartItems(formattedItems);
        const initialSelected = {};
        formattedItems.forEach(item => { initialSelected[item.id] = true; });
        setSelectedItems(initialSelected);
        setSelectAll(true);
        setError(null);
      } else {
        setError("Savat ma'lumotlarini olishda xato");
      }
    } catch (error) {
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

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev, [itemId]: !prev[itemId] };
      setSelectAll(apiCartItems.every(item => newSelected[item.id]));
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    const newSelected = {};
    apiCartItems.forEach(item => { newSelected[item.id] = newSelectAll; });
    setSelectedItems(newSelected);
    setSelectAll(newSelectAll);
  };

  const handleUpdateQuantity = async (itemId, change) => {
    if (!checkAuth(navigate)) return;
    const item = apiCartItems.find(i => i.id === itemId);
    if (!item || (item.quantity <= 1 && change === -1)) return;
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const result = await addToCartAPI(item.product_id, item.nomi, item.narxi, change);
      if (result.success) await fetchCartFromAPI(false);
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
        headers: { 'Authorization': `Bearer ${token}` }, timeout: 10000
      });
      setSelectedItems(prev => { const s = { ...prev }; delete s[itemId]; return s; });
    } catch {
      fetchCartFromAPI(false);
    } finally {
      setRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveSelected = async () => {
    if (!checkAuth(navigate)) return;
    const selectedIds = Object.entries(selectedItems).filter(([_, v]) => v).map(([id]) => id);
    if (!selectedIds.length) return;
    try {
      setClearing(true);
      const token = getToken();
      if (!token) return;
      await Promise.all(selectedIds.map(id => axios.delete(`${BASE_URL}/api/cart/item/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }, timeout: 5000
      })));
      await fetchCartFromAPI(false);
    } catch {
      fetchCartFromAPI(false);
    } finally {
      setClearing(false);
    }
  };

  const selectedItemsList = apiCartItems.filter(item => selectedItems[item.id]);
  const selectedCount = selectedItemsList.reduce((acc, item) => acc + item.quantity, 0);
  const selectedTotal = selectedItemsList.reduce((acc, item) => acc + item.narxi * item.quantity, 0);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Ism va familiya kiriting";
    if (!formData.phone.trim()) newErrors.phone = "Telefon raqam kiriting";
    if (!formData.address.trim()) newErrors.address = "Manzil kiriting";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          const fullAddress = data.display_name
            ? data.display_name.split(',').slice(0, 4).join(', ').trim()
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setLocationStatus('granted');
          setFormData(prev => ({ ...prev, address: fullAddress }));
          setShowLocationPermission(false);
        } catch {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          setLocationStatus('granted');
          setShowLocationPermission(false);
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => { setIsGettingLocation(false); setLocationStatus('denied'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) { navigate('/login'); return; }

      const orderData = {
        shippingAddress: formData.address.trim(),
        notes: "Tez yetkazib berishni so'rayman",
        paymentMethod: formData.paymentMethod,
        products: selectedItemsList.map(item => item.product_id)
      };

      const response = await axios.post(`${BASE_URL}/api/order/create`, orderData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 15000
      });

      if (response.data.success) {
        const paymentUrls = { payme: "https://payme.uz/", click: "https://click.uz/", rahmat: "https://rhmt.uz/" };
        const paymentUrl = paymentUrls[formData.paymentMethod];
        if (paymentUrl) window.open(paymentUrl, "_blank");

        await Promise.all(selectedItemsList.map(item =>
          axios.delete(`${BASE_URL}/api/cart/item/${item.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }, timeout: 5000
          }).catch(() => {})
        ));

        await fetchCartFromAPI(false);
        setIsPurchaseModalOpen(false);
        setFormData({ fullName: '', phone: '', address: '', paymentMethod: 'payme' });
        setLocationStatus('pending');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsPurchaseModalOpen(false);
    setFormErrors({});
    setLocationStatus('pending');
    setShowLocationPermission(false);
  };

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-3 border-[#00BCE4] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Savat yuklanmoqda</h2>
        <p className="text-sm text-gray-500">Bir necha soniya vaqt olishi mumkin</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">😕</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Xatolik yuz berdi</h2>
        <p className="text-gray-500 text-center mb-8 max-w-sm">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => fetchCartFromAPI()} className="px-6 py-3 bg-[#7000FF] text-white rounded-xl font-medium hover:bg-[#5c00cc] transition-colors">Qayta urinish</button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Bosh sahifa</button>
        </div>
      </div>
    );
  }

  // Bo'sh savat
  if (apiCartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaChevronLeft size={18} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Savat</h1>
            </div>
          </div>
        </div>
        <div className="py-12 bg-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6">
              <IoCartOutline size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Savat bo'sh</h2>
            <p className="text-gray-500 mb-8 max-w-xs">Savatingizga mahsulot qo'shing va xarid qilishni boshlang</p>
            <button onClick={() => navigate('/DentagoStore')} className="w-full max-w-xs py-4 bg-[#00BBE3] text-white rounded-xl font-semibold hover:bg-[#0099c2] transition-colors">
              Mahsulotlar katalogi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Order Summary Panel (qayta ishlatiladigan komponent) ────────────────
  const OrderSummaryPanel = ({ isMobile = false }) => (
    <div className={isMobile
      ? "px-5 py-4"
      : "bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
    }>
      {/* Desktop — sarlavha */}
      {!isMobile && (
        <h2 className="text-base font-semibold text-gray-900 mb-4">Buyurtma xulosasi</h2>
      )}

      {/* Desktop — narx breakdown */}
      {!isMobile && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mahsulotlar ({selectedCount} ta)</span>
            <span className="font-medium text-gray-800">{selectedTotal.toLocaleString()} so'm</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-500">Yetkazib berish</span>
            <span className="text-green-500 font-medium">Bepul</span>
          </div> */}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
            <span>Jami:</span>
            <span>{selectedTotal.toLocaleString()} so'm</span>
          </div>
        </div>
      )}

      {/* Mobile — narx + tugma inline */}
      {isMobile && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Jami to'lov</p>
            <p className="font-bold text-lg text-gray-900">{selectedTotal.toLocaleString()} so'm</p>
            {selectedCount > 0 && <p className="text-xs text-gray-500">{selectedCount} ta mahsulot</p>}
          </div>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            disabled={selectedCount === 0}
            className={`py-3.5 px-15 rounded-xl font-semibold text-base transition-all cursor-pointer ${
              selectedCount > 0
                ? 'bg-[#00BCE4] text-white hover:bg-[#00a3c2] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sotib olish
          </button>
        </div>
      )}

      {/* Desktop — to'liq tugma */}
      {!isMobile && (
        <>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            disabled={selectedCount === 0}
            className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all cursor-pointer ${
              selectedCount > 0
                ? 'bg-[#00BCE4] text-white hover:bg-[#00a3c2] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sotib olish
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <RiSecurePaymentLine size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">Xavfsiz to'lov</span>
          </div>
        </>
      )}
    </div>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────
  return (
    /* Mobilda pastga joy qoldirish, desktopda yo'q */
    <div className="min-h-screen pb-24 md:pb-0">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaChevronLeft size={18} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Savat</h1>
            </div>
            <span className="text-sm text-gray-500">{apiCartItems.length} ta mahsulot</span>
          </div>
        </div>
      </div>

      {/*
        ┌─────────────────────────────────────────────────────────────────┐
        │  LAYOUT:                                                        │
        │  ≥ md  →  flex row: [mahsulotlar list]  [sticky right panel]   │
        │  < md  →  faqat mahsulotlar + fixed bottom panel               │
        └─────────────────────────────────────────────────────────────────┘
      */}
      <div className="lg:flex lg:gap-6 lg:items-start lg:py-6">

        {/* Chap: mahsulotlar */}
        <div className="flex-1 min-w-0">

          {/* Select all bar */}
          <div className="my-4 mx-4 md:mx-0">
            <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded-md border-2 border-gray-300 focus:ring-[#00BCE4] focus:border-[#00BCE4] transition-colors"
                />
                <span className="text-sm font-medium text-gray-900">Barchasini tanlash</span>
              </label>
              {Object.values(selectedItems).filter(Boolean).length > 0 && (
                <button
                  onClick={handleRemoveSelected}
                  disabled={clearing}
                  className="text-sm text-red-500 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {clearing ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              )}
            </div>
          </div>

          {/* Mahsulotlar */}
          <div className="space-y-3 lg:px-0">
            {apiCartItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm relative">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => handleSelectItem(item.id)}
                    className="mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 border-gray-300 focus:ring-[#00BCE4] focus:border-[#00BCE4] transition-colors cursor-pointer"
                  />
                  <div
                    className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer"
                    onClick={() => navigate(`/mahsulot/${item.product_id}`)}
                  >
                    <img src={item.image} alt={item.nomi} className="w-full h-full object-contain p-2" loading="lazy" />
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
                        <span className="font-bold text-base text-gray-900">{(item.narxi * item.quantity).toLocaleString()} so'm</span>
                        {item.quantity > 1 && <p className="text-xs text-gray-500">{item.narxi.toLocaleString()} so'm × {item.quantity}</p>}
                      </div>
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={updating[item.id] || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {updating[item.id] ? <div className="w-3 h-3 border-2 border-[#00BCE4] border-t-transparent rounded-full animate-spin"></div> : <FaMinus size={10} />}
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          disabled={updating[item.id]}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {updating[item.id] ? <div className="w-3 h-3 border-2 border-[#00BCE4] border-t-transparent rounded-full animate-spin"></div> : <FaPlus size={10} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={removing[item.id]}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  >
                    {removing[item.id] ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <FaTrash size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── O'NG PANEL: faqat md+ ekranlarda sticky sidebar ── */}
        <div className="hidden md:block w-full lg:w-80 flex-shrink-0 bottom-0 sticky top-30">
          <OrderSummaryPanel isMobile={false} />
        </div>
      </div>

      {/* ── PASTKI PANEL: faqat mobil (md dan kichik) ekranlarda fixed ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
        <OrderSummaryPanel isMobile={true} />
      </div>

      {/* ===== MODAL ===== */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

          {/* Lokatsiya ruxsati ekrani */}
          {showLocationPermission ? (
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00C2FF] to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lokatsiyangizni ulash</h3>
                <p className="text-gray-600 text-sm">Buyurtmangizni yetkazib berish uchun aniq manzilingiz kerak</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Smartphone className="w-5 h-5 text-[#00C2FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">GPS orqali aniqlash</p>
                    <p className="text-xs text-gray-500">Avtomatik manzil to'ldirish</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Shield className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maxfiy ma'lumot</p>
                    <p className="text-xs text-gray-500">Faqat yetkazib berish uchun</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowLocationPermission(false); setLocationStatus('denied'); }}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Qo'lda kiritish
                </button>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00C2FF] to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGettingLocation ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Aniqlanmoqda...</span>
                    </div>
                  ) : 'Ruxsat berish'}
                </button>
              </div>
            </div>
          ) : (
            /* Asosiy buyurtma modal */
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-5 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#00C2FF] p-2.5 rounded-xl">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Buyurtma berish</h2>
                      <p className="text-xs text-gray-500">{selectedItemsList.length} ta mahsulot</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePurchase} className="p-5 space-y-5">
                {/* Ism */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Ism Familiya
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
                    placeholder="Ali Valiyev"
                  />
                  {formErrors.fullName && <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
                    placeholder="+998 88 306 26 99"
                  />
                  {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                </div>

                {/* Lokatsiya statusi */}
                {locationStatus !== 'pending' && (
                  <div className={`p-3 rounded-xl border ${locationStatus === 'granted' ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${locationStatus === 'granted' ? 'bg-green-200' : 'bg-gray-200'}`}>
                          <MapPin className={`w-4 h-4 ${locationStatus === 'granted' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {locationStatus === 'granted' ? 'Lokatsiya ulangan' : "Lokatsiya o'chirilgan"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {locationStatus === 'granted' ? 'Joylashuvingiz aniqlandi' : 'Lokatsiya ruxsati berilmagan'}
                          </p>
                        </div>
                      </div>
                      {locationStatus === 'denied' && (
                        <button
                          type="button"
                          onClick={() => setShowLocationPermission(true)}
                          className="text-xs font-medium px-3 py-1.5 bg-[#00C2FF] text-white rounded-lg hover:bg-[#0099DD] transition-all cursor-pointer"
                        >
                          Yoqish
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Manzil */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" /> Yetkazib berish manzili
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.address}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, address: e.target.value }));
                        if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
                      }}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none pr-12 focus:border-[#00C2FF] transition-colors"
                      placeholder="Manzilni kiriting"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="absolute right-2 bottom-6.5 p-2 bg-[#00C2FF] text-white rounded-lg hover:bg-[#0099DD] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isGettingLocation
                        ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        : <Navigation className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
                </div>

                {/* Buyurtma tafsilotlari */}
                <div className="rounded-xl shadow-sm p-4">
                  <h3 className="text-black/80 text-xs mb-3">Buyurtma tafsilotlari</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-black/60 text-xs">Mahsulotlar ({selectedCount} ta)</span>
                      <span className="text-black font-medium text-sm">{selectedTotal.toLocaleString()} so'm</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-black/60 text-xs">Yetkazib berish</span>
                      <span className="text-green-400 text-xs font-medium">Bepul</span>
                    </div> */}
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-black text-sm">Jami:</span>
                      <span className="text-black font-bold text-base">{selectedTotal.toLocaleString()} so'm</span>
                    </div>
                  </div>
                </div>

                {/* To'lov usuli */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-3">To'lov usulini tanlang</label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                        className="cursor-pointer"
                      >
                        <div className={`relative p-3 rounded-xl transition-all ${formData.paymentMethod === method.id ? method.bgColor : method.lightBg}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold ${formData.paymentMethod === method.id ? 'text-white' : method.textColor}`}>{method.name}</span>
                            <div className={`w-8 h-5 rounded flex items-center justify-center ${formData.paymentMethod === method.id ? 'bg-white/20' : 'bg-white'}`}>
                              <img src={method.icon} alt={method.name} className="w-6 h-4 object-contain" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'}`}></div>
                              ))}
                              <span className={`text-[10px] ml-1 ${formData.paymentMethod === method.id ? 'text-white/80' : 'text-gray-500'}`}>****</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-[8px] ${formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'}`}>
                                {formData.fullName || 'KARTANI TANLANG'}
                              </span>
                              <span className={`text-[8px] ${formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'}`}>12/26</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tugmalar */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-sm"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span>Jarayonda...</span></>
                    ) : 'Sotib olish'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Savat;
