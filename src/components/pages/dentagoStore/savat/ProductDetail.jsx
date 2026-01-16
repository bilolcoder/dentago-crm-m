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
        const token = localStorage.getItem('accessToken');

        const response = await axios.get(`${BASE_URL}/api/product/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = response.data.data || response.data;
        if (!data) throw new Error("Mahsulot topilmadi");

        setProduct({
          ...data,
          id: data._id || data.id,
          name: data.name || "Nomsiz",
          price: data.price ? `${Number(data.price).toLocaleString('uz-UZ')} so'm` : "Narx yo'q",
          img: data.imageUrl?.[0] ? `${BASE_URL}/images/${data.imageUrl[0]}` : "",
          description: data.description || "Tavsif mavjud emas"
        });
      } catch (err) {
        setError("Mahsulot yuklanmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("Kirish kerak!");
      navigate('/login');
      return;
    }

    const price = product.price ? parseInt(product.price.replace(/\s|so'm/g, '')) : 0;

    try {
      await axios.post(`${BASE_URL}/api/cart/add`, {
        product_id: product.id,
        quantity: 1,
        price
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert("Savatga qo'shildi!");
    } catch (err) {
      alert("Xato: " + (err.response?.data?.message || "Server xatosi"));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;

  if (error || !product) return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">{error || "Mahsulot topilmadi"}</div>;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 bg-white p-4 flex justify-between items-center shadow-sm z-10">
        <button onClick={() => navigate(-1)}><ArrowLeft size={28} /></button>
        <div className="flex gap-4">
          <Heart size={24} />
          <Share2 size={24} />
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="bg-gray-50 rounded-3xl p-6 mb-8">
          <img src={product.img} alt={product.name} className="w-full max-h-[500px] object-contain mx-auto" />
        </div>

        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-500 mb-6">Artikul: {product.artikul || "—"}</p>
        <h2 className="text-4xl font-bold text-cyan-600 mb-8">{product.price}</h2>

        <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex items-center gap-4">
          <Truck size={32} className="text-green-600" />
          <div>
            <p className="font-bold">Yetkazib berish</p>
            <p className="text-sm text-gray-600">3–5 ish kuni ichida</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Tavsif</h3>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 shadow-lg">
        <button
          onClick={handleAddToCart}
          className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 active:scale-95"
        >
          <ShoppingBag size={24} /> Savatga qo'shish
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;