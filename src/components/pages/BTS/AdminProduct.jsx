import React, { useState, useEffect } from 'react';
import { Search, Package, Edit2, Trash2, Loader2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

function AdminProduct() {
  const PRIMARY_COLOR = "#00BCE4";
  const BASE_URL = "https://app.dentago.uz";

  // States - products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // States - form (add / edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    company: '',
    price: '',
    description: '',
    deliveryDays: '',
    salePercentage: '',
    quantity: '',
    code: '',
    vat_percent: 0,
    package_code: '',
    imageUrl: [],
  });
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // codeOptions — sizning ProductForm'dagi ro'yxatdan ko'chirib oldim
  const codeOptions = [
    // Birinchi va oldingi rasmlardan olingan dorilar va materiallar
    { code: '03004002004003000', name: 'Гексетидин - A01AB12 СТОМАТИДИН ® (Bosnalijek)' },
    { code: '03004002004003001', name: 'Гексетидин - A01AB12 СТОМАТИДИН ® (Bosnalijek) Раствор для местного применения 0,1% 200мл флаконы' },
    { code: '03004010003004001', name: 'Фамотидин - A02BA03 ГАСТРОСИДИН-DF (Dentafill Plyus) Таблетки покрытые оболочкой 20 мг упаковки контурные ячейковые №10(1x10)' },
    { code: '03004010003004002', name: 'Фамотидин - A02BA03 ГАСТРОСИДИН-DF (Dentafill Plyus) Таблетки покрытые оболочкой 20 мг упаковки контурные ячейковые №20(2x10)' },
    { code: '03004010003004003', name: 'Фамотидин - A02BA03 ГАСТРОСИДИН-DF (Dentafill Plyus) Таблетки покрытые оболочкой 40 мг упаковки контурные ячейковые №10(1x10)' },
    { code: '03004010003004004', name: 'Фамотидин - A02BA03 ГАСТРОСИДИН-DF (Dentafill Plyus) Таблетки покрытые оболочкой 40 мг упаковки контурные ячейковые №20(2x10)' },
    { code: '03004034005019001', name: 'Лактулоза - A06AD11 ДЕФИЛАК (Dentafill Plyus) Сироп для приема внутрь 1000миллилитр флаконы' },
    { code: '03004034005019002', name: 'Лактулоза - A06AD11 ДЕФИЛАК (Dentafill Plyus) Сироп для приема внутрь 100миллилитр флаконы' },
    { code: '03004034005019003', name: 'Лактулоза - A06AD11 ДЕФИЛАК (Dentafill Plyus) Сироп для приема внутрь 200миллилитр флаконы' },
    { code: '03004034005019004', name: 'Лактулоза - A06AD11 ДЕФИЛАК (Dentafill Plyus) Сироп для приема внутрь 500миллилитр флаконы' },
    { code: '03004034005019005', name: 'Лактулоза - A06AD11 ДЕФИЛАК (Dentafill Plyus) Сироп для приема внутрь 50миллилитр флаконы' },
    { code: '03004097001006001', name: 'Гепарин - B01AB01 ГЕПАРИН-MF (Mediofarm) Раствор для инъекций 5000 ме/мл 1мл ампулы №10(10x1)' },
    { code: '03004097001006002', name: 'Гепарин - B01AB01 ГЕПАРИН-MF (Mediofarm) Раствор для инъекций 5000 ме/мл 1мл ампулы №10(1x10)' },
    { code: '03004097001006003', name: 'Гепарин - B01AB01 ГЕПАРИН-MF (Mediofarm) Раствор для инъекций 5000 ме/мл 1мл ампулы №10(2x5)' },
    { code: '03004097001006004', name: 'Гепарин - B01AB01 ГЕПАРИН-MF (Mediofarm) Раствор для инъекций 5000 ме/мл 1мл ампулы №5(1x5)' },
    { code: '03004097001006005', name: 'Гепарин - B01AB01 ГЕПАРИН-MF (Mediofarm) Раствор для инъекций 5000 ме/мл 1мл ампулы №5(5x1)' },
    { code: '03004199001013001', name: 'Клотримазол - D01AC01 КЛОТРИМАЗОЛ (Dentafill Plyus) Мазь 1% 20г тубы' },
    { code: '03004199001013002', name: 'Клотримазол - D01AC01 КЛОТРИМАЗОЛ (Dentafill Plyus) Мазь 1% 25г тубы' },
    { code: '03004199001013003', name: 'Клотримазол - D01AC01 КЛОТРИМАЗОЛ (Dentafill Plyus) Мазь 1% 30г тубы' },

    // Ikkinchi rasm – stomatologik materiallar va dorilar
    { code: '02520001004000000', name: 'Стоматологик гипс' },
    { code: '02520002002000000', name: 'Стоматологик тиббиёт гипси' },
    { code: '02916001007000000', name: 'Фармацевтик субстанция диклофенак натрий' },
    { code: '03003002001000000', name: 'Кальций хлорид эритмаси' },
    { code: '03004002001001000', name: 'Хлоргексидин - A01AB03 Гексикон® (Nizhegorodskii himiko-farm zavod)' },
    { code: '03004002001001001', name: 'Хлоргексидин - A01AB03 Гексикон® (Nizhegorodskii himiko-farm zavod) Суппозитории вагинальные 16 мг упаковки контурные ячейковые №10(2x5)' },
    { code: '03004002002000000', name: 'Миконазол - A01AB09' },
    { code: '03004002003000000', name: 'Метронидазол - A01AB17 АНАСЕП® ГЕЛЬ (Marion Biotech) Гель для десен 20г тубы' },
    { code: '03004002005010001', name: 'Метронидазол - A01AB17 АНАСЕП® ГЕЛЬ (Marion Biotech) Гель для десен 5г саше №50(1x50)' },
    { code: '0300400202201001', name: 'Метронидазол, хлоргексидин - A01AB ДЖИМЕТРИЛ® (Agio Pharmaceuticals) Гель стоматологический 20г тубы' },
    { code: '03006002002001001', name: 'Тиш цементлари ва тиш пломбалаш материаллари' },

    // Uchinchi rasm – stomatologik asbob-uskunalar
    { code: '02207002015000000', name: 'Gutta-percha points' },
    { code: '02207002016000000', name: 'Paper points' },
    { code: '02207002017000000', name: 'Rubber dam sheet' },
    { code: '02520002018000000', name: 'Rubber dam clamp' },
    { code: '02520002019000000', name: 'Rubber dam punch' },
    { code: '02520002020000000', name: 'Matrix band' },
    { code: '02520002021000000', name: 'Matrix retainer (Tofflemire)' },
    { code: '02207002018000000', name: 'Wedges (wooden/plastic)' },
    { code: '02207002019000000', name: 'Dental cotton rolls' },
    { code: '02207002020000000', name: 'Dental bibs (patient napkins)' },
    { code: '02520002022000000', name: 'Saliva ejector' },
    { code: '02520002023000000', name: 'High vacuum suction tip' },
    { code: '02520002024000000', name: 'Dental curing light shield' },
    { code: '02520002025000000', name: 'Composite finishing kit (discs, strips)' },
    { code: '02207002021000000', name: 'Polishing paste' },
    { code: '02520002026000000', name: 'Prophy cups & brushes' },
    { code: '02520002027000000', name: 'Ultrasonic scaler tips' },
    { code: '02520002028000000', name: 'Endo motor files (rotary NiTi)' },
    { code: '02520002029000000', name: 'Endo irrigation needles' },
    { code: '02207002022000000', name: 'Irrigation solution (NaOCl, CHX)' },

    // Yangi rasm – stomatologik xizmatlar va qurilmalar (oxirgi qo'shilgan)
    { code: '09018013001001001', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09018013001001002', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09018013001001003', name: 'Стоматологический картридж-ротор APPLEDENTAL наконечник BLUE-CA' },
    { code: '09018013001001004', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09018013003000000', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09018013004000000', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09018013014000000', name: 'Бошқа, стоматологик қурилмалар ва мосламалар' },
    { code: '09021001011000000', name: 'Стоматологик имплантатлар учун абатментлар' },
    { code: '09021001027000000', name: 'Имплантатлар' },
    { code: '10901003001000000', name: 'Стоматология соҳасидаги хизматлар' },
    { code: '10901003003000000', name: 'Ортопед стоматология хизмати' },
    { code: '10901003004000000', name: 'Стоматологик маслахат ва касалликларнинг олдини олиш хизматлари' },
    { code: '10901003005000000', name: 'Тиш даволаш учун стоматологик хизматлар' },
    { code: '10901003006000000', name: 'Оғиз бўшлиғи касалликларини даволаш учун стоматологик хизматлар' },
    { code: '10901003007000000', name: 'Тиш протезлаш хизмати' },
    { code: '10901003008000000', name: 'Терапевтика стоматология хизмати' },
    { code: '10901003009000000', name: 'Жарроҳлик стоматология хизматлари' },
    { code: '10902001046000000', name: 'Консультация стоматолога' },
    { code: '10902002002000002', name: 'Лучевая диагностика, Рентгенодиагностика' },
    { code: '10902003047000000', name: 'Даволаш ва муолажалар бўйича стоматолог хизматлари' }
  ];

  // Token
  const token = localStorage.getItem('accessToken');

  // Mahsulotlarni yuklash
  const fetchProducts = async () => {
    if (!token) {
      setError("Token topilmadi. Iltimos tizimga qayta kiring.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/product/app/product/all?limit=100000000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Mahsulotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  // Kategoriyalarni yuklash
  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Kategoriyalar yuklanmadi", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredProducts.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Qidiruv filtri
  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get current page products
  const getCurrentProducts = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  // Pagination info
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Effect for search - reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '', sku: '', category: '', company: '', price: '', description: '',
      deliveryDays: '', salePercentage: '', quantity: '', code: '', vat_percent: 0,
      package_code: '', imageUrl: [],
    });
    setSelectedFiles([]);
    setPreviewImages([]);
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  // Modalni ochish — tahrirlash
  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);

    const editData = {
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      company: product.company || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      deliveryDays: product.deliveryDays?.toString() || '',
      salePercentage: product.salePercentage?.toString() || '',
      quantity: product.quantity?.toString() || '',
      code: product.code || '',
      vat_percent: product.vat_percent?.toString() || '0',
      package_code: product.package_code || '',
      imageUrl: product.imageUrl || [],
    };

    setFormData(editData);
    setPreviewImages(
      (product.imageUrl || []).map(img => `${BASE_URL}/images/${img}`)
    );
    setSelectedFiles([]);
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  // Fayl tanlash
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  // Rasm o'chirish
  const removeImage = (index) => {
    const isOld = index < (currentProduct?.imageUrl?.length || 0);
    if (isOld) {
      const newUrls = [...formData.imageUrl];
      newUrls.splice(index, 1);
      setFormData(prev => ({ ...prev, imageUrl: newUrls }));
    } else {
      const newFiles = [...selectedFiles];
      newFiles.splice(index - (currentProduct?.imageUrl?.length || 0), 1);
      setSelectedFiles(newFiles);
    }
    setPreviewImages(prev => {
      if (!isOld) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Rasmlarni serverga yuklash
  const uploadNewImages = async () => {
    if (selectedFiles.length === 0) return formData.imageUrl;

    setUploading(true);
    const uploaded = [];

    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await axios.post(`${BASE_URL}/api/upload/image`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        const filename = res.data?.file?.savedName || res.data?.filename || '';
        if (filename) uploaded.push(filename);
      }
      return [...(formData.imageUrl || []), ...uploaded];
    } catch (err) {
      setFormError("Rasmlarni yuklab bo'lmadi");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.sku || !formData.category || !formData.code || !formData.package_code) {
      setFormError("Majburiy maydonlarni to'ldiring (* belgilanganlar)");
      return;
    }

    setFormLoading(true);

    try {
      const finalImages = await uploadNewImages();
      if (finalImages === null) throw new Error("Rasm yuklashda xato");

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        deliveryDays: parseInt(formData.deliveryDays) || 0,
        salePercentage: parseInt(formData.salePercentage) || 0,
        vat_percent: parseFloat(formData.vat_percent) || 0,
        imageUrl: finalImages,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`${BASE_URL}/api/product/${currentProduct._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormSuccess("Mahsulot yangilandi!");
        setProducts(prev =>
          prev.map(p => (p._id === currentProduct._id ? res.data : p))
        );
      } else {
        res = await axios.post(`${BASE_URL}/api/product`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormSuccess("Mahsulot qo'shildi!");
        setProducts(prev => [res.data, ...prev]);
      }

      setTimeout(() => {
        setShowFormModal(false);
      }, 1800);
    } catch (err) {
      setFormError(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setFormLoading(false);
    }
  };

  // O'chirish
  const deleteProduct = async (id) => {
    if (!window.confirm("Mahsulotni o'chirishni xohlaysizmi?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`${BASE_URL}/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p._id !== id));
      alert("O'chirildi!");
    } catch (err) {
      alert(err.response?.data?.message || "O'chirishda xato");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#00BCE4]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header + Search + Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Mahsulotlar <span style={{ color: PRIMARY_COLOR }}>Ombori</span>
          </h1>
          <p className="text-slate-500">Jami: {filteredProducts.length} ta</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BCE4]"
            />
          </div>

          {/* <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#00BCE4] text-white px-5 py-2 rounded-lg hover:bg-[#0099c2] transition"
          >
            <Plus size={18} /> Yangi mahsulot
          </button> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Mahsulot</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Kategoriya</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Narx</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="">
            {getCurrentProducts().map(product => (
              <tr key={product._id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {product.imageUrl?.[0] ? (
                        <img
                          src={`${BASE_URL}/images/${product.imageUrl[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={e => e.target.src = "https://via.placeholder.com/56?text="}
                        />
                      ) : (
                        <Package className="w-8 h-8 m-3 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-slate-500">SKU: {product.sku || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {product.category || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  {product.price?.toLocaleString('uz-UZ')} so'm
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      disabled={deletingId === product._id}
                      className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      {deletingId === product._id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl">
          <div className="text-sm text-slate-600">
            Jami: <span className="font-semibold">{filteredProducts.length}</span> ta mahsulot, 
            Sahifa <span className="font-semibold">{currentPage}</span> dan <span className="font-semibold">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-10 h-10 rounded-lg cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#00BCE4] text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------- FORM MODAL ---------------------- */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">
                {isEditing ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 cursor-pointer hover:bg-slate-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">{formError}</div>
              )}
              {formSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">{formSuccess}</div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Nomi *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium mb-1">SKU / Artikul *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">Narx (so'm) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Soni</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Kategoriya *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">— Tanlang —</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Kod *</label>
                  <select
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">— Tanlang —</option>
                    {codeOptions.map((item, i) => (
                      <option key={i} value={item.code}>
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Code */}
                <div>
                  <label className="block text-sm font-medium mb-1">Qadoq kodi *</label>
                  <input
                    type="text"
                    value={formData.package_code}
                    onChange={e => setFormData({...formData, package_code: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Rasmlar</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="block cursor-pointer w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00BCE4]/10 file:text-[#00BCE4] hover:file:bg-[#00BCE4]/20"
                  />

                  {previewImages.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {previewImages.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt="preview"
                            className="w-24  h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Tavsif</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-6 cursor-pointer py-2 border rounded-lg hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading || uploading}
                    className="px-6 py-2 cursor-pointer
                     bg-[#00BCE4] text-white rounded-lg hover:bg-[#0099c2] disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading || uploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : isEditing ? "Yangilash" : "Qo'shish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProduct;