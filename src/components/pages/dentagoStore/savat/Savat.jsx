import React, { useState, useEffect } from 'react';
import { useCart } from '../../.././../components/pages/dentagoStore/CartContent';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaSyncAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';

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
    alert(result.message);

    if (result.message.includes("sessiya") || result.message.includes("kiring")) {
      navigate('/login');
    }
    setAdding(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className={`bg-[#00C2FF] text-white px-4 py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#0099DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartFromAPI();
  }, []);

  // const navigate = useNavigate();
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
 
    // 1. Savatdan mahsulotni topamiz
    const item = apiCartItems.find(i => i.id === itemId);
    if (!item) return;

    // Agar miqdor 1 bo'lsa va foydalanuvchi ayirmoqchi bo'lsa, to'xtatamiz
    if (item.quantity <= 1 && change === -1) return;

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));

      // 2. Savatga qo'shish funksiyasini chaqiramiz (change: 1 yoki -1)
      // Bu funksiya sizda yuqorida export qilingan addToCartAPI funksiyasidir
      const result = await addToCartAPI(
        item.product_id,
        item.nomi,
        item.narxi,
        change // miqdorni +1 yoki -1 ko'rinishida yuboramiz
      );

      if (result.success) {
      
        await fetchCartFromAPI(false);

        // Agar Context ishlatayotgan bo'lsangiz:
        updateQuantity(itemId, item.quantity + change);
      } else {
        alert(result.message);
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

      if (cartItems.find(i => i.id === itemId)) {
        removeFromCart(itemId);
      }
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

      clearCart();
    } catch (error) {
      fetchCartFromAPI(false);
    } finally {
      setClearing(false);
    }
  };

  const jamiSumma = apiCartItems.reduce((acc, item) => acc + item.narxi * item.quantity, 0);
  const jamiTovarlar = apiCartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Savat yuklanmoqda...</h2>
        <p className="text-gray-500 text-sm">Bu bir necha soniya vaqt olishi mumkin</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Xato yuz berdi</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => fetchCartFromAPI()} className="bg-cyan-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-cyan-600">
            <FaSyncAlt /> Qayta yuklash
          </button>
          <button onClick={() => navigate('/login')} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-bold hover:bg-gray-300">
            Kirish
          </button>
          <button onClick={() => navigate('/')} className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600">
            Asosiy sahifaga
          </button>
        </div>
      </div>
    );
  }

  if (apiCartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6 text-gray-300">
          <FaShoppingCart size={80} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Savatda hali hech narsa yo'q</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
          Mahsulotlarni ko'rib chiqing va savatingizni to'ldiring!
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => navigate('/DentagoStore')} className="bg-[#00C2FF] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0099DD]">
            Mahsulotlarga o'tish
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 p-4">
      <button onClick={handleBackMinus} className='p-3 text-gray-400 bg-gray-100 cursor-pointer rounded-2xl text-2xl'><IoMdArrowRoundBack /></button>
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 py-2">
        <h1 className="text-center text-xl font-bold text-gray-800">Korzinka</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{apiCartItems.length} ta mahsulot</span>
          <button
            onClick={handleClearCart}
            disabled={clearing}
            className="text-red-500 text-sm hover:text-red-700 px-3 py-1 border border-red-200 rounded-full hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
          >
            {clearing ? <>Tozalanmoqda...</> : <><FaTrash size={12} /> Tozalash</>}
          </button>
          <button onClick={() => fetchCartFromAPI(true)} className="text-gray-500 hover:text-cyan-600 p-2 hover:bg-gray-100 rounded-full">
            <FaSyncAlt />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {apiCartItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start relative hover:shadow-md transition-shadow">
            <button
              onClick={() => handleRemoveFromCart(item.id)}
              disabled={removing[item.id]}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 disabled:opacity-50"
            >
              {removing[item.id] ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div> : <FaTrash size={14} />}
            </button>

            <div
              className="w-20 h-20 mr-4 bg-gray-50 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
              onClick={() => navigate(`/mahsulot/${item.product_id}`)}
            >
              <img src={item.image} alt={item.nomi} className="w-full h-full object-contain p-1" loading="lazy" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-gray-800 text-sm mb-1 pr-6 leading-tight cursor-pointer hover:text-blue-600 truncate"
                onClick={() => navigate(`/mahsulot/${item.product_id}`)}
              >
                {item.nomi}
              </h3>
              {item.category && (
                <p className="text-gray-500 text-[10px] mb-1 truncate">
                  {item.category}{item.company && ` • ${item.company}`}
                </p>
              )}
             

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-black text-lg text-gray-900">
                  {(item.narxi * item.quantity).toLocaleString()} so'm
                </span>

                <div className="flex items-center bg-[#F2F3F5] rounded-full px-3 py-1.5 gap-4">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    disabled={updating[item.id] || item.quantity <= 1}
                    className="text-blue-500 hover:bg-blue-50 rounded-full p-1 disabled:opacity-50"
                  >
                    {updating[item.id] ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div> : <FaMinus size={10} />}
                  </button>
                  <span className="font-bold text-sm min-w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    disabled={updating[item.id]}
                    className="text-blue-500 hover:bg-blue-50 rounded-full p-1 disabled:opacity-50"
                  >
                    {updating[item.id] ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div> : <FaPlus size={10} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-center">

      <div className="fixed bottom-0 rounded-lg bg-white py-0 px-5 sm:p-6 z-40 border border-gray-200">
        <div className="space-y-2 mb-3 text-sm">
          <div className="flex justify-between items-center     border-gray-300 mt-2">
            <span className="font-bold text-lg text-black">Jami</span>
            <span className="font-medium text-2xl text-black">{jamiSumma.toLocaleString()} so'm</span>
          </div>
        </div>

        <button
          // onClick={() => navigate('/checkout')}
          className="w-full py-3 px-3 bg-gradient-to-r from-[#00C2FF] to-[#0099DD] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          disabled={clearing}
          >
          {clearing ? 'Kutilmoqda...' : `Sotib olish (${jamiSumma.toLocaleString()} so'm)`}
        </button>

      </div>

      </div>
    </div>
  );
};

export default Savat;
