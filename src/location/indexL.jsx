import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Mavjud locationlarni olish
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // Test ma'lumotlar
      const testData = [
        { 
          id: 1, 
          name: 'Toshkent Markaz', 
          description: 'Toshkent shahridagi asosiy filial', 
          lat: 41.3111, 
          lng: 69.2797 
        },
        { 
          id: 2, 
          name: 'Samarqand Filial', 
          description: 'Samarqanddagi filial', 
          lat: 39.6542, 
          lng: 66.9750 
        },
        { 
          id: 3, 
          name: 'Buxoro Ofis', 
          description: 'Buxorodagi ofis', 
          lat: 39.7681, 
          lng: 64.4556 
        }
      ];
      setLocations(testData);
    } catch (error) {
      console.error('Locationlarni olishda xatolik:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log('Yangi location ma\'lumotlari:', data);
      
      // Yangi locationni qo'shish
      const newLocation = {
        id: locations.length + 1,
        name: data.name,
        description: data.description,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng)
      };
      
      setLocations([...locations, newLocation]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Location qo\'shishda xatolik:', error);
    }
  };

  const openModal = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  // OpenStreetMap komponenti (bepul)
  const MapComponent = ({ lat, lng }) => {
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&marker=${lat},${lng}&layer=mapnik`;
    
    return (
      <iframe
        width="100%"
        height="350"
        src={mapSrc}
        style={{ border: '1px solid black', borderRadius: '8px' }}
        title="OpenStreetMap Location"
      />
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Joylashuvlar</h1>
          <button
            onClick={openModal}
            className="bg-[#02BBE2] hover:bg-[#02a5c9] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Yangi Qo'shish
          </button>
        </div>

        {/* Mavjud Locationlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{location.name}</h3>
                <div className="bg-[#02BBE2] text-white text-xs px-2 py-1 rounded-full">
                  ID: {location.id}
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{location.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#02BBE2]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Lat: {location.lat}, Lng: {location.lng}</span>
              </div>
              <div className="h-40 rounded-lg overflow-hidden">
                <MapComponent lat={location.lat} lng={location.lng} />
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedLocation ? 'Joylashuvni Tahrirlash' : 'Yangi Joylashuv Qo\'shish'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chap tarafi - Form */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Asosiy Ma'lumotlar</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Joylashuv nomi *
                          </label>
                          <input
                            type="text"
                            {...register('name', { 
                              required: 'Joylashuv nomi majburiy', 
                              minLength: { value: 3, message: 'Kamida 3 belgi kiriting' }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02BBE2] focus:border-transparent transition-all"
                            placeholder="Masalan: Toshkent Markaz"
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tavsif
                          </label>
                          <textarea
                            {...register('description')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02BBE2] focus:border-transparent transition-all"
                            rows="4"
                            placeholder="Joylashuv haqida batafsil tavsif..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kenglik (Latitude) *
                            </label>
                            <input
                              type="number"
                              step="any"
                              {...register('lat', { 
                                required: 'Kenglik majburiy',
                                min: { value: -90, message: 'Kenglik -90 dan 90 gacha bo\'lishi kerak' },
                                max: { value: 90, message: 'Kenglik -90 dan 90 gacha bo\'lishi kerak' }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02BBE2] focus:border-transparent transition-all"
                              placeholder="41.3111"
                            />
                            {errors.lat && <p className="text-red-500 text-sm mt-1">{errors.lat.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Uzunlik (Longitude) *
                            </label>
                            <input
                              type="number"
                              step="any"
                              {...register('lng', { 
                                required: 'Uzunlik majburiy',
                                min: { value: -180, message: 'Uzunlik -180 dan 180 gacha bo\'lishi kerak' },
                                max: { value: 180, message: 'Uzunlik -180 dan 180 gacha bo\'lishi kerak' }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02BBE2] focus:border-transparent transition-all"
                              placeholder="69.2797"
                            />
                            {errors.lng && <p className="text-red-500 text-sm mt-1">{errors.lng.message}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* O'ng tarafi - Google Maps */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Xaritada Ko'rish</h3>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <MapComponent 
                          lat={parseFloat(selectedLocation?.lat) || 41.3111} 
                          lng={parseFloat(selectedLocation?.lng) || 69.2797} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#02BBE2] text-white rounded-lg hover:bg-[#02a5c9] transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    {selectedLocation ? 'Yangilash' : 'Qo\'shish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPage;