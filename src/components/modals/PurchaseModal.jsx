import React, { useState } from 'react';
import { X, ShoppingCart, User, MapPin, CreditCard, Navigation } from 'lucide-react';
// import Humo from '../../assets/humo.png';
// import Mastercard from '../assets/mastercard.png';
// import Uzcard from '../../assets/uzcard.png';
// import Visa from '../../assets/visa.png';
import PaymeSvg from '../../assets/payme.png';
import ClickSvg from '../../assets/click.png';
import RahmatSvg from '../../assets/rahmat.png';

const PurchaseModal = ({ isOpen, onClose, totalAmount, items, onConfirm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    paymentMethod: 'payme' // default to Payme
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [userLocation, setUserLocation] = useState(null);

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
    
    if (!formData.firstName.trim()) newErrors.firstName = "Ism kiriting";
    if (!formData.lastName.trim()) newErrors.lastName = "Familiya kiriting";
    if (!formData.address.trim()) newErrors.address = "Manzil kiriting";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('GPS mavjud emas');
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
        alert(errorMessage);
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
      // To'lov usuliga mos saytga yo'naltirish
      const paymentUrls = {
        'payme': 'https://payme.uz/',
        'click': 'https://click.uz/',
        'rahmat': 'https://rhmt.uz/'
      };
      
      const paymentUrl = paymentUrls[formData.paymentMethod];
      if (paymentUrl) {
        // Foydalanuvchiga xabar berish
        // alert(`${formData.paymentMethod.toUpperCase()} to'lov tizimiga yo'naltirilmoqdasiz. Yangi tab ochiladi.`);
        // Yangi tabda to'lov saytini ochish
        window.open(paymentUrl, '_blank');
      } else {
        // Agar to'lov tizimi uchun manzil mavjud bo'lmasa, xabar berish
        alert(`${formData.paymentMethod.toUpperCase()} to'lov tizimi hozircha mavjud emas. Boshqa usulni tanlang.`);
      }
      
      // Bu yerda siz hali ham API ga ma'lumotlarni yuborishingiz mumkin
      await onConfirm({
        ...formData,
        totalAmount,
        itemsCount: items.length,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.nomi,
          quantity: item.quantity,
          price: item.narxi
        }))
      });
      
      // Formani tozalash
      setFormData({
        firstName: '',
        lastName: '',
        address: '',
        paymentMethod: 'payme'
      });
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Xato yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showLocationPermission) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lokatsiyangizni ulash</h3>
            <p className="text-gray-600 text-sm">
              Buyurtmangizni yetkazib berish uchun aniq manzilingiz kerak. Bu ma'lumot maxfiy saqlanadi.
            </p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Aniq manzilni aniqlash</p>
                <p className="text-xs text-gray-500">Yetkazib berish manzilini avtomatik to'ldirish</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Tez yetkazib berish</p>
                <p className="text-xs text-gray-500">Manzilingizga yaqin bo'lgan kuryer</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowLocationPermission(false); setLocationStatus('denied'); }}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Qo'lda kiritish
            </button>
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {isGettingLocation ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Aniqlanmoqda...</span>
                </div>
              ) : 'Ruxsat berish'}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Siz har qanday vaqt brauzer sozlamalaridan ruxsatni o'zgartirishingiz mumkin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#00C2FF] p-2 rounded-full">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sotib olish</h2>
              <p className="text-sm text-gray-500">{items.length} ta mahsulot</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ism + Familiya */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" /> Ism
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent outline-none ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ali"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Familiya</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent outline-none ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Valiyev"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Manzil */}
          <div>
            {locationStatus !== 'pending' && (
              <div className={`flex items-center justify-between p-3 rounded-xl mb-4 border ${
                locationStatus === 'granted' ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    locationStatus === 'granted' ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <MapPin className={`w-4 h-4 ${locationStatus === 'granted' ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {locationStatus === 'granted' ? 'Lokatsiya ulangan' : 'Lokatsiya o\'chirilgan'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {locationStatus === 'granted'
                        ? userLocation?.address || 'Joylashuvingiz aniqlangan'
                        : 'Lokatsiya ruxsati berilmagan'}
                    </p>
                  </div>
                </div>
                {locationStatus === 'denied' && (
                  <button
                    type="button"
                    onClick={() => setShowLocationPermission(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Yoqish
                  </button>
                )}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Manzil {userLocation?.address && '(GPS orqali aniqlangan)'}
            </label>
            <div className="relative">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent outline-none resize-none pr-12 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Manzilingizni kiriting yoki GPS orqali aniqlang"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="absolute right-3 top-3 p-2 text-[#00C2FF] hover:bg-[#00C2FF]/10 rounded-lg transition disabled:opacity-50"
                title="GPS orqali manzilni aniqlash"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#00C2FF] border-t-transparent"></div>
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Buyurtma ma'lumotlari */}
          <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Buyurtma ma'lumotlari
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mahsulotlar soni:</span>
                <span className="font-medium">{items.length} ta</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-700 font-medium">Umumiy:</span>
                <span className="font-bold text-[#00C2FF]">{totalAmount.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* Mahsulotlar ro'yxati */}
          {/* <div>
            <h4 className="font-medium text-gray-900 mb-3">Mahsulotlar:</h4>
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 truncate">{item.nomi}</div>
                    <div className="text-gray-500 mt-0.5">× {item.quantity} dona</div>
                  </div>
                  <div className="font-bold text-gray-900 whitespace-nowrap ml-4">
                    {(item.narxi * item.quantity).toLocaleString()} so'm
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> To'lov usuli
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'payme' }))}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${
                  formData.paymentMethod === 'payme'
                    ? 'border-[#05CBCA] bg-green-50/70 scale-[1.03]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img 
                  src={PaymeSvg} 
                  alt="Payme" 
                  className="w-14 h-10 object-contain rounded-md drop-shadow-sm" 
                />
                <span className="text-sm font-medium text-gray-800">Payme</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'click' }))}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${
                  formData.paymentMethod === 'click'
                    ? 'border-[#0868FC] bg-blue-50/70 scale-[1.03]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img 
                  src={ClickSvg} 
                  alt="Click" 
                  className="w-14 h-10 object-contain rounded-md drop-shadow-sm" 
                />
                <span className="text-sm font-medium text-gray-800">Click</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'rahmat' }))}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${
                  formData.paymentMethod === 'rahmat'
                    ? 'border-[#FF4B34] bg-red-50/70 scale-[1.03]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img 
                  src={RahmatSvg} 
                  alt="Rahmat" 
                  className="w-14 h-10 object-contain rounded-md drop-shadow-sm" 
                />
                <span className="text-sm font-medium text-gray-800">Rahmat</span>
              </button>
            </div>
            {/* Tanlangan to'lov usulini ko'rsatish */}
            {/* {formData.paymentMethod && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Tanlangan to'lov usuli:</span> {formData.paymentMethod.toUpperCase()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  "Sotib olish" tugmasini bosganingizda {formData.paymentMethod.toUpperCase()} veb-saytiga yo'naltirilasiz
                </p>
              </div>
            )} */}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-6 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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