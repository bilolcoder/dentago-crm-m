import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Users, Megaphone, Bell, ArrowLeft, Heart, ShoppingBag,
  ChevronDown, X
} from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import axios from "axios";

import Chair from "../../../assets/chair.png";
import Logo from "../../../assets/logo.png";

// Custom ThLarge icon SVG - HAMMASI BIR XIL ICON
const CategoryIcon = ({ className = "w-5 h-5", color = "#0891b2" }) => (
  <svg
    className={className}
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="th-large"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      fill={color}
      d="M296 32h192c13.255 0 24 10.745 24 24v160c0 13.255-10.745 24-24 24H296c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24zm-80 0H24C10.745 32 0 42.745 0 56v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24zM0 296v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V296c0 13.255 10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm296 184h192c13.255 0 24-10.745 24-24V296c0 13.255-10.745-24-24-24H296c-13.255 0-24 10.745-24 24v160c0 13.255 10.745 24 24 24z"
    ></path>
  </svg>
);

// Asosiy kategoriyalar (navigation uchun)
const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
  // { id: 'kurslar', label: 'kurslar', Icon: Users, path: '/kurs' },
];

// Dropdown uchun mahsulot kategoriyalari - SIZ BERGANLARGA O'ZGARTIRDIM
const productCategories = [
  {
    id: 'stomatologik-materiallar',
    label: 'Stomatologik materiallar',
    icon: CategoryIcon,
    description: 'Barcha stomatologik materiallar',
    subcategories: [
      { id: 'ortopediya', label: 'Ortopediya', icon: CategoryIcon },
      { id: 'umumiy behushlik', label: 'Umumiy behushlik', icon: CategoryIcon },
      { id: 'terapiya', label: 'Terapiya', icon: CategoryIcon },
      { id: 'jarrohlik', label: 'Jarrohlik', icon: CategoryIcon },
      { id: 'Dezenfeksiya va sterilizatsiya', label: 'Dezenfeksiya va sterilizatsiya', icon: CategoryIcon },
      { id: 'sarf-materiallari', label: 'Sarf materiallari', icon: CategoryIcon },
      { id: 'polishing toplami', label: 'Polishing toplami', icon: CategoryIcon },
      { id: 'Asboblar', label: 'Asboblar', icon: CategoryIcon },
      { id: 'qol asboblari va mikromotorlar', label: `Qo'l asboblari va mikromotorlar`, icon: CategoryIcon },
      { id: 'Burlar', label: `Burlar`, icon: CategoryIcon },
      { id: 'Fayllar', label: `Fayllar`, icon: CategoryIcon },
      { id: 'Shtiftlar', label: `Shtiftlar`, icon: CategoryIcon },
      { id: 'Matritsalar', label: `Matritsalar`, icon: CategoryIcon },
      { id: 'Poloski', label: `Poloski`, icon: CategoryIcon },
      { id: 'Klinyalar', label: `Klinyalar`, icon: CategoryIcon },
      { id: 'Disklar', label: `Disklar`, icon: CategoryIcon },
      { id: 'Implant', label: `Implant`, icon: CategoryIcon },
      { id: 'Ortodontiya', label: `Ortodontiya`, icon: CategoryIcon },
      { id: 'Aksessuarlar', label: `Aksessuarlar`, icon: CategoryIcon },
    ]
  },
  {
    id: 'stomatologik-uskunalari',
    label: 'stomatologik uskunalari',
    icon: CategoryIcon,
    description: 'Texnik materiallar va modellashtirish',
    subcategories: [
      { id: 'stomotologik stullar va stullar', label: 'stomotologik stullar va stullar', icon: CategoryIcon },
      { id: 'Assimilyatsiya qilish moslamalari', label: 'Assimilyatsiya qilish moslamalari', icon: CategoryIcon },
      { id: 'Rentgen, viziograf va mikroskopik uskunalar', label: 'Rentgen, viziograf va mikroskopik uskunalar', icon: CategoryIcon },
      { id: `Skalatorlar va qo'shimchalar`, label: `Skalatorlar va qo'shimchalar`, icon: CategoryIcon },
      { id: 'Elektromotorlar va apekslokatory', label: 'Elektromotorlar va apekslokatory', icon: CategoryIcon },
      { id: 'Sterilizatsiya uskunalari', label: 'Sterilizatsiya uskunalari', icon: CategoryIcon },
      { id: 'Moylash mashinalari', label: 'Moylash mashinalari', icon: CategoryIcon },
      { id: 'Jihoz', label: 'Jihoz', icon: CategoryIcon }


    ]
  },
  {
    id: 'stomatologik-teknik-materiallar',
    label: 'Stomatologik texnik materiallar',
    icon: CategoryIcon,
    description: 'Texnik materiallar va modellashtirish',
    subcategories: [
      { id: 'stomotologik stullar va stullar', label: 'stomotologik stullar va stullar', icon: CategoryIcon },
      { id: 'Assimilyatsiya qilish moslamalari', label: 'Assimilyatsiya qilish moslamalari', icon: CategoryIcon },
      { id: 'Rentgen, viziograf va mikroskopik uskunalar', label: 'Rentgen, viziograf va mikroskopik uskunalar', icon: CategoryIcon },
      { id: `Skalatorlar va qo'shimchalar`, label: `Skalatorlar va qo'shimchalar`, icon: CategoryIcon },
      { id: 'Elektromotorlar va apekslokatory', label: 'Elektromotorlar va apekslokatory', icon: CategoryIcon },
      { id: 'Sterilizatsiya uskunalari', label: 'Sterilizatsiya uskunalari', icon: CategoryIcon },
      { id: 'Moylash mashinalari', label: 'Moylash mashinalari', icon: CategoryIcon },
      { id: 'Jihoz', label: 'Jihoz', icon: CategoryIcon }


    ]
  },
  {
    id: 'stomatologik-teknik-asboblar',
    label: 'Stomatologik texnik asboblar',
    icon: CategoryIcon,
    description: 'Professional texnik asboblar',
    subcategories: [
      { id: 'asosiy-asboblar', label: 'Asosiy asboblar', icon: CategoryIcon },
      { id: 'CAD CAM bloklar', label: 'CAD CAM bloklar', icon: CategoryIcon },
      { id: 'Stomatologik sarf materiallari', label: 'Stomatologik sarf materiallari', icon: CategoryIcon },
      { id: `cho'tkalar`, label: `cho'tkalar`, icon: CategoryIcon },
      { id: `Sun'iy tishlar`, label: `Sun'iy tishlar`, icon: CategoryIcon },
      { id: 'Investitsion materiallar', label: 'Investitsion materiallar', icon: CategoryIcon },
      { id: 'Keramika va sirkon massalari', label: 'Keramika va sirkon massalari', icon: CategoryIcon },
      { id: 'Stomotologik texnik asboblar', label: 'Stomotologik texnik asboblar', icon: CategoryIcon },
      { id: 'Jilolash mahsulotlari va materiallari', label: 'Jilolash mahsulotlari va materiallari', icon: CategoryIcon },
      { id: 'Quyma materiallari', label: 'Quyma materiallari', icon: CategoryIcon },
      { id: 'Oklyuderlar', label: 'Oklyuderlar', icon: CategoryIcon },
      { id: 'Plastmassalar', label: 'Plastmassalar', icon: CategoryIcon },
      { id: 'Gipslar', label: 'Gipslar', icon: CategoryIcon },
      { id: 'Mumlar', label: 'Mumlar', icon: CategoryIcon },
      { id: 'Silikonlar', label: 'Silikonlar', icon: CategoryIcon },
      { id: 'Izolatsiya mahsulotlari', label: 'Izolatsiya mahsulotlari', icon: CategoryIcon }
    ]
  },
  {
    id: 'cad-cam-uskunalari',
    label: 'CAD CAM uskunalari',
    icon: CategoryIcon,
    description: 'CAD CAM texnologiyalari',
    subcategories: [
      { id: 'raqamli-texnologiyalar', label: 'Raqamli texnologiyalar', icon: CategoryIcon },
      { id: 'Frez mashinalari', label: 'Frez mashinalari', icon: CategoryIcon },
      { id: '3D Printer', label: '3D Printer', icon: CategoryIcon }
    ]
  },
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

  // Dropdown state'lari
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Yangi state'lar
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState([]);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  const [currentView, setCurrentView] = useState('subcategories'); // 'subcategories' yoki 'products'

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const subcategoryModalRef = useRef(null);

  const slides = [
    { title: "Eng yaxshi uskunalarni\nbizdan topasiz", description: "Bizning mahsulotlar sifatli, ishonchli va qulay narxlarda!" },
    { title: "Professional stomatologiya\nasboblari", description: "Yuqori sifatli texnika va ishonchli xizmat." },
  ];

  // Dropdown tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (subcategoryModalRef.current && !subcategoryModalRef.current.contains(event.target)) {
        setIsSubcategoryModalOpen(false);
        setCurrentView('subcategories'); // Modal yopilganda view ni reset qilish
      }
    };

    if (isModalOpen || isSubcategoryModalOpen) {
      document.addEventListener('mousedown', handleClickOutsideModal);
    }

    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [isModalOpen, isSubcategoryModalOpen]);

  // Inputni bosganda dropdownni ochish
  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  // Inputga yozish - FAKAT QIDIRISH UCHUN
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  // Kategoriyani tanlash - INPUTGA YOZILMASIN
  const handleCategorySelect = (category) => {
    // INPUTGA YOZILMAYDI, FAKAT SAQLANADI
    setSelectedCategory(category);

    // SUBCATEGORY MODALINI OCHISH
    openSubcategoryModal(category);

    setIsDropdownOpen(false);
  };

  // Subcategory modalini ochish
  const openSubcategoryModal = async (category) => {
    setSelectedSubcategory(category);
    setIsSubcategoryModalOpen(true);
    setCurrentView('subcategories'); // Avval subkategoriyalar ko'rinishi
    setSubcategoryProducts([]); // Oldingi mahsulotlarni tozalash
  };

  // Subcategory tanlash (masalan: Endodontik asboblar)
  const handleSubcategorySelect = async (subcategory) => {
    console.log("Tanlangan subkategoriya:", subcategory);
    setSelectedSubcategory(prev => ({ ...prev, selectedSub: subcategory }));
    setCurrentView('products'); // Mahsulotlar ko'rinishiga o'tish

    // Subkategoriya bo'yicha mahsulotlarni filterlash
    await fetchProductsBySubcategory(subcategory);
  };

  // Orqaga qaytish (subkategoriyalar ko'rinishiga)
  const handleBackToSubcategories = () => {
    setCurrentView('subcategories');
    setSubcategoryProducts([]);
  };

  // Subkategoriya bo'yicha mahsulotlarni filterlash
  const fetchProductsBySubcategory = async (subcategory) => {
    try {
      setSubcategoryLoading(true);

      // API dan kelgan mahsulotlarni subkategoriya nomi bo'yicha filterlash
      const filtered = products.filter(product => {
        const productCategory = product.category || product.categoryName || '';
        const productName = product.name || '';
        const subcategoryLabel = subcategory.label || '';

        return (
          productCategory.toLowerCase().includes(subcategoryLabel.toLowerCase()) ||
          productName.toLowerCase().includes(subcategoryLabel.toLowerCase())
        );
      });

      setSubcategoryProducts(filtered);

      if (filtered.length === 0) {
        // Agar hech qanday mahsulot topilmasa, xabar ko'rsatish
        console.log(`"${subcategory.label}" bo'yicha mahsulot topilmadi`);
        // Boshlang'ich ma'lumotni saqlab qolish
      }
    } catch (err) {
      console.error("Subkategoriya mahsulotlarini yuklash xatosi:", err);
      // Xatolikda bo'sh qilish
      setSubcategoryProducts([]);
    } finally {
      setSubcategoryLoading(false);
    }
  };

  // Kategoriyani tozalash
  const clearCategory = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Filterlangan kategoriyalar
  const filteredCategories = productCategories.filter(category =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        // API dan kelgan mahsulotlarni formatlash
        const formattedProducts = productsData.map(product => ({
          ...product,
          id: product._id || product.id,
          name: product.name || "Nomsiz mahsulot",
          price: product.price ? `${Number(product.price).toLocaleString('uz-UZ')} so'm` : "Narx yo'q",
          img: product.imageUrl?.[0] ? `${BASE_URL}images/${product.imageUrl[0]}` : "",
          category: product.category || "Umumiy"
        }));

        setProducts(formattedProducts);
        console.log("Yuklangan mahsulotlar:", formattedProducts);
      } catch (err) {
        console.error("Mahsulot yuklash xatosi:", err);
        setError("Mahsulotlarni yuklab bo'lmadi");
        setProducts([{
          id: 'demo1',
          name: 'Dental Chair Pro',
          price: '15 000 000 so\'m',
          img: '',
          category: 'Stomatologiya uskunalari'
        }]);
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

  // Modal ochish funksiyasi
  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="sticky top-0 bg-white z-30 p-4">
          <div className="flex items-center gap-4">
            {/* Input qismi - Dropdown bilan */}
            <div className="flex-1 relative" ref={dropdownRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20" />

              <input
                ref={inputRef}
                value={searchQuery}
                onChange={handleInputChange}
                onClick={handleInputClick}
                placeholder="Kategoriya bo'yicha qidirish..."
                className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white cursor-pointer"
                readOnly={false}
              />

              {/* Input o'ng tarafidagi iconlar */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearCategory}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                )}
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* DROPDOWN */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-fadeIn">
                  <div className="p-4">
                    {/* Dropdown header */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-lg font-bold text-gray-800">Kategoriyalar</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredCategories.length} ta
                      </span>
                    </div>



                    {/* Kategoriyalar ro'yxati */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <div
                              key={category.id}
                              onClick={() => handleCategorySelect(category)}
                              className={`flex items-center gap-4 p-3 rounded-xl hover:bg-cyan-50 cursor-pointer transition-all group border ${selectedCategory?.id === category.id ? 'border-cyan-500 bg-cyan-50' : 'border-transparent hover:border-cyan-200'}`}
                            >
                              {/* Icon qismi */}
                              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                  <Icon color="#0891b2" />
                                </div>
                              </div>

                              {/* Ma'lumotlar qismi */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 group-hover:text-cyan-700 truncate">
                                  {category.label}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1 truncate">
                                  {category.description}
                                  <span className="block text-xs text-cyan-600 mt-1">
                                    {category.subcategories?.length || 0} ta katalog
                                  </span>
                                </p>
                              </div>

                              {/* O'ng tarafdagi icon */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown className="text-cyan-500 rotate-270 transform rotate-90" size={20} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">🔍</div>
                          <p className="text-gray-500">Hech qanday kategoriya topilmadi</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">

                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={notification} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
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

        {/* Categories Navigation */}
        <section className="px-4 md:px-8 pb-12">
          <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 md:gap-8">
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
          <div onClick={openModal} className="px-6 py-2 font-medium text-[16px] bg-[#BDF3FF] rounded-[10px] cursor-pointer text-black hover:bg-[#a2e9f7] transition-colors">
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
          <div className="grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-8 mt-6 pb-10">
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

        {/* SUBCATEGORY MODAL - Kategoriya ichidagi kataloglar */}
        {isSubcategoryModalOpen && selectedSubcategory && (
          <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-start justify-center p-0 md:p-4 overflow-y-auto">
            <div
              ref={subcategoryModalRef}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl mt-auto md:my-auto max-h-[90vh] md:max-h-[80vh] overflow-y-auto animate-slideUp"
            >
              <div className="sticky top-0 bg-white p-6 flex items-center justify-between border-b border-gray-100 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (currentView === 'products') {
                        handleBackToSubcategories();
                      } else {
                        setIsSubcategoryModalOpen(false);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <ArrowLeft size={28} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {currentView === 'subcategories'
                        ? selectedSubcategory.label
                        : selectedSubcategory.selectedSub?.label || selectedSubcategory.label}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentView === 'subcategories'
                        ? selectedSubcategory.description
                        : `${selectedSubcategory.selectedSub?.label} bo'yicha mahsulotlar`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSubcategoryModalOpen(false);
                    setCurrentView('subcategories');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-6">

                {currentView === 'subcategories' ? (
                  /* SUBKATEGORIYALAR */
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Kataloglar</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSubcategory.subcategories?.map((subcat) => {
                        const SubIcon = subcat.icon;
                        return (
                          <div
                            key={subcat.id}
                            onClick={() => handleSubcategorySelect(subcat)}
                            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-cyan-500 hover:shadow-lg cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <SubIcon className="text-cyan-600" size={20} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 group-hover:text-cyan-700">
                                  {subcat.label}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {/* Subkategoriya tavsiflari */}
                                  {subcat.id === 'endodontik-asboblar' && 'Endodontik davolash uchun asboblar'}
                                  {subcat.id === 'gigiyena-uskunalari' && `Og'iz bo'shlig'i gigiyenasi uchun uskunalar`}
                                  {subcat.id === 'gips-va-modellashtirish' && 'Gips va modellashtirish materiallari'}
                                  {subcat.id === 'akril-va-metallar' && 'Akril va metall texnik materiallar'}
                                  {subcat.id === 'asosiy-asboblar' && 'Asosiy texnik asboblar'}
                                  {subcat.id === 'raqamli-texnologiyalar' && 'Raqamli CAD CAM texnologiyalari'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* SUBKATEGORIYA MAHSULOTLARI */
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedSubcategory.selectedSub?.label} ({subcategoryProducts.length})
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Kategoriya:</span>
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                          {selectedSubcategory.selectedSub?.label}
                        </span>
                      </div>
                    </div>

                    {subcategoryLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Mahsulotlar yuklanmoqda...</p>
                      </div>
                    ) : subcategoryProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {subcategoryProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            navigate={navigate}
                            onAddToCart={handleAddToCartAPI}
                            isLoading={cartLoading[product.id] || false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {selectedSubcategory.selectedSub?.label} bo'yicha mahsulotlar topilmadi
                        </h3>
                        <p className="text-gray-500 mb-6">Hozircha bu kategoriyada mahsulotlar mavjud emas</p>
                        <button
                          onClick={handleBackToSubcategories}
                          className="px-6 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors"
                        >
                          ← Orqaga qaytish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal - Barcha mahsulotlar */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-start justify-center p-0 md:p-4 overflow-y-auto">
            <div
              ref={modalRef}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl mt-auto md:my-auto max-h-[90vh] md:max-h-[80vh] overflow-y-auto animate-slideUp"
            >
              <div className="sticky top-0 bg-white p-6 flex items-center justify-between border-b border-gray-100 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <ArrowLeft size={28} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Barcha Mahsulotlar ({products.length})</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 md:p-6">
                {/* Filter va saralash */}
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriya bo'yicha</label>
                      <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500">
                        <option value="">Barcha kategoriyalar</option>
                        {productCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Saralash</label>
                      <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500">
                        <option value="popular">Ommabop</option>
                        <option value="new">Yangi</option>
                        <option value="price-low">Arzon narx</option>
                        <option value="price-high">Qimmat narx</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mahsulotlar */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Mahsulotlar topilmadi</h3>
                    <p className="text-gray-500">Hozircha bu kategoriyada mahsulotlar mavjud emas</p>
                  </div>
                )}
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
      className="bg-white cursor-pointer rounded-[20px] p-3 md:rounded-[30px] md:p-4 shadow-sm border border-gray-100 flex flex-col relative group transition-all hover:shadow-xl hover:-translate-y-1 h-full"
    >
      <button className="absolute right-3 top-3 z-10 p-1 rounded-full bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all">
        <Heart size={20} />
      </button>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-[15px] md:rounded-[20px] overflow-hidden mb-3 md:mb-4 flex items-center justify-center h-32 md:h-48">
        <img
          src={product.img}
          alt={product.name}
          className="object-contain h-full w-full p-3 md:p-4 group-hover:scale-110 transition-all duration-300"
          onError={(e) => e.target.src = ""}
        />
      </div>
      <h3 className="text-gray-800 font-semibold text-[14px] md:text-[17px] mb-2 leading-tight min-h-[40px] line-clamp-2">
        {product.name}
      </h3>
      {product.category && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full">
            {product.category}
          </span>
        </div>
      )}
      <div className="mt-auto">
        <p className="text-black font-bold text-[16px] md:text-[20px] mb-3">
          {product.price}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full py-2.5 md:py-3 rounded-[12px] md:rounded-[15px] flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base ${
            isLoading
              ? 'bg-gray-400'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
              Qo'shilmoqda...
            </>
          ) : (
            <>
              <ShoppingBag size={16} className="md:size-[18px]" /> Savatga
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Boshsaxifa;
