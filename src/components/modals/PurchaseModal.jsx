import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, User, MapPin, CreditCard, Navigation, Smartphone, Globe, Zap, Shield } from 'lucide-react';
import PaymeSvg from '../../assets/payme.png';
import ClickSvg from '../../assets/click.png';
import RahmatSvg from '../../assets/rahmat.png';
import { useNavigate } from 'react-router-dom';

const PurchaseModal = ({ isOpen, onClose, totalAmount, items, itemsCount, onConfirm }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'payme'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserDataFromStorage();
    }
  }, [isOpen]);

  const fetchUserDataFromStorage = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const fullName = userData.name || userData.username || '';
      setFormData(prev => ({
        ...prev,
        fullName: fullName,
        phone: localStorage.getItem('userPhone') || userData.phone || ''
      }));
    } catch (error) {
      console.error("localStorage dan ma'lumot olishda xato:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Ism va familiya kiriting";
    if (!formData.phone.trim()) newErrors.phone = "Telefon raqam kiriting";
    if (!formData.address.trim()) newErrors.address = "Manzil kiriting";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('GPS mavjud emas');
      return;
    }

    setIsGettingLocation(true);
    setErrors(prev => ({ ...prev, address: '' }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (!response.ok) throw new Error('Manzilni olishda xato');
          const data = await response.json();
          let fullAddress = '';
          if (data.display_name) {
            fullAddress = data.display_name.split(',').slice(0, 4).join(', ').trim();
          }
          if (!fullAddress) {
            fullAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
          setUserLocation({ latitude, longitude, address: fullAddress });
          setLocationStatus('granted');
          setFormData(prev => ({ ...prev, address: fullAddress }));
          setShowLocationPermission(false);
        } catch (error) {
          console.error('Nominatim error:', error);
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setUserLocation({ latitude, longitude, address: fallbackAddress });
          setLocationStatus('granted');
          setFormData(prev => ({ ...prev, address: fallbackAddress }));
          setShowLocationPermission(false);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        setLocationStatus('denied');
        let errorMessage = 'Manzilni olishda xato yuz berdi';
        switch (error.code) {
          case error.PERMISSION_DENIED: errorMessage = 'Iltimos, joylashuvni aniqlashga ruxsat bering'; break;
          case error.POSITION_UNAVAILABLE: errorMessage = "Joylashuv ma'lumoti mavjud emas"; break;
          case error.TIMEOUT: errorMessage = "So'rov vaqti tugadi"; break;
          default: errorMessage = "Noma'lum xato";
        }
        console.log(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        shippingAddress: formData.address.trim(),
        notes: "Tez yetkazib berishni so'rayman",
        paymentMethod: formData.paymentMethod
      };

      const response = await fetch("https://app.dentago.uz/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMsg = `Server xatosi: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const result = await response.json();

      const paymentUrls = {
        payme: "https://payme.uz/",
        click: "https://click.uz/",
        rahmat: "https://rhmt.uz/"
      };

      const paymentUrl = paymentUrls[formData.paymentMethod];

      if (paymentUrl) {
        window.open(paymentUrl, "_blank");
      }

      onConfirm({
        ...formData,
        totalAmount,
        itemsCount,
        orderId: result.id || null,
        paymentMethod: formData.paymentMethod
      });

      navigate('/orders');

      setFormData({
        fullName: '',
        phone: '',
        address: '',
        paymentMethod: 'payme'
      });
      onClose();

    } catch (error) {
      console.error("Buyurtma yaratishda xato:", error);
      console.log(`Xato: ${error.message || "Server bilan ulanib bo'lmadi"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showLocationPermission) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-[10000]">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00C2FF] to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lokatsiyangizni ulash</h3>
            <p className="text-gray-600 text-sm">
              Buyurtmangizni yetkazib berish uchun aniq manzilingiz kerak
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Smartphone className="w-5 h-5 text-[#00C2FF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">GPS orqali aniqlash</p>
                <p className="text-xs text-gray-500">Avtomatik manzil to'ldirish</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
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
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
            >
              Qo'lda kiritish
            </button>
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00C2FF] to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
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
      </div>
    );
  }

  // To'lov usullari
  const paymentMethods = [
    { 
      id: 'payme', 
      name: 'Payme', 
      icon: PaymeSvg, 
      bgColor: 'bg-gradient-to-br from-teal-400 to-teal-600',
      lightBg: 'bg-teal-50',
      borderColor: 'border-teal-500',
      textColor: 'text-teal-600'
    },
    { 
      id: 'click', 
      name: 'Click', 
      icon: ClickSvg, 
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      id: 'rahmat', 
      name: 'Rahmat', 
      icon: RahmatSvg, 
      bgColor: 'bg-gradient-to-br from-red-400 to-red-600',
      lightBg: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative z-[51]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 rounded-t-2xl z-[52]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#00C2FF] p-2.5 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Buyurtma berish</h2>
                <p className="text-xs text-gray-500">{items.length} ta mahsulot</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Ism Familiya */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" /> Ism Familiya
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
              placeholder="Ali Valiyev"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed outline-none"
              placeholder="+998 88 306 26 99"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Lokatsiya statusi */}
          {locationStatus !== 'pending' && (
            <div className={`p-3 rounded-xl border ${
              locationStatus === 'granted' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-100 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    locationStatus === 'granted' ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    <MapPin className={`w-4 h-4 ${locationStatus === 'granted' ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {locationStatus === 'granted' ? 'Lokatsiya ulangan' : 'Lokatsiya o\'chirilgan'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {locationStatus === 'granted'
                        ? 'Joylashuvingiz aniqlandi'
                        : 'Lokatsiya ruxsati berilmagan'}
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
                name="address"
                value={formData.address}
                onChange={handleChange}
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
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* Buyurtma ma'lumotlari */}
          <div className="bg-gray-900 rounded-xl p-4">
            <h3 className="text-white/80 text-xs mb-3">Buyurtma tafsilotlari</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-xs">Mahsulotlar ({itemsCount} ta)</span>
                <span className="text-white font-medium text-sm">{totalAmount.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-xs">Yetkazib berish</span>
                <span className="text-green-400 text-xs font-medium">Bepul</span>
              </div>
              <div className="border-t border-white/10 my-2"></div>
              <div className="flex justify-between">
                <span className="text-white text-sm">Jami:</span>
                <span className="text-white font-bold text-base">{totalAmount.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* To'lov usuli - Aniq kartochkalar */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3">
              To'lov usulini tanlang
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                  className="cursor-pointer"
                >
                  <div className={`
                    relative p-3 rounded-xl   transition-all
                    ${formData.paymentMethod === method.id 
                      ? `${method.bgColor} ` 
                      : `${method.lightBg} `
                    }
                  `}>
                    {/* Logo yuqori qismda */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${
                        formData.paymentMethod === method.id ? 'text-white' : method.textColor
                      }`}>
                        {method.name}
                      </span>
                      <div className={`w-8 h-5 rounded flex items-center justify-center ${
                        formData.paymentMethod === method.id ? 'bg-white/20' : 'bg-white'
                      }`}>
                        <img 
                          src={method.icon} 
                          alt={method.name} 
                          className="w-6 h-4 object-contain"
                        />
                      </div>
                    </div>

                    {/* Kartochka raqami */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'
                        }`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'
                        }`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'
                        }`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          formData.paymentMethod === method.id ? 'bg-white/60' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-[10px] ml-1 ${
                          formData.paymentMethod === method.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          ****
                        </span>
                      </div>

                      {/* Karta egasi va muddat */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] ${
                          formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formData.fullName || 'KARTANI TANLANG'}
                        </span>
                        <span className={`text-[8px] ${
                          formData.paymentMethod === method.id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          12/26
                        </span>
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
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-sm"
              disabled={isSubmitting}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Jarayonda...</span>
                </>
              ) : (
                'Sotib olish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;