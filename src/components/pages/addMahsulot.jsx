import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Package, Loader2, Edit3, Trash2, Plus, Search, Eye, X, CheckCircle, AlertCircle, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';

function AddMahsulot() {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [editForm, setEditForm] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    company: '',
    description: '',
    deliveryDays: '',
    salePercentage: '',
    quantity: '',
    code: '',
    vat_percent: 0,
    package_code: '',
    imageUrl: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [codeOptions, setCodeOptions] = useState([
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

    // Yangi rasm – stomatologik xizmatlar va qurilmalar
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
  ]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const BASE_URL = "https://app.dentago.uz";
  const TOKEN = localStorage.getItem('accessToken');
  const { user } = useData();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Qidiruv maydoni o'zgarganda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults(products);
      setCurrentPage(1); // faqat qidiruv tozalandanda 1-sahifaga
    } else {
      handleSearch();
    }
  }, [searchTerm]); // ← products ni bu yerdan olib tashladik!

  // products o'zgarganda faqat searchResults ni yangilaymiz, lekin currentPage ni o'zgartirmaymiz
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults(products);
    } else {
      handleSearch();
    }
  }, [products]);

  // Kategoriyalarni yuklash
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/category`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Kategoriyalar yuklanmadi:", err);
    }
  };

  // Pagination funksiyalari
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(searchResults.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Joriy sahifadagi mahsulotlarni olish
  const getCurrentProducts = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return searchResults.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Sahifalash ma'lumotlari
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Mahsulotlarni yuklash
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/product?limit=100000`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      let productsData = [];
      if (response.data && response.data.data) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }

      setProducts(productsData);
      setSearchResults(productsData);
      setError(null);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      console.error("Yuklash xatosi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Qidiruv funksiyasi
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(products);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const results = products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(term) || false;
      const categoryMatch = product.category?.toLowerCase().includes(term) || false;
      const descriptionMatch = product.description?.toLowerCase().includes(term) || false;
      const priceMatch = product.price?.toString().includes(term) || false;

      return nameMatch || categoryMatch || descriptionMatch || priceMatch;
    });

    setSearchResults(results);
  };

  // Qidiruvni tozalash
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults(products);
    setCurrentPage(1); // faqat "tozalash" bosilganda 1-sahifaga
  };

  // Input'ga bosilgan tugmalarni qayta ishlash
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Tahrirlashni boshlash
  const handleEditClick = (product) => {
    setEditingProduct(product);

    const editData = {
      name: product.name || '',
      sku: product.sku || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      company: product.company || '',
      description: product.description || '',
      deliveryDays: product.deliveryDays?.toString() || '',
      salePercentage: product.salePercentage?.toString() || '',
      quantity: product.quantity?.toString() || '1',
      code: product.code || '',
      vat_percent: product.vat_percent?.toString() || '0',
      package_code: product.package_code || '',
      imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : [])
    };

    setEditForm(editData);

    if (editData.imageUrl && editData.imageUrl.length > 0) {
      const previews = editData.imageUrl.map(img => {
        if (img.startsWith('http')) return img;
        return `${BASE_URL}/images/${img}`;
      });
      setPreviewImages(previews);
    } else {
      setPreviewImages([]);
    }

    setSelectedFiles([]);
    setEditModalOpen(true);
  };

  // Form o'zgarishi
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['price', 'salePercentage', 'vat_percent', 'quantity', 'deliveryDays'];

    setEditForm((prevData) => ({
      ...prevData,
      [name]: numericFields.includes(name) ?
        (value === '' ? '' : parseFloat(value) || 0) :
        value,
    }));
  };

  // Fayl tanlash
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      showNotification('Faqat rasm fayllar yuklanishi mumkin!', 'error');
      return;
    }

    if (validFiles.length > 10) {
      showNotification('Maksimal 10 ta rasm yuklashingiz mumkin!', 'error');
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  // Rasmni o'chirish
  const removeImage = (index) => {
    const existingImageCount = editForm.imageUrl ? editForm.imageUrl.length : 0;
    const isExistingImage = index < existingImageCount;

    if (isExistingImage) {
      const newImageUrls = [...editForm.imageUrl];
      newImageUrls.splice(index, 1);
      setEditForm(prev => ({ ...prev, imageUrl: newImageUrls }));
    } else {
      const fileIndex = index - existingImageCount;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewImages(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index] && !newPreviews[index].startsWith(BASE_URL)) {
        URL.revokeObjectURL(newPreviews[index]);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  // Rasmlarni serverga yuklash
  const uploadImagesToServer = async () => {
    if (selectedFiles.length === 0) {
      return editForm.imageUrl || [];
    }

    setUploadingImages(true);
    const uploadedFilenames = [];

    try {
      for (const file of selectedFiles) {
        const formDataImage = new FormData();
        formDataImage.append('image', file);

        const response = await axios.post(
          `${BASE_URL}/api/upload/image`,
          formDataImage,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${TOKEN}`
            },
          }
        );

        if (response.data && response.data.file && response.data.file.savedName) {
          uploadedFilenames.push(response.data.file.savedName);
        } else if (response.data && response.data.filename) {
          uploadedFilenames.push(response.data.filename);
        } else if (response.data && response.data.url) {
          uploadedFilenames.push(response.data.url.split('/').pop());
        } else {
          uploadedFilenames.push(`image_${Date.now()}.jpg`);
        }
      }
      return [...(editForm.imageUrl || []), ...uploadedFilenames];
    } catch (error) {
      console.error("Rasm yuklanmadi:", error);
      showNotification('Rasm yuklanmadi. Qayta urinib ko\'ring.', 'error');
      return null;
    } finally {
      setUploadingImages(false);
    }
  };

  // Formani tekshirish
  const validateForm = () => {
    const requiredFields = ['name', 'price', 'category', 'code', 'sku', 'package_code'];
    const missingFields = requiredFields.filter(field => {
      const value = editForm[field];
      return value === undefined || value === null || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
      showNotification(`Quyidagi maydonlarni to'ldiring: ${missingFields.join(', ')}`, 'error');
      return false;
    }

    if (!editForm.price || Number(editForm.price) <= 0) {
      showNotification("Narx 0 dan katta bo'lishi kerak", 'error');
      return false;
    }

    if (editForm.quantity && Number(editForm.quantity) < 0) {
      showNotification("Miqdor 0 dan kichik bo'lishi mumkin emas", 'error');
      return false;
    }

    if (editForm.salePercentage &&
      (Number(editForm.salePercentage) < 0 || Number(editForm.salePercentage) > 100)) {
      showNotification("Chegirma foizi 0 dan 100 gacha bo'lishi kerak", 'error');
      return false;
    }

    if (editForm.vat_percent && Number(editForm.vat_percent) < 0) {
      showNotification("QQS foizi 0 dan kichik bo'lishi mumkin emas", 'error');
      return false;
    }

    return true;
  };

  // Tahrirlashni saqlash
  const handleSaveEdit = async () => {
    if (!editingProduct?._id) {
      showNotification("Mahsulot ID topilmadi!", 'error');
      return;
    }

    if (!validateForm()) return;

    setSavingEdit(true);

    try {
      let uploadedImageUrls = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadImagesToServer();
        if (uploadedImageUrls === null) {
          setSavingEdit(false);
          return;
        }
      } else {
        uploadedImageUrls = editForm.imageUrl || [];
      }

      const dataToSend = {
        name: editForm.name.trim(),
        sku: editForm.sku.trim(),
        category: editForm.category.trim(),
        company: editForm.company.trim() || "",
        description: editForm.description.trim() || "",
        code: editForm.code.trim(),
        package_code: editForm.package_code.trim(),
        imageUrl: uploadedImageUrls,
        price: parseFloat(editForm.price) || 0,
        deliveryDays: parseInt(editForm.deliveryDays, 10) || 0,
        salePercentage: parseInt(editForm.salePercentage, 10) || 0,
        quantity: parseInt(editForm.quantity, 10) || 1,
        vat_percent: parseFloat(editForm.vat_percent) || 0,
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      const productId = editingProduct._id;
      const response = await axios.put(
        `${BASE_URL}/api/product/${productId}`,
        dataToSend,
        config
      );

      // Yangilangan ro'yxat
      const updatedProducts = products.map(p =>
        p._id === editingProduct._id ? { ...p, ...dataToSend, imageUrl: uploadedImageUrls } : p
      );

      setProducts(updatedProducts);
      setSearchResults(updatedProducts);
      // Eslatma: currentPage ni o'zgartirmaymiz → sahifa joyida qoladi

      showNotification("Mahsulot muvaffaqiyatli yangilandi!");

      setEditModalOpen(false);
      setEditingProduct(null);
      setSelectedFiles([]);
      setPreviewImages([]);

    } catch (err) {
      console.error("Tahrirlashda xatolik:", err);

      let errorMsg = "Tahrirlashda xatolik yuz berdi";

      if (err.response?.status === 401) {
        errorMsg = "Token noto'g'ri yoki muddati tugagan";
      } else if (err.response?.status === 404) {
        errorMsg = "API endpoint topilmadi";
      } else if (err.response?.status === 409) {
        errorMsg = "Bu kod yoki SKU bilan mahsulot allaqachon mavjud";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      showNotification(`Xatolik: ${errorMsg}`, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // O'chirishni tasdiqlash
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  // O'chirishni amalga oshirish
  const handleConfirmDelete = async () => {
    if (!productToDelete?._id) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/product/${productToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` }
        }
      );

      const updatedProducts = products.filter(p => p._id !== productToDelete._id);
      setProducts(updatedProducts);
      setSearchResults(updatedProducts);
      // currentPage ni o'zgartirmaymiz — agar oxirgi element o'chirilsa, keyingi sahifaga o'tkazish mumkin, lekin hozircha joyida qoladi

      showNotification("Mahsulot muvaffaqiyatli o'chirildi!");
    } catch (err) {
      console.error("O'chirish xatosi:", err);
      let errorMsg = "O'chirishda xatolik yuz berdi";

      if (err.response?.status === 404) {
        errorMsg = "Mahsulot topilmadi";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      showNotification(`Xatolik: ${errorMsg}`, 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  // Yangi mahsulot qo'shish sahifasiga o'tish
  const handleAddProduct = () => {
    navigate("/MahsulotQoshish");
  };

  // Modalni yopish
  const closeEditModal = () => {
    previewImages.forEach(img => {
      if (!img.startsWith(BASE_URL)) {
        URL.revokeObjectURL(img);
      }
    });

    setEditModalOpen(false);
    setEditingProduct(null);
    setSelectedFiles([]);
    setPreviewImages([]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#00BCE4] mb-4" />
        <p className="text-gray-600 font-medium">Mahsulotlar yuklanmoqda...</p>
        <p className="text-sm text-gray-400 mt-2">Iltimos kuting</p>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="">

          {/* Header qismi */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mahsulotlar Ombori</h1>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? `"${searchTerm}" uchun ${searchResults.length} ta natija`
                  : `Jami ${products.length} ta mahsulot`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* QIDIRUV INPUTI */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nomi, kategoriyasi bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent w-full md:w-96 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Tozalash"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <button
                onClick={handleAddProduct}
                className="flex items-center cursor-pointer gap-2 bg-[#00BCE4] hover:bg-[#00a6c9] text-white px-5 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              >
                <Plus size={20} /> Yangi qo'shish
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate("/Categories")}
                  className="flex items-center cursor-pointer gap-2 bg-[#00BCE4] hover:bg-[#00a6c9] text-white px-5 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  Kategoriyalar
                </button>
              )}
            </div>
          </div>

          {/* Xato xabari */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="ml-auto text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          )}

          {/* Qidiruv natijasi bo'sh bo'lsa */}
          {searchTerm && searchResults.length === 0 && (
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-2xl text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                "{searchTerm}" uchun natija topilmadi
              </h3>
              <p className="text-gray-500 mb-4">
                Boshqa so'z yoki kategoriya bilan qidirib ko'ring
              </p>
              <button
                onClick={clearSearch}
                className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Barcha mahsulotlarni ko'rish
              </button>
            </div>
          )}

          {/* Jadval */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 ">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Mahsulot</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">Kategoriya</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">Narxi</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[100px]">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentProducts().length > 0 ? (
                    getCurrentProducts().map((product) => (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.imageUrl?.[0] ? (
                                <img
                                  src={`${BASE_URL}/images/${product.imageUrl[0]}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/64?text=" + encodeURIComponent(product.name.substring(0, 10));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package size={24} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-800 truncate max-w-xs">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">ID: {product._id?.slice(-6)}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-md">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 truncate max-w-xs">
                            {product.category || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-base">
                            {product.price?.toLocaleString()} UZS
                          </div>
                          {product.salePercentage > 0 && (
                            <div className="text-xs text-red-500 line-through mt-1">
                              {Math.round((product.price * 100) / (100 - product.salePercentage)).toLocaleString()} UZS
                              <span className="ml-1 text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                -{product.salePercentage}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-2 cursor-pointer text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit3 size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 text-gray-500 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : !searchTerm && !loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Mahsulotlar topilmadi</h3>
                        <p className="text-gray-500 mb-4">Hozircha mahsulotlar mavjud emas</p>
                        <button
                          onClick={handleAddProduct}
                          className="px-6 py-2 cursor-pointer bg-[#00BCE4] text-white rounded-lg hover:bg-[#00a6c9] transition-colors"
                        >
                          Birinchi mahsulotni qo'shing
                        </button>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {searchResults.length > itemsPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200">
              <div className="text-sm text-gray-600">
                Jami: <span className="font-semibold">{searchResults.length}</span> ta mahsulot,
                Sahifa <span className="font-semibold">{currentPage}</span> dan <span className="font-semibold">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                        className={`w-10 h-10 rounded-lg cursor-pointer ${currentPage === pageNum
                          ? 'bg-[#00BCE4] text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tahrirlash Modali */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white z-10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Mahsulotni tahrirlash</h3>
                  <p className="text-gray-500 text-sm mt-1">{editingProduct.name}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                  disabled={savingEdit || uploadingImages}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {(savingEdit || uploadingImages) && (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p>
                    {uploadingImages
                      ? `Rasmlar yuklanmoqda... (${selectedFiles.length} ta)`
                      : "Saqlanmoqda..."}
                  </p>
                </div>
              )}

              {/* Rasmlar qismi */}
              <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Расмлар
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition">
                    Fayl tanlash
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </label>
                  <span className="text-gray-500 text-sm">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} ta fayl tanlandi` : 'Fayl tanlanmadi'}
                  </span>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Олдиндан кўриш:</p>
                    <div className="flex flex-wrap gap-4">
                      {previewImages.map((imgUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imgUrl}
                            alt={`Tanlangan rasm ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-md shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={savingEdit || uploadingImages}
                            className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form maydonlari */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Товар номи
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="Mahsulot nomini kiriting"
                  />
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                    Артикул
                  </label>
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    value={editForm.sku}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="Mahsulot artikuli"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Нарх
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    min="0"
                    step="0.01"
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    value={editForm.quantity}
                    onChange={handleEditChange}
                    min="0"
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Етказиб бериш кунлари
                  </label>
                  <input
                    type="number"
                    name="deliveryDays"
                    id="deliveryDays"
                    value={editForm.deliveryDays}
                    onChange={handleEditChange}
                    min="0"
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="salePercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Чегирма фоизи (%)
                  </label>
                  <input
                    type="number"
                    name="salePercentage"
                    id="salePercentage"
                    value={editForm.salePercentage}
                    onChange={handleEditChange}
                    min="0"
                    max="100"
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Категорияни танланг</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Компания/Бренд
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="Kompaniya nomi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Код
                  </label>
                  <select
                    id="code"
                    name="code"
                    value={editForm.code}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Кодни танланг</option>
                    {codeOptions.map((item, index) => (
                      <option key={index} value={item.code}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="vat_percent" className="block text-sm font-medium text-gray-700 mb-1">
                    НДС (%)
                  </label>
                  <input
                    type="number"
                    id="vat_percent"
                    name="vat_percent"
                    value={editForm.vat_percent}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="package_code" className="block text-sm font-medium text-gray-700 mb-1">
                    Код упаковки
                  </label>
                  <input
                    type="text"
                    id="package_code"
                    name="package_code"
                    value={editForm.package_code}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="Qadoqlash kodi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Тавсиф
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={editForm.description}
                    onChange={handleEditChange}
                    disabled={savingEdit || uploadingImages}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00BCE4] focus:border-transparent disabled:opacity-50"
                    placeholder="Mahsulot tavsifi..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3 border-t">
              <button
                onClick={closeEditModal}
                disabled={savingEdit || uploadingImages}
                className="px-6 py-3 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || uploadingImages}
                className="px-6 py-3 bg-[#00BCE4] cursor-pointer text-white font-semibold rounded-lg hover:bg-[#00a6c9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(savingEdit || uploadingImages) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadingImages ? "Rasmlar yuklanmoqda..." : "Saqlanmoqda..."}
                  </>
                ) : (
                  'Saqlash'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* O'chirish Tasdiqlash Modali */}
      {deleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Mahsulotni o'chirish</h3>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{productToDelete.name}</p>
                  <p className="text-sm text-gray-500">ID: {productToDelete._id?.slice(-6)}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-2">
                Ushbu mahsulotni rostdan ham o'chirmoqchimisiz?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlar butunlay o'chiriladi.
              </p>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-6 py-3 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 cursor-pointer bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={20} />
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bildirishnoma */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-green-50 border-green-200' : notification.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Eye className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <p className={`font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AddMahsulot;
