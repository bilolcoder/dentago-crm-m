import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BuyurtmaSotuvchi() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [flatItems, setFlatItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#d32f2f', fontSize: '1.4rem' }}>
        <h2>Tizimga kirish kerak</h2>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Statistika
        const statsRes = await api.get('/order/seller/orders/stats');
        setStats(statsRes.data?.data || {});

        // Buyurtmalar
        const ordersRes = await api.get('/order/seller/orders');
        const fetchedOrders = ordersRes.data?.data || [];
        setOrders(fetchedOrders);

        // Flat items (har bir mahsulot uchun alohida qator)
        const itemsMap = new Map();

        fetchedOrders.forEach((order) => {
          order.items?.forEach((item) => {
            const productName = item.productSnapshot?.name || 'Nomaʼlum mahsulot';
            const key = `${productName}-${order._id}`; // bir xil nom bo'lsa ham buyurtma bo'yicha farqlash
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
    } catch (err) {
      console.error(err);
      setSelectedOrder({ error: 'Buyurtma maʼlumotlari yuklanmadi' });
    }
  };

  const handleRowClick = (item) => {
    if (item.orderId) fetchOrderDetails(item.orderId);
  };

  const closeModal = () => setSelectedOrder(null);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#00BCE4' }}>Yuklanmoqda...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '60px' }}>{error}</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f8fcff', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: '#00BCE4', textAlign: 'center', marginBottom: '30px' }}>Buyurtma Sotuvchi</h1>

      {/* Yangilangan Statistika - chiroyliroq */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
            padding: '24px',
            background: 'linear-gradient(135deg, #00BCE4 0%, #0099c7 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 188, 228, 0.35)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>Jami buyurtmalar</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>{stats.totalOrders || 0}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>Umumiy summa</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>
              {stats.totalAmount?.toLocaleString('uz-UZ') || 0} so'm
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>To'lov kutilmoqda</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>{stats.pendingPayment || 0}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>To'langan</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>{stats.paid || 0}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>Yetkazib berilgan</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>{stats.delivered || 0}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', opacity: 0.95 }}>Bekor qilingan</h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 'bold', margin: 0 }}>{stats.cancelled || 0}</p>
          </div>
        </div>
      )}

      {/* Jadval - avvalgidek */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#00BCE4', color: 'white' }}>
              <th style={{ padding: '14px', textAlign: 'left' }}>Mijoz Ism-Familiyasi</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Mahsulot Nomi</th>
              <th style={{ padding: '14px', textAlign: 'right' }}>Summa</th>
              <th style={{ padding: '14px', textAlign: 'center' }}>Soni</th>
            </tr>
          </thead>
          <tbody>
            {flatItems.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Maʼlumot yoʼq</td></tr>
            ) : (
              flatItems.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(item)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0faff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>{item.mijoz}</td>
                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>{item.productName}</td>
                  <td style={{ padding: '14px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                    {item.itemSum.toLocaleString('uz-UZ')} so'm
                  </td>
                  <td style={{ padding: '14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - avvalgidek chiroyli */}
      {selectedOrder && !selectedOrder.error && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 12px 32px rgba(0,188,228,0.4)',
              border: '1px solid #00BCE4',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '24px',
                fontSize: '32px',
                border: 'none',
                background: 'none',
                color: '#00BCE4',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <h2 style={{ color: '#00BCE4', margin: '0 0 24px', fontSize: '1.8rem', textAlign: 'center' }}>
              Buyurtma {selectedOrder.orderNumber || selectedOrder._id}
            </h2>

            <div style={{ lineHeight: 1.7, fontSize: '1rem', color: '#333' }}>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>Mijoz:</strong> {selectedOrder.user_id?.username || '—'} ({selectedOrder.user_id?.phone || '—'})</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>Summa:</strong> {selectedOrder.totalAmount?.toLocaleString('uz-UZ')} so'm</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>To'lov usuli:</strong> {selectedOrder.paymentMethod || '—'}</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>To'lov statusi:</strong> {selectedOrder.paymentStatus || '—'}</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>Yetkazib berish statusi:</strong> {selectedOrder.deliveryStatus || '—'}</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>Manzil:</strong> {selectedOrder.shippingAddress || '—'}</p>
              <p style={{ margin: '12px 0' }}><strong style={{ color: '#00BCE4' }}>Izoh:</strong> {selectedOrder.notes || 'Yoʻq'}</p>

              <hr style={{ margin: '24px 0', borderColor: '#e6f7fd' }} />

              <h3 style={{ color: '#00BCE4', marginBottom: '16px', fontSize: '1.4rem' }}>Mahsulotlar</h3>
              {selectedOrder.items?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                  <thead>
                    <tr style={{ background: '#e6f7fd', color: '#00BCE4' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00BCE4' }}>Nomi</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #00BCE4' }}>Narx</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #00BCE4' }}>Soni</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #00BCE4' }}>Jami</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e6f7fd' }}>
                        <td style={{ padding: '12px' }}>{item.productSnapshot?.name || '—'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{(item.productSnapshot?.price || 0).toLocaleString('uz-UZ')} so'm</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity || 1}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                          {((item.productSnapshot?.price || 0) * (item.quantity || 1)).toLocaleString('uz-UZ')} so'm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#666', textAlign: 'center' }}>Mahsulotlar ro'yxati yo'q</p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedOrder?.error && (
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>{selectedOrder.error}</div>
      )}
    </div>
  );
}

export default BuyurtmaSotuvchi;
