import React, { useState, useEffect } from 'react';
import { Search, Package, Loader2, X, ChevronLeft, ChevronRight, Check, CreditCard } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';
import axios from 'axios';
import { useData } from '../../../context/DataProvider';

const PRIMARY_COLOR = "#00BCE4";
const BASE_URL = "https://app.dentago.uz";
const ITEMS_PER_PAGE = 10;

function Aperator() {
  const { user } = useData();
  const isAdmin = user?.role === 'admin' || user?.role === 'operator' || user?.isAdmin === true;

  const [activeTab, setActiveTab] = useState('products');
  const [allFlatOrders, setAllFlatOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [technicianOrders, setTechnicianOrders] = useState([]);
  const [filteredTechOrders, setFilteredTechOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingPayment: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [techActionLoading, setTechActionLoading] = useState({});

  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
    description: ''
  });

  const [confirmCompleteModal, setConfirmCompleteModal] = useState({
    open: false,
    requestId: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('payme');

  // ───────────────────────────────────────────────
  //                FETCH FUNCTIONS
  // ───────────────────────────────────────────────

  const fetchProductOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi!");

      const historyUrl = isAdmin
        ? `${BASE_URL}/api/order/history?all=true&page=1&limit=500`
        : `${BASE_URL}/api/order/history?page=1&limit=500`;

      const historyRes = await axios.get(historyUrl, { headers: { Authorization: `Bearer ${token}` } });

      let ordersData = historyRes.data?.success && Array.isArray(historyRes.data.data)
        ? historyRes.data.data
        : [];

      let stats = { totalOrders: 0, totalAmount: 0, pendingPayment: 0, paid: 0, processing: 0, shipped: 0, delivered: 0 };
      try {
        const statsUrl = isAdmin ? `${BASE_URL}/api/order/stats?all=true` : `${BASE_URL}/api/order/stats`;
        const statsRes = await axios.get(statsUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (statsRes.data?.success) stats = statsRes.data.data;
      } catch (e) {
        console.warn("Stats xatosi:", e);
      }

      setOrderStats(stats);

      const flatOrders = ordersData.flatMap(order => {
        const orderNumber = order.orderNumber || order._id?.slice(-8)?.toUpperCase() || "—";
        const createdAt = order.createdAt
          ? new Date(order.createdAt).toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
          : '—';

        let displayStatus = order.paymentStatus === "paid"
          ? (order.deliveryStatus === "delivered" ? "yetkazib berildi" : "to'langan")
          : order.paymentStatus === "cancelled" ? "bekor qilingan" : "kutilmoqda";

        let userName = "Noma'lum foydalanuvchi";
        let userPhone = "—";
        if (order.user_id && typeof order.user_id === 'object') {
          userName = order.user_id.username || "Noma'lum foydalanuvchi";
          userPhone = order.user_id.phone || '—';
        }

        return (order.items || []).map((item, index) => ({
          id: order._id,
          itemIndex: index,
          orderNumber,
          createdAt,
          mahsulotNomi: item.productSnapshot?.name || "Noma'lum mahsulot",
          soni: item.quantity || 1,
          totalNarx: (item.productSnapshot?.price || 0) * (item.quantity || 1),
          tadbirkor: item.productSnapshot?.company || "Dentago",
          status: displayStatus,
          paymentStatus: order.paymentStatus || "pending",
          userInfo: { name: userName, phone: userPhone }
        }));
      });

      setAllFlatOrders(flatOrders);
      setFilteredOrders(flatOrders);
    } catch (err) {
      console.error("Mahsulot buyurtmalari xatosi:", err);
    }
  };

  const fetchTechnicianOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/api/admin/technicians/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const techOrders = res.data.data.map(req => ({
          id: req._id,
          requestId: req._id,
          technicianName: req.client?.fullName || req.client?.name || req.client?.phone || 'Noma\'lum texnik',
          technicianPhone: req.client?.phone ? `(${req.client.phone})` : '',
          productName: req.productId?.name || 'Noma\'lum mahsulot',
          productCompany: req.productId?.company || 'Dentago',
          quantity: req.quantity || 1,
          totalPrice: Number(req.totalPrice || 0),
          status: req.status || 'pending',
          createdAt: req.createdAt
            ? new Date(req.createdAt).toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '—'
        }));

        setTechnicianOrders(techOrders);
        setFilteredTechOrders(techOrders);
      }
    } catch (err) {
      console.error("Texnik buyurtmalari xatosi:", err);
    }
  };

  const fetchPaymentTransactions = async (method = paymentMethodFilter) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const url = `${BASE_URL}/api/payment/transactions?page=1&limit=500`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && Array.isArray(res.data.data || res.data.transactions)) {
        const txs = (res.data.data || res.data.transactions).map(t => ({
          id: t._id,
          transactionId: t.transaction || t._id?.slice(-10)?.toUpperCase() || '—',
          totalAmount: t.order_id?.totalAmount || t.amount || null,
          orderNumber: t.order_id?.orderNumber || t.orderNumber || "—",
          userName: t.user?.username || t.user?.phone || "—",
          userPhone: t.user?.phone || "—",
          paymentMethod: (t.payment_method || method || 'unknown').toUpperCase(),
          createdAt: t.created_at
            ? new Date(t.created_at).toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            : '—',
          status: t.status || "PAID"
        }));

        setTransactions(txs);
        setFilteredTransactions(txs);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (err) {
      console.error("To'lov tranzaksiyalari xatosi:", err);
      setTransactions([]);
      setFilteredTransactions([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProductOrders(),
        fetchTechnicianOrders(),
        fetchPaymentTransactions()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Mahsulot buyurtmalari filtri
  useEffect(() => {
    if (activeTab !== 'products') return;
    let filtered = [...allFlatOrders];
    const term = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.mahsulotNomi.toLowerCase().includes(term) ||
        o.tadbirkor.toLowerCase().includes(term) ||
        o.userInfo?.name?.toLowerCase().includes(term) ||
        o.userInfo?.phone?.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => {
        if (statusFilter === 'pending') return o.paymentStatus === 'pending';
        if (statusFilter === 'paid') return o.paymentStatus === 'paid';
        if (statusFilter === 'delivered') return o.status === 'yetkazib berildi';
        if (statusFilter === 'cancelled') return o.paymentStatus === 'cancelled';
        return true;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, allFlatOrders, activeTab]);

  // Texnik buyurtmalari filtri
  useEffect(() => {
    if (activeTab !== 'technicians') return;
    let filtered = [...technicianOrders];
    const term = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.technicianName.toLowerCase().includes(term) ||
        o.productName.toLowerCase().includes(term) ||
        o.productCompany.toLowerCase().includes(term) ||
        o.technicianPhone.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredTechOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, technicianOrders, activeTab]);

  // To'lovlar filtri
  useEffect(() => {
    if (activeTab !== 'payments') return;
    let filtered = [...transactions];
    const term = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(t =>
        (t.transactionId || '').toLowerCase().includes(term) ||
        (t.orderNumber || '').toLowerCase().includes(term) ||
        (t.userName || '').toLowerCase().includes(term) ||
        (t.userPhone || '').includes(term) ||
        String(t.totalAmount || '').includes(term)
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [searchTerm, transactions, activeTab]);

  // payment method o'zgarganda yangidan yuklash
  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentTransactions(paymentMethodFilter);
    }
  }, [paymentMethodFilter, activeTab]);

  // ───────────────────────────────────────────────
  //              ACTION HANDLERS
  // ───────────────────────────────────────────────

  const handleConfirmPayment = async (orderId) => {
    if (!orderId) return;
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${BASE_URL}/api/order/payment/${orderId}`,
        { paymentStatus: "paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllFlatOrders(prev =>
        prev.map(item =>
          item.id === orderId ? { ...item, paymentStatus: "paid", status: "to'langan" } : item
        )
      );
      console.log("To'lov tasdiqlandi!");
    } catch (err) {
      console.error("To'lov tasdiqlash xatosi:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const openRejectModal = (requestId) => {
    setRejectModal({ open: true, requestId, description: '' });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, requestId: null, description: '' });
  };

  const submitReject = async () => {
    const { requestId, description } = rejectModal;
    if (!description.trim()) {
      console.log("Sababni kiriting!");
      return;
    }
    setTechActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi");

      await axios.post(
        `${BASE_URL}/api/admin/technicians/requests/${requestId}/work`,
        { description },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const statusRes = await axios.put(
        `${BASE_URL}/api/admin/technicians/requests/${requestId}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statusRes.data?.success) {
        setTechnicianOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status: 'rejected' } : o)
        );
        setFilteredTechOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status: 'rejected' } : o)
        );
        closeRejectModal();
      }
    } catch (err) {
      console.error("Bekor qilish xatosi:", err);
    } finally {
      setTechActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const openConfirmCompleteModal = (requestId) => {
    setConfirmCompleteModal({ open: true, requestId });
  };

  const closeConfirmCompleteModal = () => {
    setConfirmCompleteModal({ open: false, requestId: null });
  };

  const submitConfirmComplete = async () => {
    const { requestId } = confirmCompleteModal;
    setTechActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi");

      const response = await axios.put(
        `${BASE_URL}/api/admin/technicians/requests/${requestId}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setTechnicianOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status: 'completed' } : o)
        );
        setFilteredTechOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status: 'completed' } : o)
        );
        closeConfirmCompleteModal();
      }
    } catch (err) {
      console.error("Bajarildi xatosi:", err);
    } finally {
      setTechActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const updateTechnicianOrderStatus = async (requestId, status) => {
    if (status === 'rejected') {
      openRejectModal(requestId);
      return;
    }
    if (status === 'completed') {
      openConfirmCompleteModal(requestId);
      return;
    }

    setTechActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Token topilmadi");

      const response = await axios.put(
        `${BASE_URL}/api/admin/technicians/requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setTechnicianOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status } : o)
        );
        setFilteredTechOrders(prev =>
          prev.map(o => o.requestId === requestId ? { ...o, status } : o)
        );
      }
    } catch (err) {
      console.error("Status yangilash xatosi:", err);
    } finally {
      setTechActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const lower = (status || '').toUpperCase();
    let color = 'bg-gray-100 text-gray-700';
    let text = status || '—';

    if (lower === 'PAID') {
      color = 'bg-green-100 text-green-800';
      text = 'To\'langan';
    } else if (lower === 'CANCELED') {
      color = 'bg-rose-100 text-rose-800';
      text = 'To\'lov bekor qilindi';
    }

    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
  };

  const getTechStatusBadge = (status) => {
    const lower = (status || '').toLowerCase();
    let color = 'bg-gray-100 text-gray-700';
    let text = status || '—';
    let icons = null;

    if (lower === 'pending') {
      color = 'bg-amber-100 text-amber-800';
      text = 'Kutilmoqda';
      icons = <Package className="w-3 h-3 mr-1" />;
    } else if (lower === 'accepted') {
      color = 'bg-blue-100 text-blue-800';
      text = 'Qabul qilindi';
      icons = <Check className="w-3 h-3 mr-1" />;
    } else if (lower === 'completed') {
      color = 'bg-emerald-100 text-emerald-800';
      text = 'Bajarildi';
      icons = (
        <div className="flex items-center">
          <Check className="w-3.5 h-3.5 mr-0.5" />
          <Check className="w-3.5 h-3.5" />
        </div>
      );
    } else if (lower === 'rejected') {
      color = 'bg-rose-100 text-rose-800';
      text = 'Bekor qilindi';
      icons = (
        <div className="flex items-center">
          <X className="w-3.5 h-3.5 mr-0.5" />
          <X className="w-3.5 h-3.5" />
        </div>
      );
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {icons}
        {text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Ma'lumotlar yuklanmoqda..." />;
  }

  const currentData =
    activeTab === 'technicians' ? filteredTechOrders :
    activeTab === 'payments'    ? filteredTransactions :
    filteredOrders;

  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white font-sans p-6 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#00BCE4]/10 text-[#00BCE4]">
            <Package size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Buyurtmalar <span style={{ color: PRIMARY_COLOR }}>Tarixi</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
           
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border cursor-pointer border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/50 bg-white min-w-[180px]"
            >
              <option value="all">Barcha statuslar</option>
              {activeTab === 'technicians' ? (
                <>
                  <option value="pending">Kutilmoqda</option>
                  <option value="accepted">Qabul qilindi</option>
                  <option value="completed">Bajarildi</option>
                  <option value="rejected">Bekor qilindi</option>
                </>
              ) : (
                <>
                  <option value="pending">Kutilmoqda</option>
                  <option value="paid">To'langan</option>
                  <option value="delivered">Yetkazib berilgan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </>
              )}
            </select>
          
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center cursor-pointer gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'products' ? 'bg-[#00BCE4] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package size={18} />
          Mahsulot buyurtmalari
        </button>

        {["admin", "technician"].includes(user?.role) && (
          <button
            onClick={() => setActiveTab('technicians')}
            className={`flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'technicians' ? 'bg-[#00BCE4] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Texnik buyurtmalari
          </button>
        )}

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'payments' ? 'bg-[#00BCE4] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard size={18} />
          To'lovlar tarixi
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">Jami buyurtmalar</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{orderStats.totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-amber-700">To'lov kutilmoqda</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">{orderStats.pendingPayment.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-green-500">To'langan</p>
            <p className="text-3xl font-bold text-green-500 mt-1">{orderStats.paid.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-emerald-700">Yetkazib berilgan</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{orderStats.delivered.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="unified-table-container">
        <div className="overflow-x-auto">
          <table className="unified-table">
            <thead>
              <tr>
                {activeTab === 'products' ? (
                  <>
                    <th>ID / Mahsulot</th>
                    {isAdmin && <th>Mijoz</th>}
                    <th>Kompaniya</th>
                    <th className="text-center">Soni</th>
                    <th className="text-center">Narx</th>
                    <th className="text-center">Sana</th>
                    <th className="text-center">Status</th>
                    {/* {isAdmin && <th className="text-center">To'lov</th>} */}
                  </>
                ) : activeTab === 'technicians' ? (
                  <>
                    <th>Texnik</th>
                    <th>Kompaniya</th>
                    <th className="text-center">Soni</th>
                    <th className="text-center">Narx</th>
                    <th className="text-center">Sana</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Harakat</th>
                  </>
                ) : (
                  <>
                    <th>Tranzaksiya ID</th>
                    <th>Buyurtma #</th>
                    <th>Summa</th>
                    <th>Usul</th>
                    <th>Sana</th>
                    <th>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                const key = activeTab === 'products' ? `${item.id}-${item.itemIndex || index}` : item.id || item.requestId || index;

                if (activeTab === 'products') {
                  const canConfirm = item.paymentStatus === "pending" || item.paymentStatus === "waiting";
                  const isLoading = actionLoading[item.id];
                  return (
                    <tr key={key} className="hover:bg-[#00BCE4]/[0.03]">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-[#00BCE4]">#{item.orderNumber}</span>
                          <span className="text-sm font-bold text-slate-800">{item.mahsulotNomi}</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{item.userInfo?.name || '—'}</span>
                            <span className="text-xs text-slate-500">{item.userInfo?.phone || '—'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.tadbirkor}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">
                          {item.soni}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-800">
                        {(item.totalNarx || 0).toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {item.createdAt}
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(item.status)}</td>
                      
                    </tr>
                  );
                }

                if (activeTab === 'technicians') {
                  const isTechLoading = techActionLoading[item.requestId];
                  return (
                    <tr key={key} className="hover:bg-[#00BCE4]/[0.03]">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{item.technicianName}</span>
                          {item.technicianPhone && <span className="text-xs text-slate-500">{item.technicianPhone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.productCompany}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-sm font-black text-slate-800">
                        {(item.totalPrice || 0).toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-5 text-center text-sm font-bold text-slate-700">
                        {item.createdAt}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {getTechStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateTechnicianOrderStatus(item.requestId, 'accepted')}
                                disabled={isTechLoading}
                                className={`cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center ${isTechLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}
                              >
                                {isTechLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                              </button>
                              <button
                                onClick={() => updateTechnicianOrderStatus(item.requestId, 'rejected')}
                                disabled={isTechLoading}
                                className={`cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center ${isTechLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                              >
                                {isTechLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X size={20} />}
                              </button>
                            </>
                          )}
                          {item.status === 'accepted' && (
                            <>
                              <button
                                onClick={() => updateTechnicianOrderStatus(item.requestId, 'completed')}
                                disabled={isTechLoading}
                                className={`cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center ${isTechLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}
                              >
                                {isTechLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                              </button>
                              <button
                                onClick={() => updateTechnicianOrderStatus(item.requestId, 'rejected')}
                                disabled={isTechLoading}
                                className={`cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center ${isTechLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                              >
                                {isTechLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X size={20} />}
                              </button>
                            </>
                          )}
                          {(item.status === 'completed' || item.status === 'rejected') && (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center cursor-default">
                              <X size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }

                // To'lovlar qatori
                return (
                  <tr key={key} className="hover:bg-[#00BCE4]/[0.03]">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#00BCE4]">{item.transactionId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">#{item.orderNumber}</td>
                    <td className="px-6 py-5 text-sm font-black text-slate-800">
                      {item.totalAmount != null ? item.totalAmount.toLocaleString() + " so'm" : '—'}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-700">
                      {item.createdAt}
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td
                    colSpan={
                      activeTab === 'products' ? (isAdmin ? 8 : 6) :
                      activeTab === 'technicians' ? 7 :
                      6
                    }
                    className="py-20 text-center text-slate-500"
                  >
                    <div className="table-empty">
                      <div className="empty-icon">📋</div>
                      <h3 className="empty-title">
                        {activeTab === 'technicians'
                          ? 'Texnik buyurtmalari topilmadi'
                          : activeTab === 'payments'
                          ? 'To‘lov tranzaksiyalari topilmadi'
                          : 'Mahsulot buyurtmalari topilmadi'}
                      </h3>
                      <p className="empty-description">Hozircha ma'lumotlar mavjud emas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 mt-4">
          <div className="text-sm text-slate-600">
            Jami: {totalItems} ta • Sahifa {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 cursor-pointer rounded-full ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 1) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`cursor-pointer w-9 h-9 rounded-md border text-sm font-medium ${
                    currentPage === pageNum ? 'bg-[#00BCE4] text-white border-[#00BCE4]' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-md border ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Bekor qilish modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Bekor qilish sababini kiriting</h3>
            <p className="text-slate-600 mb-6">
              Buyurtmani <strong>"Bekor qilindi"</strong> holatiga o‘tkazmoqchimisiz? Sababni kiriting.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Sabab</label>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                rows={4}
                placeholder="Masalan: Material yetishmadi, vaqt yetmadi..."
                value={rejectModal.description}
                onChange={(e) => setRejectModal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeRejectModal}
                className="px-6 py-2.5 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
              >
                Yo‘q
              </button>
              <button
                onClick={submitReject}
                disabled={techActionLoading[rejectModal.requestId]}
                className={`px-6 py-2.5 text-white rounded-lg transition flex items-center gap-2 min-w-[140px] justify-center bg-rose-600 hover:bg-rose-700 ${
                  techActionLoading[rejectModal.requestId] ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {techActionLoading[rejectModal.requestId] ? <Loader2 className="w-5 h-5 animate-spin" /> : <X size={20} />}
                Bekor qil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bajarildi tasdiqlash modal */}
      {confirmCompleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Buyurtmani bajarishni tasdiqlang</h3>
            <p className="text-slate-600 mb-6">
              Rostdan ham buyurtmani bajarib bo'ldingizmi? Buyurtmani <strong>"Bajarildi"</strong> holatiga o‘tkazmoqchimisiz?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeConfirmCompleteModal}
                className="px-6 py-2.5 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
              >
                Yo‘q
              </button>
              <button
                onClick={submitConfirmComplete}
                disabled={techActionLoading[confirmCompleteModal.requestId]}
                className={`px-6 py-2.5 text-white rounded-lg transition flex items-center gap-2 min-w-[140px] justify-center bg-emerald-600 hover:bg-emerald-700 ${
                  techActionLoading[confirmCompleteModal.requestId] ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {techActionLoading[confirmCompleteModal.requestId] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                Ha, bajarildi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aperator;