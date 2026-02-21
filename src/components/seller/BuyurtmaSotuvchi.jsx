import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BuyurtmaSotuvchi() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [flatItems, setFlatItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const token = localStorage.getItem('accessToken');

  if (!token) {
    return (
      <div className="text-center py-20 px-5 text-red-600 text-2xl">
        <h2 className="text-3xl font-bold">Tizimga kirish kerak</h2>
        <p>Token topilmadi. Iltimos, login qiling.</p>
      </div>
    );
  }

  const api = axios.create({
    baseURL: 'https://app.dentago.uz/api',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const getDeliveryStatusUz = (status) => {
    if (!status) return '—';
    const map = {
      processing: 'Qayta ishlanmoqda',
      shipped: 'Yetkazib berilmoqda',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilindi',
    };
    return map[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentStatusUz = (status) => {
    if (!status) return '—';
    const map = {
      pending: 'To‘lov kutilmoqda',
      paid: 'To‘landi',
      failed: 'Muvaffaqiyatsiz',
      refunded: 'Qaytarildi',
      cancelled: 'Bekor qilindi',
    };
    return map[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsRes = await api.get('/order/seller/orders/stats');
        setStats(statsRes.data?.data || {});

        const ordersRes = await api.get('/order/seller/orders');
        const fetchedOrders = ordersRes.data?.data || [];
        setOrders(fetchedOrders);

        const itemsMap = new Map();

        fetchedOrders.forEach((order) => {
          order.items?.forEach((item) => {
            const productName = item.productSnapshot?.name || 'Nomaʼlum mahsulot';
            const key = `${productName}-${order._id}`;
            const quantity = item.quantity || 1;
            const price = item.productSnapshot?.price || 0;
            const itemSum = price * quantity;

            if (itemsMap.has(key)) {
              const ex = itemsMap.get(key);
              ex.quantity += quantity;
              ex.itemSum += itemSum;
            } else {
              itemsMap.set(key, {
                mijoz: order.user_id?.username || '—',
                productName,
                itemSum,
                quantity,
                orderId: order._id,
                phone: order.user_id?.phone || '—',
              });
            }
          });
        });

        setFlatItems(Array.from(itemsMap.values()));
        setLoading(false);
      } catch (err) {
        console.error('API xatosi:', err.response || err);
        let msg = 'Maʼlumot yuklanmadi';
        if (err.response?.status === 401) msg = 'Token eskirgan yoki notoʻgʻri';
        setError(msg);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/order/seller/orders/${orderId}`);
      setSelectedOrder(res.data?.data || res.data);
      setUpdateMessage(null);
    } catch (err) {
      console.error(err);
      setSelectedOrder({ error: 'Buyurtma maʼlumotlari yuklanmadi' });
    }
  };

  const updateOrderStatus = async (orderId, body) => {
    try {
      setUpdateLoading(true);
      setUpdateMessage(null);
      await api.put(`/order/seller/orders/${orderId}/status`, body);
      setUpdateMessage({ type: 'success', text: 'Status muvaffaqiyatli yangilandi!' });

      await fetchOrderDetails(orderId);
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/order/seller/orders'),
        api.get('/order/seller/orders/stats'),
      ]);
      setOrders(ordersRes.data?.data || []);
      setStats(statsRes.data?.data || {});
    } catch (err) {
      console.error('Status update xatosi:', err);
      setUpdateMessage({
        type: 'error',
        text: 'Status yangilanmadi: ' + (err.response?.data?.message || 'Xato'),
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRowClick = (item) => {
    if (item.orderId) fetchOrderDetails(item.orderId);
  };

  const closeModal = () => setSelectedOrder(null);

  if (loading) return <div className="text-center py-24 text-cyan-500 text-xl">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-16 text-xl">{error}</div>;

  return (
    <div className="min-h-screen py-5">
      <h1 className="text-4xl font-bold text-cyan-500 mb-4">Buyurtma Sotuvchi</h1>
        <p>jami buyurtmalar: {stats?.totalOrders || 0}</p>
      {stats && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10 py-6 rounded-2xl">
    {[
      {
        title: 'Umumiy summa',
        value: `${(stats.totalAmount || 0).toLocaleString('uz-UZ')}`,
        color: '#00BCE4',           // asosiy matn rangi
        bgColor: 'rgba(0, 188, 228, 0.08)', // yengil fon
        shadowColor: 'shadow-[0_4px_15px_rgba(0,188,228,0.25)]'
      },
      {
        title: "To'lov kutilmoqda",
        value: stats.pendingPayment || 0,
        color: '#f59e0b',           // yellow/orange-yellow
        bgColor: 'rgba(245, 158, 11, 0.08)',
        shadowColor: 'shadow-[0_4px_15px_rgba(245,158,11,0.25)]'
      },
      {
        title: "To'langan",
        value: stats.paid || 0,
        color: '#15803d',           // dark green (emerald-700 ga yaqin)
        bgColor: 'rgba(21, 128, 61, 0.08)',
        shadowColor: 'shadow-[0_4px_15px_rgba(21,128,61,0.25)]'
      },
      {
        title: 'Yetkazib berilgan',
        value: stats.delivered || 0,
        color: '#1e40af',           // dodger blue ga yaqin (ko'k-yashil)
        bgColor: 'rgba(30, 64, 175, 0.08)',
        shadowColor: 'shadow-[0_4px_15px_rgba(30,64,175,0.25)]'
      },
      {
        title: 'Bekor qilingan',
        value: stats.cancelled || 0,
        color: '#dc2626',           // red-600
        bgColor: 'rgba(220, 38, 38, 0.08)',
        shadowColor: 'shadow-[0_4px_15px_rgba(220,38,38,0.25)]'
      },
    ].map((stat, i) => (
      <div
        key={i}
        className={`text-center rounded-2xl p-4 shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.01] ${stat.shadowColor}`}
        style={{ backgroundColor: stat.bgColor }}
      >
        <h3
          className="text-sm font-medium mb-2 opacity-90"
          style={{ color: stat.color }}
        >
          {stat.title}
        </h3>
        <p
          className="text-4xl font-bold"
          style={{ color: stat.color }}
        >
          {stat.value}
        </p>
      </div>
    ))}
  </div>
)}


      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <th className="p-4 text-left rounded-tl-xl">Mijoz Ism-Familiyasi</th>
              <th className="p-4 text-left">Mahsulot Nomi</th>
              <th className="p-4 text-right">Summa</th>
              <th className="p-4 text-center rounded-tr-xl">Soni</th>
            </tr>
          </thead>
          <tbody>
            {flatItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-500">Maʼlumot yoʻq</td>
              </tr>
            ) : (
              flatItems.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer transition-all duration-200 hover:bg-cyan-50"
                >
                  <td className="p-4 border-b border-gray-100">{item.mijoz}</td>
                  <td className="p-4 border-b border-gray-100">{item.productName}</td>
                  <td className="p-4 border-b border-gray-100 text-right font-bold">
                    {item.itemSum.toLocaleString('uz-UZ')} so'm
                  </td>
                  <td className="p-4 border-b border-gray-100 text-center">{item.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && !selectedOrder.error && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br  from-white to-cyan-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-10 relative shadow-2xl border-2 border-cyan-500 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 cursor-pointer right-5 text-4xl text-cyan-500 hover:scale-120 transition-all"
              // className="absolute cursor-pointer top-5 right-7 text-4xl text-cyan-500 hover:scale-125 transition-transform"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-cyan-600 mb-6 text-center drop-shadow-sm">
              Buyurtma {selectedOrder.orderNumber || selectedOrder._id}
            </h2>

            <div className="space-y-4 text-gray-800 text-lg">
              <p><strong className="text-cyan-600">Mijoz:</strong> {selectedOrder.user_id?.username || '—'} ({selectedOrder.user_id?.phone || '—'})</p>
              <p><strong className="text-cyan-600">Summa:</strong> {selectedOrder.totalAmount?.toLocaleString('uz-UZ')} so'm</p>
              <p><strong className="text-cyan-600">To'lov usuli:</strong> {selectedOrder.paymentMethod || '—'}</p>
              <p><strong className="text-cyan-600">To'lov statusi:</strong> {getPaymentStatusUz(selectedOrder.paymentStatus)}</p>
              <p><strong className="text-cyan-600">Yetkazib berish statusi:</strong> {getDeliveryStatusUz(selectedOrder.deliveryStatus)}</p>
              <p><strong className="text-cyan-600">Manzil:</strong> {selectedOrder.shippingAddress || '—'}</p>
              <p><strong className="text-cyan-600">Izoh:</strong> {selectedOrder.notes || 'Yoʻq'}</p>

              <hr className="my-8 border-cyan-100 border-2" />

              {/* Buyurtma statusini o‘zgartirish */}
<h3 className="text-2xl font-semibold text-cyan-600 mb-5">Buyurtma statusini o‘zgartirish</h3>

{updateMessage && (
  <p className={`p-3 rounded-lg text-center font-medium ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {updateMessage.text}
  </p>
)}


{!['delivered', 'cancelled'].includes(selectedOrder.deliveryStatus) ? (
  <div className="flex flex-wrap gap-4 mb-6">
    <button
      onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'processing' })}
      disabled={updateLoading}
      className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
    >
      Qayta ishlanmoqda
    </button>

    <button
      onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'shipped' })}
      disabled={updateLoading}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
    >
      Yetkazib berilmoqda
    </button>

    <button
      onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'delivered' })}
      disabled={updateLoading}
      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
    >
      Yetkazib berildi
    </button>

    <button
      onClick={() => {
        if (window.confirm("Buyurtmani rostdan ham bekor qilmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.")) {
          updateOrderStatus(selectedOrder._id, { deliveryStatus: 'cancelled' });
        }
      }}
      disabled={updateLoading}
      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
    >
      Bekor qilindi
    </button>
  </div>
) : (
  <div className="bg-gray-100 p-5 rounded-xl text-center text-gray-700">
    <p className="font-medium text-lg">
      Bu buyurtma allaqachon <strong className="text-cyan-700">
        {selectedOrder.deliveryStatus === 'delivered' ? 'yetkazib berilgan' : 'bekor qilingan'}
      </strong>.
    </p>
    <p className="mt-2 text-sm">Statusni endi o'zgartirib bo'lmaydi.</p>
  </div>
)}
              {/* <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'processing' })}
                  disabled={updateLoading || ['delivered', 'cancelled'].includes(selectedOrder.deliveryStatus)}
                  className="px-6 py-3 cursor-pointer Yetkazib berilmoqda bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
                >
                  Qayta ishlanmoqda
                </button>

                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'shipped' })}
                  disabled={updateLoading || ['delivered', 'cancelled'].includes(selectedOrder.deliveryStatus)}
                  className="px-6 py-3 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
                >
                  Yetkazib berilmoqda
                </button>

                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, { deliveryStatus: 'delivered' })}
                  disabled={updateLoading || selectedOrder.deliveryStatus === 'delivered' || selectedOrder.deliveryStatus === 'cancelled'}
                  className="px-6 py-3 cursor-pointer bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
                >
                  Yetkazib berildi
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Buyurtmani rostdan ham bekor qilmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.")) {
                      updateOrderStatus(selectedOrder._id, { deliveryStatus: 'cancelled' });
                    }
                  }}
                  disabled={updateLoading || selectedOrder.deliveryStatus === 'cancelled'}
                  className="px-6 py-3 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[160px]"
                >
                  Bekor qilindi
                </button>
              </div>

              {['delivered', 'cancelled'].includes(selectedOrder.deliveryStatus) && (
                <p className="text-center text-red-600 font-medium mt-2">
                  Bu buyurtma allaqachon {selectedOrder.deliveryStatus === 'delivered' ? 'yetkazib berilgan' : 'bekor qilingan'}.
                  Statusni o'zgartirib bo'lmaydi.
                </p>
              )} */}


{/* {['delivered', 'cancelled'].includes(selectedOrder.deliveryStatus) && updateMessage?.type !== 'success' && (
  <p className="text-center text-red-600 font-medium mt-4">
    Status faqat "Yetkazib berildi" yoki "Bekor qilindi" holatidan oldin o'zgartiriladi.
  </p>
)} */}
              <hr className="my-8 border-cyan-100 border-2" />

              <h3 className="text-2xl font-semibold text-cyan-600 mb-5">Mahsulotlar</h3>

              {selectedOrder.items?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cyan-50 text-cyan-700">
                        <th className="p-4 text-left border-b-2 border-cyan-200">Nomi</th>
                        <th className="p-4 text-right border-b-2 border-cyan-200">Narx</th>
                        <th className="p-4 text-center border-b-2 border-cyan-200">Soni</th>
                        <th className="p-4 text-right border-b-2 border-cyan-200">Jami</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-cyan-50 hover:bg-cyan-50/50">
                          <td className="p-4">{item.productSnapshot?.name || '—'}</td>
                          <td className="p-4 text-right">{(item.productSnapshot?.price || 0).toLocaleString('uz-UZ')} so'm</td>
                          <td className="p-4 text-center">{item.quantity || 1}</td>
                          <td className="p-4 text-right font-bold">
                            {((item.productSnapshot?.price || 0) * (item.quantity || 1)).toLocaleString('uz-UZ')} so'm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">Mahsulotlar ro'yxati yo'q</p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedOrder?.error && (
        <div className="text-red-600 text-center py-10 text-xl">{selectedOrder.error}</div>
      )}
    </div>
  );
}

export default BuyurtmaSotuvchi;
