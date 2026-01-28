import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Truck, ShoppingBag } from "lucide-react";
import axios from "axios";

const BASE_URL = "https://app.dentago.uz";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        let productData = null;
        const token = localStorage.getItem("accessToken");

        // 1. Token bilan sinab ko'ramiz
        if (token) {
          try {
            const res = await axios.get(`${BASE_URL}/api/product/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 8000,
            });
            productData = res.data.data || res.data;
          } catch (authErr) {
            console.log("Token bilan xato:", authErr.message);
          }
        }

        // 2. Agar token ishlamasa yoki yo'q bo'lsa - umumiy ro'yxatdan qidiramiz
        if (!productData) {
          const allRes = await axios.get(
            `${BASE_URL}/api/product/app/product/all?limit=500`,
            { timeout: 10000 }
          );

          const allProducts = allRes.data.data || allRes.data || [];
          productData = allProducts.find((p) => p._id === id || p.id === id);

          if (!productData) {
            throw new Error("Mahsulot topilmadi (ID: " + id + ")");
          }
        }

        // Ma'lumotlarni formatlash
        const formatted = {
          ...productData,
          id: productData._id || productData.id || id,
          name: productData.name || "Nomsiz mahsulot",
          price: productData.price
            ? `${Number(productData.price).toLocaleString("uz-UZ")} so'm`
            : "Narx yo'q",
          img: productData.imageUrl?.[0]
            ? `${BASE_URL}/images/${productData.imageUrl[0]}`
            : "/placeholder-product.jpg",
          artikul: productData.artikul || productData.sku || "—",
          description: productData.description || "Tavsif hali qo'shilmagan",
        };

        setProduct(formatted);
      } catch (err) {
        console.error("Mahsulot yuklash xatosi:", err);
        setError(err.message || "Mahsulot yuklanmadi. Internet yoki server bilan muammo bo'lishi mumkin.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
  
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Savatga qo'shish uchun tizimga kirish kerak!");
      navigate("/login");
      return;
    }
  
    const priceNumber = product.price
      ? parseInt(product.price.replace(/\s|so'm/g, ""), 10)
      : 0;
  
    try {
      await axios.post(
        `${BASE_URL}/api/cart/add`,
        {
          product_id: product.id,
          quantity: 1,
          price: priceNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        }
      );
  
   
  
    } catch (err) {
      alert("Savatga qo'shishda xato: " + (err.response?.data?.message || "Server bilan muammo"));
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Mahsulot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-red-500 text-7xl mb-6">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Kechirasiz...</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error || "Mahsulot topilmadi"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-cyan-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-cyan-700 transition-colors shadow-md"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen   pb-28 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="  mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={26} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart size={22} className="text-gray-700" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 size={22} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Asosiy kontent */}
      <main className="  mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {/* Rasm */}
        <div className="  rounded-2xl   overflow-hidden mb-6 md:mb-8">
          <div className="aspect-[4/3] md:aspect-[5/4]   flex items-center justify-center p-4 md:p-8">
            <img
              src={product.img}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
              onError={(e) => {
                e.target.src = "/placeholder-product.jpg";
              }}
            />
          </div>
        </div>

        {/* Asosiy ma'lumotlar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-gray-500">
              Artikul: <span className="text-cyan-600 font-medium">{product.artikul}</span>
            </p>

            <div className="pt-2">
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {product.price}
              </p>
            </div>
          </div>
        </div>

        {/* Yetkazib berish */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 md:p-6 mb-6 flex items-center gap-4 border border-green-100">
          <div className="bg-white p-3 rounded-xl shadow-sm text-green-600 flex-shrink-0">
            <Truck size={28} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Tez yetkazib berish</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Odatda 3–5 kun ichida Toshkent bo'ylab
            </p>
          </div>
        </div>

        {/* Tavsif */}
        {product.description !== "Tavsif hali qo'shilmagan" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mahsulot haqida</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </main>

      {/* Pastki tugma */}
      <div className="fixed bottom-0 left-70 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={handleAddToCart}
            className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 
                     text-white py-4 rounded-xl font-semibold text-lg 
                     flex items-center justify-center gap-3 transition-colors shadow-md"
          >
            <ShoppingBag size={22} />
            Savatga qo'shish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;