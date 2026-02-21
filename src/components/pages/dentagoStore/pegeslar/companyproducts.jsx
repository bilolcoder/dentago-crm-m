import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  X,
  Check,
  ShoppingBag,
} from "lucide-react";
import axios from "axios";

const BASE_URL = "https://app.dentago.uz/";

function CompanyProducts() {
  const { company } = useParams();
  const navigate = useNavigate();

  const [companyProducts, setCompanyProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cartLoading, setCartLoading] = useState({});
  const [localCart, setLocalCart] = useState([]); // lokal savat (context yo'q)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `${BASE_URL}api/product/app/product/all?limit=500`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        let data = response.data?.data || response.data || [];

        const formatted = data.map((p) => ({
          ...p,
          id: p._id || p.id,
          name: p.name || "Nomsiz mahsulot",
          price: p.price
            ? `${Number(p.price).toLocaleString("uz-UZ")} so'm`
            : "Narx yo'q",
          img: p.imageUrl?.[0]
            ? `${BASE_URL}images/${p.imageUrl[0]}`
            : "",
          category: p.category || "Umumiy",
          categoryName: p.categoryName || p.category || "Umumiy",
          company: p.company || "Noma'lum kompaniya",
        }));

        // faqat shu kompaniya mahsulotlari
        const filteredByCompany = formatted.filter(
          (p) => p.company === decodeURIComponent(company)
        );

        setCompanyProducts(filteredByCompany);
        setFilteredProducts(filteredByCompany);
      } catch (err) {
        console.error("Mahsulot yuklash xatosi:", err);
        setError("Mahsulotlarni yuklab bo'lmadi. Iltimos keyinroq urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [company]);

  // Filterlarni qo'llash
  useEffect(() => {
    let result = [...companyProducts];

    // Kategoriya bo'yicha filter
    if (categoryFilter) {
      result = result.filter((p) => {
        const cat = (p.categoryName || p.category || "").toLowerCase();
        return cat.includes(categoryFilter.toLowerCase());
      });
    }

    // Qidiruv bo'yicha filter
    if (searchFilter.trim()) {
      const term = searchFilter.toLowerCase().trim();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(term) ||
        (p.categoryName || p.category || "").toLowerCase().includes(term)
      );
    }

    setFilteredProducts(result);
  }, [searchFilter, categoryFilter, companyProducts]);

  const clearFilters = () => {
    setCategoryFilter("");
    setSearchFilter("");
  };

  // Savatga qo'shish (lokal + backend)
  const handleAddToCart = async (product) => {
    try {
      setCartLoading((prev) => ({ ...prev, [product.id]: true }));

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Iltimos avval tizimga kiring!");
        navigate("/login");
        return;
      }

      const priceNum = product.price
        ? parseInt(product.price.replace(/\s|so'm/g, ""), 10)
        : 0;

      const payload = {
        product_id: product._id || product.id,
        quantity: 1,
        price: priceNum,
      };

      await axios.post(`${BASE_URL}api/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      });

      // lokal cart ni yangilash
      setLocalCart((prev) => [
        ...prev.filter((item) => item.id !== product.id),
        { ...product, quantity: 1 },
      ]);

    } catch (err) {
      console.error("Savat xatosi:", err);
      alert("Xato yuz berdi: " + (err.response?.data?.message || err.message));
    } finally {
      setCartLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const decodedCompany = decodeURIComponent(company);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={28} className="text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {decodedCompany} mahsulotlari
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Desktop Filter */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriya
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer transition"
              >
                <option value="">Barcha kategoriyalar</option>
                <option value="stomatologik-materiallar">Stomatologik materiallar</option>
                <option value="stomatologik-uskunalari">Stomatologik uskunalari</option>
                <option value="stomatologik-teknik-materiallar">Texnik materiallar</option>
                <option value="stomatologik-teknik-asboblar">Texnik asboblar</option>
                <option value="cad-cam-uskunalari">CAD/CAM uskunalari</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qidiruv
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Mahsulot nomi yoki tavsif bo'yicha..."
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer transition"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">
            {filteredProducts.length} ta mahsulot
            {(categoryFilter || searchFilter) && (
              <span className="text-cyan-600 ml-1">(filtrlangan)</span>
            )}
          </span>
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`p-3 rounded-xl transition-colors cursor-pointer ${
              isMobileSearchOpen || categoryFilter || searchFilter
                ? "bg-cyan-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mobile Filter Panel */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-sm p-5 mb-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-cyan-500 outline-none cursor-pointer"
                >
                  <option value="">Barcha kategoriyalar</option>
                  <option value="stomatologik-materiallar">Stomatologik materiallar</option>
                  <option value="stomatologik-uskunalari">Stomatologik uskunalari</option>
                  <option value="stomatologik-teknik-materiallar">Texnik materiallar</option>
                  <option value="stomatologik-teknik-asboblar">Texnik asboblar</option>
                  <option value="cad-cam-uskunalari">CAD/CAM uskunalari</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qidiruv
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Mahsulot nomi..."
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-cyan-500 outline-none cursor-pointer"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  clearFilters();
                  setIsMobileSearchOpen(false);
                }}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Tozalash
              </button>
            </div>
          </div>
        )}

        {/* Mahsulotlar Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 cursor-pointer transition-colors"
            >
              Qayta yuklash
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/mahsulot/${product.id}`)}
                className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 group"
              >
                {/* Rasm */}
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "";
                      e.target.alt = "Rasm yuklanmadi";
                    }}
                  />
                </div>

                {/* Ma'lumotlar */}
                <div className="p-4 flex flex-col">
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg line-clamp-2 min-h-[2.8rem] mb-2">
                    {product.name}
                  </h3>

                  {product.categoryName && (
                    <span className="inline-block px-3 py-1 text-xs bg-cyan-50 text-cyan-700 rounded-full mb-3 self-start">
                      {product.categoryName}
                    </span>
                  )}

                  <div className="mt-auto">
                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                      {product.price}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={cartLoading[product.id]}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all cursor-pointer ${
                        cartLoading[product.id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : localCart.some((item) => item.id === product.id)
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-[#00BCE4] hover:bg-[#00ACE4]"
                      }`}
                    >
                      {cartLoading[product.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Qo'shilmoqda...</span>
                        </>
                      ) : localCart.some((item) => item.id === product.id) ? (
                        <>
                          <Check size={18} />
                          <span>Savatda</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>Savatga</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <div className="text-gray-400 text-7xl mb-6">📦</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              Mahsulot topilmadi
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {categoryFilter || searchFilter
                ? "Tanlangan filterlar bo‘yicha mos mahsulot yo‘q"
                : `${decodedCompany} hozircha mahsulot qo‘shmagan`}
            </p>
            {(categoryFilter || searchFilter) && (
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyProducts;