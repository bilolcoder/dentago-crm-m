import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../../../context/DataProvider";
import {
  Search, Users, Megaphone, Bell, ArrowLeft, Heart, ShoppingBag,
  ChevronDown, X, Check
} from "lucide-react";
import { RiToothLine } from "react-icons/ri";
import { MdGridView } from "react-icons/md";
import axios from "axios";

import Chair from "../../../assets/chair.png";
import Logo from "../../../assets/logo.png";
import StoreBanner from "./components/StoreBanner";
import StoreCategories from "./components/StoreCategories";

const HIDDEN_PRODUCT_IDS = ['69aa9c81eb0b4548749cce80']; // Yashiriladigan mahsulot IDlari

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
      d="M296 32h192c13.255 0 24 10.745 24 24v160c0 13.255-10.745 24-24 24H296c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24zm-80 0H24C10.745 32 0 42.745 0 56v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V56c0-13.255 10.745-24-24-24zM0 296v160c0 13.255 10.745 24 24 24h192c13.255 0 24-10.745 24-24V296c0 13.255 10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm296 184h192c13.255 0 24-10.745 24-24V296c0 13.255-10.745-24-24-24H296c-13.255 0-24 10.745-24 24v160c0 13.255 10.745 24 24 24z"
    ></path>
  </svg>
);

const categories = [
  { id: 'barchasi', label: 'Barchasi', Icon: MdGridView, path: '/DentagoStore' },
  { id: 'elonlar', label: 'Elonlar', Icon: Megaphone, path: '/elonlar' },
  { id: 'texniklar', label: 'Texniklar', Icon: RiToothLine, path: '/texniklar' },
  { id: 'ustalar', label: 'Ustalar', Icon: Users, path: '/ustalar' },
];

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
  const { cartItems, fetchCart } = useData();
  const [activeTab, setActiveTab] = useState("barchasi");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState([]);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  const [currentView, setCurrentView] = useState('subcategories');

  const [selectedFilterCategory, setSelectedFilterCategory] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const subcategoryModalRef = useRef(null);

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

        const response = await axios.get(`${BASE_URL}api/product/app/product/all?limit=500`, {
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
          img: product.imageUrl?.[0] ? `${BASE_URL}images/${product.imageUrl[0]}` : "",
          category: product.category || "Umumiy",
          categoryName: product.categoryName || product.category || "Umumiy",
          company: product.company || "Noma'lum kompaniya"
        }));

        setProducts(formattedProducts);
        
        // Filter out hidden products before setting filtered products
        const visibleProducts = formattedProducts.filter(product => !HIDDEN_PRODUCT_IDS.includes(product.id));
        setFilteredProducts(visibleProducts);
        updateFeaturedProducts(visibleProducts);
      } catch (err) {
        console.error("Mahsulot yuklash xatosi:", err);
        setError("Mahsulotlarni yuklab bo'lmadi");
        const demoProducts = [{
          id: 'demo1',
          name: 'Dental Chair Pro',
          price: '15 000 000 so\'m',
          img: '',
          category: 'Stomatologiya uskunalari',
          categoryName: 'Stomatologiya uskunalari',
          company: 'VDS_DENTAL'
        }];
        setProducts(demoProducts);
        
        // Filter out hidden products from demo products
        const visibleDemoProducts = demoProducts.filter(product => !HIDDEN_PRODUCT_IDS.includes(product.id));
        setFilteredProducts(visibleDemoProducts);
        updateFeaturedProducts(visibleDemoProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const updateFeaturedProducts = (prods) => {
    const companyMap = new Map();
    prods.forEach(product => {
      if (product.company && !companyMap.has(product.company)) {
        companyMap.set(product.company, product);
      }
    });
    setFeaturedProducts(Array.from(companyMap.values()).slice(0, 20));
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilterCategory, searchFilter, products]);

  useEffect(() => {
    updateFeaturedProducts(filteredProducts);
  }, [filteredProducts]);

  const applyFilters = () => {
    // Start with all products
    let result = [...products];

    // Filter out hidden products
    result = result.filter(product => !HIDDEN_PRODUCT_IDS.includes(product.id));

    // Apply category filter if selected
    if (selectedFilterCategory) {
      const selectedCat = productCategories.find(cat => cat.id === selectedFilterCategory);
      if (selectedCat) {
        result = result.filter(product => {
          const productCat = product.categoryName?.toLowerCase() || product.category?.toLowerCase() || '';
          const catLabel = selectedCat.label.toLowerCase();
          const matchesMainCategory = productCat.includes(catLabel);
          const matchesSubcategory = selectedCat.subcategories?.some(subcat =>
            productCat.includes(subcat.label.toLowerCase())
          );
          return matchesMainCategory || matchesSubcategory;
        });
      }
    }

    // Apply search filter if exists
    if (searchFilter.trim() !== "") {
      const searchLower = searchFilter.toLowerCase().trim();
      result = result.filter(product => {
        const productName = product.name?.toLowerCase() || '';
        const productCategory = product.categoryName?.toLowerCase() || product.category?.toLowerCase() || '';
        const productDesc = product.description?.toLowerCase() || '';
        return (
          productName.includes(searchLower) ||
          productCategory.includes(searchLower) ||
          productDesc.includes(searchLower)
        );
      });
    }

    setFilteredProducts(result);
  };

  const clearFilters = () => {
    setSelectedFilterCategory("");
    setSearchFilter("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (subcategoryModalRef.current && !subcategoryModalRef.current.contains(event.target)) {
        setIsSubcategoryModalOpen(false);
        setCurrentView('subcategories');
      }
    };

    if (isModalOpen || isSubcategoryModalOpen) {
      document.addEventListener('mousedown', handleClickOutsideModal);
    }

    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [isModalOpen, isSubcategoryModalOpen]);

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    openSubcategoryModal(category);
    setIsDropdownOpen(false);
  };

  const openSubcategoryModal = async (category) => {
    setSelectedSubcategory(category);
    setIsSubcategoryModalOpen(true);
    setCurrentView('subcategories');
    setSubcategoryProducts([]);
  };

  const handleSubcategorySelect = async (subcategory) => {
    console.log("Tanlangan subkategoriya:", subcategory);
    setSelectedSubcategory(prev => ({ ...prev, selectedSub: subcategory }));
    setCurrentView('products');
    await fetchProductsBySubcategory(subcategory);
  };

  const handleBackToSubcategories = () => {
    setCurrentView('subcategories');
    setSubcategoryProducts([]);
  };

  const fetchProductsBySubcategory = async (subcategory) => {
    try {
      setSubcategoryLoading(true);
      const subcategoryLabel = subcategory.label.toLowerCase();
      
      // Start with all products and filter out hidden ones
      const visibleProducts = products.filter(product => !HIDDEN_PRODUCT_IDS.includes(product.id));
      
      const filtered = visibleProducts.filter(product => {
        const productCategory = (product.categoryName || product.category || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        return (
          productCategory.includes(subcategoryLabel) ||
          productName.includes(subcategoryLabel) ||
          productDescription.includes(subcategoryLabel) ||
          (subcategoryLabel.includes('material') && productCategory.includes('material')) ||
          (subcategoryLabel.includes('uskuna') && productCategory.includes('uskuna')) ||
          (subcategoryLabel.includes('asbob') && productCategory.includes('asbob'))
        );
      });
      setSubcategoryProducts(filtered);
      if (filtered.length === 0) {
        console.log(`"${subcategory.label}" bo'yicha mahsulot topilmadi`);
      }
    } catch (err) {
      console.error("Subkategoriya mahsulotlarini yuklash xatosi:", err);
      setSubcategoryProducts([]);
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const filteredCategories = productCategories.filter(category =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCartAPI = async (product) => {
    try {
      setCartLoading(prev => ({ ...prev, [product.id]: true }));

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log("Iltimos, avval tizimga kiring!");
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
      if (fetchCart) fetchCart();
    } catch (error) {
      console.error("Savat xatosi:", error);
      console.log("Xato: " + (error.response?.data?.message || "Server bilan muammo"));
    } finally {
      setCartLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const openModal = () => {
    setIsModalOpen(true);
    clearFilters();
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="">
        <header className="sticky top-0 bg-white z-30">
          <div className="flex items-center gap-4">
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

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearCategory}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                )}
                <ChevronDown
                  size={20}
                  className={`text-gray-400 cursor-pointer transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-fadeIn">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-lg font-bold text-gray-800">Kategoriyalar</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {filteredCategories.length} ta
                        </span>
                        <button
                          onClick={() => setIsDropdownOpen(false)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        >
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

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
                              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                  <Icon color="#0891b2" />
                                </div>
                              </div>
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
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown className="text-cyan-500 rotate-90" size={20} />
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <StoreBanner slides={slides} />

        <StoreCategories />

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-[22px] md:text-[25px]">Ommabop mahsulotlar</h1>
          <div onClick={openModal} className="px-6 py-2 font-medium text-[16px] bg-[#BDF3FF] rounded-[10px] cursor-pointer text-black hover:bg-[#a2e9f7] transition-colors">
            Barchasi ({filteredProducts.length})
          </div>
        </div>

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
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 cursor-pointer">
              Qayta yuklash
            </button>
          </div>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pb-10">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigate={navigate}
                onAddToCart={handleAddToCartAPI}
                isLoading={cartLoading[product.id] || false}
                isInCart={cartItems?.some(item => (item.product_id?._id || item.productSnapshot?._id || item.product_id) === product.id)}
                onCompanyClick={(company) => navigate(`/companyproducts/${encodeURIComponent(company)}`)}
              />
            ))}
          </div>
        )}

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
                    className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
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
                  className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-6">
                {currentView === 'subcategories' ? (
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
                            isInCart={cartItems?.some(item => (item.product_id?._id || item.productSnapshot?._id || item.product_id) === product.id)}
                            onCompanyClick={(company) => navigate(`/companyproducts/${encodeURIComponent(company)}`)}
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
                          className="px-6 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors cursor-pointer"
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-start justify-center p-0 md:p-4 overflow-y-auto">
            <div
              ref={modalRef}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl mt-auto md:my-auto max-h-[90vh] md:max-h-[80vh] overflow-y-auto animate-slideUp"
            >
              <div className="sticky top-0 bg-white p-6 flex items-center justify-between border-b border-gray-100 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer">
                    <ArrowLeft size={28} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">Barcha Mahsulotlar </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    clearFilters();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="hidden sm:block sticky top-[73px] md:top-[81px] z-10 bg-white px-4 md:px-6 py-4 border-b border-gray-100 shadow-sm">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriya bo'yicha</label>
                      <select
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500 cursor-pointer"
                        value={selectedFilterCategory}
                        onChange={(e) => setSelectedFilterCategory(e.target.value)}
                      >
                        <option value="">Barcha kategoriyalar</option>
                        {productCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qidirish</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Mahsulot nomi bo'yicha qidirish..."
                          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500 cursor-pointer"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                        />
                        {searchFilter && (
                          <button
                            onClick={() => setSearchFilter("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                      >
                        Filtrlarni tozalash
                      </button>
                    </div>
                  </div>

                  {selectedFilterCategory && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-gray-600">Tanlangan kategoriya:</span>
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                        {productCategories.find(c => c.id === selectedFilterCategory)?.label || selectedFilterCategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:hidden sticky top-[73px] z-10 bg-white px-4 py-3 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} ta mahsulot
                    {(selectedFilterCategory || searchFilter) && (
                      <span className="text-cyan-600 ml-1">(filtrlangan)</span>
                    )}
                  </span>
                  <button
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${isMobileSearchOpen || selectedFilterCategory || searchFilter ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Search size={20} />
                  </button>
                </div>

                {isMobileSearchOpen && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategoriya</label>
                        <select
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500 text-sm cursor-pointer"
                          value={selectedFilterCategory}
                          onChange={(e) => setSelectedFilterCategory(e.target.value)}
                        >
                          <option value="">Barcha kategoriyalar</option>
                          {productCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Qidirish</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Mahsulot nomi..."
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan-500 text-sm cursor-pointer"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                          />
                          {searchFilter && (
                            <button
                              onClick={() => setSearchFilter("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            clearFilters();
                            setIsMobileSearchOpen(false);
                          }}
                          className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer"
                        >
                          Tozalash
                        </button>
                        <button
                          onClick={() => setIsMobileSearchOpen(false)}
                          className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-medium cursor-pointer"
                        >
                          Qo'llash
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6">
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="mb-4 text-gray-600">
                      {selectedFilterCategory || searchFilter ? (
                        <p>
                          <span className="font-semibold">{filteredProducts.length}</span> ta mahsulot topildi
                          {selectedFilterCategory && ` (${productCategories.find(c => c.id === selectedFilterCategory)?.label})`}
                          {searchFilter && ` ("${searchFilter}" bo'yicha)`}
                        </p>
                      ) : (
                        <p>Jami <span className="font-semibold">{filteredProducts.length}</span> ta mahsulot</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          navigate={navigate}
                          onAddToCart={handleAddToCartAPI}
                          isLoading={cartLoading[product.id] || false}
                          isInCart={cartItems?.some(item => (item.product_id?._id || item.productSnapshot?._id || item.product_id) === product.id)}
                          onCompanyClick={(company) => navigate(`/companyproducts/${encodeURIComponent(company)}`)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Mahsulotlar topilmadi</h3>
                    <p className="text-gray-500 mb-6">
                      {selectedFilterCategory || searchFilter
                        ? "Tanlangan filterlar bo'yicha hech qanday mahsulot topilmadi"
                        : "Hozircha mahsulotlar mavjud emas"}
                    </p>
                    {(selectedFilterCategory || searchFilter) && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors cursor-pointer"
                      >
                        Filtrlarni tozalash
                      </button>
                    )}
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

function ProductCard({ product, navigate, onAddToCart, isLoading, isInCart, onCompanyClick }) {
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await onAddToCart(product);
  };

  const handleCompanyClick = (e) => {
    e.stopPropagation();
    if (onCompanyClick && product.company) {
      onCompanyClick(product.company);
    }
  };

  return (
    <div
      onClick={() => navigate(`/mahsulot/${product.id}`)}
      className="cursor-pointer rounded-[20px] p-3 md:rounded-[30px] md:p-4 shadow-sm border border-gray-100 flex flex-col relative group transition-all hover:shadow-xl hover:-translate-y-1 h-full"
    >
      <div className="bg-gradient-to-br rounded-[15px] md:rounded-[20px] overflow-hidden mb-5 md:mb-4 flex items-center justify-center h-32 md:h-48">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="object-contain h-full w-full p-3 md:p-4 group-hover:scale-110 transition-all duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {!product.img && (
          <div className="flex items-center justify-center h-full w-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">Rasm mavjud emas</div>
            </div>
          </div>
        )}
      </div>
      <h3 className="text-gray-800 font-semibold text-[14px] md:text-[17px] mb-2 leading-tight min-h-[40px] line-clamp-2">
        {product.name}
      </h3>
      {product.categoryName && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full">
            {product.categoryName}
          </span>
        </div>
      )}
      {product.company && (
        <div 
          onClick={handleCompanyClick}
          className="cursor-pointer text-[13px] font-medium bg-[#E0F7FA] text-[#475569] rounded-2xl text-center px-3 py-1.5 mb-3 hover:bg-[#B2EBF2] transition-colors"
        >
          {product.company}
        </div>
      )}
      <div className="mt-auto">
        <p className="text-black font-bold text-[16px] md:text-[20px] mb-3">
          {product.price}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full py-2.5 md:py-3 rounded-[12px] md:rounded-[15px] flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer ${isLoading
              ? 'bg-gray-400'
              : isInCart
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                : 'bg-[#00BCE4] hover:bg-[#00ACE4] text-white shadow-lg'
            }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
              Qo'shilmoqda...
            </>
          ) : isInCart ? (
            <>
              <Check size={16} className="md:size-[18px]" /> Savatda mavjud
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