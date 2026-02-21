import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  Phone,
  Award,
  Info,
  Loader2,
  MapPin,
  Star,
  Image as ImageIcon,
  X,
  Send,
  ClipboardList,
  MessageSquare,
  User
} from "lucide-react";

const TechnicianDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [revLoading, setRevLoading] = useState(false);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    service: "",
    comment: ""
  });

  // Modal ochilganda telefon maydoniga +998- qo‘yish
  useEffect(() => {
    if (isOrderModalOpen && !formData.phone) {
      setFormData((prev) => ({ ...prev, phone: "+998-" }));
    }
  }, [isOrderModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      try {
        setLoading(true);

        const techRes = await axios.get(`https://app.dentago.uz/api/public/technicians/${id}`);
        if (techRes.data?.success) {
          setTech(techRes.data.data.technician);
        }

        setRevLoading(true);
        try {
          const revRes = await axios.get(`https://app.dentago.uz/api/public/technicians/${id}/reviews`);
          if (revRes.data?.success) {
            setReviews(revRes.data.data || []);
          }
        } catch (err) {
          console.error("Fikrlarni yuklashda xatolik:", err);
        } finally {
          setRevLoading(false);
        }

        if (token) {
          setReqLoading(true);
          try {
            const reqRes = await axios.get(`https://app.dentago.uz/api/user/technician-requests?limit=3`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (reqRes.data?.data) {
              setRequests(reqRes.data.data.slice(0, 5));
            }
          } catch (err) {
            console.error("So'rovlarni yuklashda xatolik:", err);
          } finally {
            setReqLoading(false);
          }
        }
      } catch (error) {
        console.error("Umumiy yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 0 && !digits.startsWith("998")) {
      digits = "998" + digits;
    }
    digits = digits.substring(0, 12);

    let formatted = "";
    if (digits.length > 0) formatted += "+" + digits.substring(0, 3);
    if (digits.length > 3) formatted += "-" + digits.substring(3, 5);
    if (digits.length > 5) formatted += "-" + digits.substring(5, 8);
    if (digits.length > 8) formatted += "-" + digits.substring(8, 10);
    if (digits.length > 10) formatted += "-" + digits.substring(10, 12);

    return formatted;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      alert("Tizimga kirmagansiz! Iltimos, avval login qiling.");
      return;
    }

    setOrderLoading(true);
    const payload = {
      client: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email
      },
      service: formData.service,
      comment: formData.comment
    };

    try {
      const res = await axios.post(
        `https://app.dentago.uz/api/public/technicians/${id}/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (res.status === 200 || res.status === 201) {
        setIsOrderModalOpen(false);
        setFormData({ fullName: "", phone: "", email: "", service: "", comment: "" });

        // Yangilash
        const updatedReqs = await axios.get(`https://app.dentago.uz/api/user/technician-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(updatedReqs.data?.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("POST Xatosi:", error.response);
      alert(error.response?.status === 401 ? "Avtorizatsiya xatosi!" : "Xatolik yuz berdi.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#00C1F3]" size={40} />
    </div>
  );

  if (!tech) return <div className="text-center py-20 font-bold">Ma'lumot topilmadi.</div>;

  return (
    <div className="pb-20 bg-white">
      {/* NAVBAR */}
      <div className="sticky top-0 z-30 py-4 bg-white/80 backdrop-blur-md border-b border-gray-50 px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}  className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Mutaxassis Profili</h1>
        </div>
      </div>

      <div className="mt-6">
        {/* ASOSIY KARTA */}
        <div className="flex flex-col lg:flex-row rounded-[32px] overflow-hidden border border-gray-100 shadow-sm mb-12">
          <div className="w-full lg:w-2/5 relative bg-gray-50 aspect-[4/5] lg:aspect-auto">
            <img src={tech.avatar || "https://via.placeholder.com/600x800"} className="w-full h-full object-cover" alt="tech" />
            {tech.isApproved && (
              <div className="absolute top-6 left-6 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                Tasdiqlangan
              </div>
            )}
          </div>

          <div className="w-full lg:w-3/5 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">{tech.fullName}</h2>
              <p className="text-[#00C1F3] font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                <Award size={18} /> {tech.specialization || "Professional Texnik"}
              </p>

              <div className="grid grid-cols-2 gap-2 py-6 border-y border-gray-50 mb-8 text-center bg-gray-50/50 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Tajriba</p>
                  <p className="text-lg font-bold">{tech.experienceYears} yil</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Galereya</p>
                  <p className="text-lg font-bold">{tech.gallery?.length || 0} ta</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-[#00C1F3] rounded-xl"><Phone size={22} /></div>
                  <a href={`tel:${tech.phone}`} className="font-bold text-lg hover:text-[#00C1F3]">{tech.phone}</a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl"><MapPin size={22} /></div>
                  <p className="font-bold text-lg">{tech.address || "Manzil kiritilmagan"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <a href={`tel:${tech.phone}`} className="flex-1 bg-gray-100 text-center py-5 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                BOG'LANISH
              </a>
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="flex-1 cursor-pointer  bg-[#00C1F3] text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
              >
                BUYURTMA BERISH
              </button>
            </div>
          </div>
        </div>

        {/* ISH NAMUNALARI */}
        {tech.gallery?.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-black mb-8 uppercase flex items-center gap-3 text-gray-800">
              <ImageIcon className="text-[#00C1F3]" /> Ish namunalari
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tech.gallery.map((img, idx) => (
                <div key={idx} onClick={() => setSelectedImg(img)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer bg-gray-100 group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="work" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIKRLAR */}
        <div className="mb-16">
          <h3 className="text-xl font-black mb-8 uppercase flex items-center gap-3 text-gray-800">
            <Star className="text-yellow-400 fill-yellow-400" /> Mijozlar fikri
          </h3>
          {revLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#00C1F3]" /></div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-[#00C1F3] rounded-full flex items-center justify-center font-bold">
                        {rev.userName ? rev.userName[0] : <User size={18}/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{rev.userName || "Mijoz"}</h4>
                        <p className="text-[10px] text-gray-400">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Yaqinda"}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star key={starIdx} size={14} className={starIdx < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Hozircha fikrlar mavjud emas</p>
            </div>
          )}
        </div>

        {/* SO'ROVLAR RO'YXATI */}
        <div className="mt-20 pt-12 border-t">
          <h3 className="text-xl font-black mb-8 uppercase flex items-center gap-3 text-gray-800">
            <ClipboardList className="text-orange-500" /> So'nggi so'rovlar
          </h3>
          {reqLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300" /></div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-[24px] flex justify-between items-center border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#00C1F3] shadow-sm">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{req.client?.fullName}</h4>
                      <p className="text-sm text-[#00C1F3] font-semibold">{req.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-gray-300" />
                    <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 rounded-lg uppercase">Yangi</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Hozirda so'rovlar mavjud emas</p>
            </div>
          )}
        </div>
      </div>

      {/* BUYURTMA MODALI */}
      {isOrderModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
          onClick={() => setIsOrderModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase text-gray-900">Buyurtma yuborish</h3>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-5">
              <input
                required
                placeholder="F.I.SH"
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#00C1F3] focus:bg-white transition-all"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1.5 font-medium">
                    Telefon raqami <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+998-90-123-45-67"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData({ ...formData, phone: formatted });
                    }}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#00C1F3] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <input
                required
                placeholder="Xizmat turi (masalan: Protez)"
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#00C1F3] focus:bg-white transition-all"
                value={formData.service}
                onChange={e => setFormData({...formData, service: e.target.value})}
              />

              <textarea
                placeholder="Izoh..."
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-[#00C1F3] focus:bg-white h-28 resize-none transition-all"
                value={formData.comment}
                onChange={e => setFormData({...formData, comment: e.target.value})}
              ></textarea>

              <button
                disabled={orderLoading}
                className={`w-full bg-[#00C1F3] text-white py-5 rounded-2xl font-black flex justify-center gap-3 hover:bg-[#00a8d9] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {orderLoading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <Send size={20} /> YUBORISH
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE ZOOM MODAL */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform">
            <X size={32} />
          </button>
          <img
            src={selectedImg}
            className="max-w-full max-h-[85vh] rounded-2xl animate-in zoom-in-95"
            alt="full"
          />
        </div>
      )}
    </div>
  );
};

export default TechnicianDetail;
