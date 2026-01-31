import React, { useState } from 'react';
import { X, ShoppingCart, User, MapPin, CreditCard, Navigation } from 'lucide-react';
import Humo from '../../assets/humo.png';
// import Mastercard from '../assets/mastercard.png';
import Uzcard from '../../assets/uzcard.png';
import Visa from '../../assets/visa.png';

const PurchaseModal = ({ isOpen, onClose, totalAmount, items, onConfirm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    paymentMethod: 'humo' // default to Humo
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ism kiriting";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Familiya kiriting";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Manzil kiriting";
    }
    
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
          
          // Nominatim OpenStreetMap API - ro'yxatdan o'tishdagi approach
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
              
          if (!response.ok) throw new Error('Manzilni olishda xato');
              
          const data = await response.json();
          let fullAddress = '';
              
          if (data.display_name) {
            // Addressni max 4 qismga cheklash
            fullAddress = data.display_name.split(',').slice(0, 4).join(', ').trim();
          }
              
          // Agar manzil bo'lmasa, koordinatalar
          if (!fullAddress) {
            fullAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
              
          setUserLocation({ latitude, longitude, address: fullAddress });
          setLocationStatus('granted');
          setFormData(prev => ({
            ...prev,
            address: fullAddress
          }));
              
          // GPS modalni yopish
          setShowLocationPermission(false);
              
        } catch (error) {
          console.error('Nominatim error:', error);
          // Fallback to coordinates only
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setUserLocation({ latitude, longitude, address: fallbackAddress });
          setLocationStatus('granted');
          setFormData(prev => ({
            ...prev,
            address: fallbackAddress
          }));
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
          case error.PERMISSION_DENIED:
            errorMessage = 'Iltimos, joylashuvni aniqlashga ruxsat bering';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Joylashuv ma'lumoti mavjud emas";
            break;
          case error.TIMEOUT:
            errorMessage = "So'rov vaqti tugadi";
            break;
          default:
            errorMessage = "Noma'lum xato";
        }
            
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your API
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
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        address: ''
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

  // GPS Permission Modal - ro'yxatdan o'tishdagi approach
  if (showLocationPermission) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Lokatsiyangizni ulash
            </h3>
            <p className="text-gray-600 text-sm">
              Buyurtmangizni yetkazib berish uchun aniq manzilingiz kerak.
              Bu ma'lumot maxfiy saqlanadi.
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
              onClick={() => {
                setShowLocationPermission(false);
                setLocationStatus('denied');
              }}
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
              ) : (
                'Ruxsat berish'
              )}
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#00C2FF] p-2 rounded-full">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sotib olish</h2>
              <p className="text-sm text-gray-500">{items.length} ta mahsulot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Ism
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ali"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Familiya
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Valiyev"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            {/* GPS Status Indicator */}
            {locationStatus !== 'pending' && (
              <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${locationStatus === 'granted' ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${locationStatus === 'granted' ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {locationStatus === 'granted' ? (
                      <MapPin className="w-4 h-4 text-green-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-gray-500" />
                    )}
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent resize-none pr-12 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Manzilingizni kiriting yoki GPS orqali aniqlang"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="absolute right-2 top-2 p-2 text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white rounded-lg transition-colors disabled:opacity-50"
                title="GPS orqali manzilni aniqlash"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#00C2FF] border-t-transparent"></div>
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Buyurtma ma'lumotlari
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mahsulotlar soni:</span>
                <span className="font-medium">{items.length} ta</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Umumiy miqdor:</span>
                <span className="font-bold text-lg text-[#00C2FF]">
                  {totalAmount.toLocaleString()} so'm
                </span>
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Mahsulotlar ro'yxati:</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 truncate">{item.nomi}</div>
                    <div className="text-gray-500">× {item.quantity} dona</div>
                  </div>
                  <div className="font-bold text-gray-900 ml-2">
                    {(item.narxi * item.quantity).toLocaleString()} so'm
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <CreditCard className="w-4 h-4 inline mr-1" />
              To'lov usuli
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'humo' }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'humo' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={Humo} alt="Humo" className="w-12 h-8 rounded" />
                <span className="text-xs font-medium text-gray-700">Humo</span>
              </button>
                          
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'uzcard' }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'uzcard' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={Uzcard} alt="UzCard" className="w-12 h-8 rounded" />
                <span className="text-xs font-medium text-gray-700">UzCard</span>
              </button>
                          
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'visa' }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'visa' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={Visa} alt="Visa" className="w-12 h-8 rounded" />
                <span className="text-xs font-medium text-gray-700">Visa</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  
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