import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, Megaphone, Bell, ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import axios from "axios";

import Chair from "../../../assets/chair.png";
import Logo from "../../../assets/logo.png";

const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
  { id: 'kurslar', label: 'kurslar', Icon: Users, path: '/kurs' },
];

const BASE_URL = "https://app.dentago.uz/";

function Boshsaxifa() {
  const [activeTab, setActiveTab] = useState("barchasi");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});

  const navigate = useNavigate();

  const slides = [
    { title: "Eng yaxshi uskunalarni\nbizdan topasiz", description: "Bizning mahsulotlar sifatli, ishonchli va qulay narxlarda!" },
    { title: "Professional stomatologiya\nasboblari", description: "Yuqori sifatli texnika va ishonchli xizmat." },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        const response = await axios.get(`${BASE_URL}api/product/app/product/all`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000,
        });

        let productsData = response.data?.data || response.data || [];

        const formattedProducts = productsData.map(product => ({
          ...product,
          id: product._id || product.id,
          name: product.name || "Nomsiz mahsulot",
          price: product.price ? `${Number(product.price).toLocaleString('uz-UZ')} so'm` : "Narx yo'q",
          img: product.imageUrl?.[0] ? `${BASE_URL}images/${product.imageUrl[0]}` : ""
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Mahsulot yuklash xatosi:", err);
        setError("Mahsulotlarni yuklab bo'lmadi");
        setProducts([{ id: 'demo1', name: 'Dental Chair Pro', price: '15 000 000 so\'m', img: '' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCartAPI = async (product) => {
    try {
      setCartLoading(prev => ({ ...prev, [product.id]: true }));

      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert("Iltimos, avval tizimga kiring!");
        navigate('/login');
        return;
      }

      const priceNumber = product.price ? parseInt(product.price.replace(/\s|so'm/g, ''), 10) : 0;

      const cartData = {
        product_id: product._id || product.id,
        quantity: 1,
        price: priceNumber
      };

      const response = await axios.post(`${BASE_URL}api/cart/add`, cartData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });

      console.log("Savatga qo'shildi:", response.data);
    } catch (error) {
      console.error("Savat xatosi:", error);
      alert("Xato: " + (error.response?.data?.message || "Server bilan muammo"));
    } finally {
      setCartLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const notification = () => navigate('/notification');

  return (
    <div className="min-h-screen bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="p-4 sticky top-0 bg-white z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Shifokor qidirish..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none"
              />
            </div>
            <button onClick={notification} className="p-3 bg-gray-100 rounded-xl">
              <Bell />
            </button>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="px-4 md:px-8 py-6">
          <div className="relative group">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-[300px] md:h-[450px] p-8 md:p-16 flex items-center relative">
                      <div className="w-full md:w-1/2 z-10">
                        <img src={Logo} className="w-52 transform max-sm:w-32 translate-x-[-12px]" alt="Logo" />
                        <h2 className="text-2xl md:text-5xl text-white mb-4 leading-tight whitespace-pre-line font-bold">{slide.title}</h2>
                        <p className="text-sm md:text-lg text-cyan-50 mb-8 max-w-md">{slide.description}</p>
                      </div>
                      <div className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 w-1/2 flex justify-end">
                        <img src={Chair} alt="Dental Chair" className="h-48 md:h-[350px] object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"><ArrowLeft className="text-white" /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 rotate-180"><ArrowLeft className="text-white" /></button>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 md:px-8 pb-12">
          <div className="grid grid-cols-5 gap-4 md:gap-8">
            {categories.map(({ id, label, Icon, path }) => (
              <Link key={id} to={path} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex border-2 items-center justify-center transition-all ${activeTab === id ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg' : 'bg-white border-cyan-500 text-cyan-500'}`}>
                  <Icon className="text-3xl md:text-4xl" />
                </div>
                <span className={`text-sm md:text-lg font-semibold ${activeTab === id ? 'text-cyan-700' : 'text-gray-600'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Title */}
        <div className="flex items-center justify-between px-4 md:px-8 mb-6">
          <h1 className="font-bold text-[22px] md:text-[25px]">Ommabop mahsulotlar</h1>
          <div onClick={() => setIsModalOpen(true)} className="px-6 py-2 font-medium text-[16px] bg-[#BDF3FF] rounded-[10px] cursor-pointer text-black hover:bg-[#a2e9f7] transition-colors">
            Barchasi
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Mahsulotlar yuklanmoqda...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600">
              Qayta yuklash
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-8 mt-6 pb-10">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigate={navigate}
                onAddToCart={handleAddToCartAPI}
                isLoading={cartLoading[product.id] || false}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 flex items-center gap-4 border-b border-gray-100 z-10 shadow-sm">
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <ArrowLeft size={28} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Barcha Mahsulotlar ({products.length})</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      navigate={navigate}
                      onAddToCart={handleAddToCartAPI}
                      isLoading={cartLoading[product.id] || false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, navigate, onAddToCart, isLoading }) {
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await onAddToCart(product);
  };

  return (
    <div
      onClick={() => navigate(`/mahsulot/${product.id}`)}
      className="bg-white cursor-pointer rounded-[30px] p-4 shadow-sm border border-gray-100 flex flex-col relative group transition-all hover:shadow-xl hover:-translate-y-1 h-full"
    >
      <button className="absolute right-3 top-3 z-10 p-1 rounded-full bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all">
        <Heart size={20} />
      </button>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-[20px] overflow-hidden mb-4 flex items-center justify-center h-40 md:h-48">
        <img
          src={product.img}
          alt={product.name}
          className="object-contain h-full w-full p-4 group-hover:scale-110 transition-all duration-300"
          onError={(e) => e.target.src = ""}
        />
      </div>
      <h3 className="text-gray-800 font-semibold text-[15px] md:text-[17px] mb-2 leading-tight min-h-[40px] line-clamp-2">
        {product.name}
      </h3>
      <div className="mt-auto">
        <p className="text-black font-bold text-[18px] md:text-[20px] mb-3">
          {product.price}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full py-3 rounded-[15px] flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
            isLoading ? 'bg-gray-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Qo'shilmoqda...
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> Savatga
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Boshsaxifa;