import { useCallback, useEffect, useState } from 'react';
import { api, getApiError } from '../../services/api.js';
import { formatMoney } from '../../utils/commerce.js';

const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [transitions, setTransitions] = useState({});
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (query) params.search = query;
      if (status) params.status = status;
      const [orderResult, rulesResult] = await Promise.all([
        api.get('/admin/orders', { params }),
        api.get('/admin/orders/status-rules'),
      ]);
      setOrders(orderResult.data.orders);
      setOrderStatuses(orderResult.data.orderStatuses);
      setPaymentStatuses(orderResult.data.paymentStatuses);
      setTransitions(rulesResult.data.transitions);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load orders.'));
    } finally {
      setLoading(false);
    }
  }, [query, sort, status]);

  useEffect(() => { load(); }, [load]);

  const update = async (orderId, field, value) => {
    setUpdating(`${orderId}:${field}`);
    setNotice('');
    setError('');
    try {
      const path = field === 'orderStatus' ? 'status' : 'payment-status';
      const { data } = await api.patch(`/admin/orders/${orderId}/${path}`, { [field]: value });
      setOrders((current) => current.map((order) => order._id === orderId ? { ...order, ...data.order } : order));
      setNotice(`${field === 'orderStatus' ? 'Order' : 'Payment'} status updated.`);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update this order.'));
    } finally {
      setUpdating('');
    }
  };

  const submitSearch = (event) => { event.preventDefault(); setQuery(search.trim()); };

  return (
    <section className="admin-panel" aria-labelledby="admin-orders-title">
      <div className="admin-panel-heading">
        <div><p className="admin-eyebrow">Customer orders</p><h2 id="admin-orders-title">Orders</h2></div>
        <button className="admin-button admin-button--quiet" type="button" onClick={load} disabled={loading}>Refresh</button>
      </div>
      <form className="admin-filter-bar" onSubmit={submitSearch}>
        <label className="admin-field admin-field--search"><span>Search order number or name</span><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength="120" /></label>
        <label className="admin-field"><span>Order status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        <button className="admin-button" type="submit">Search</button>
      </form>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <p className="admin-loading" role="status">Loading orders…</p> : !orders.length ? <p className="admin-empty">No orders match these filters.</p> : (
        <div className="admin-record-list">
          {orders.map((order) => {
            const allowed = [order.orderStatus, ...(transitions[order.orderStatus] || [])];
            return (
              <article className="admin-record" key={order._id}>
                <header className="admin-record-header">
                  <div><p className="admin-eyebrow">{dateTime(order.createdAt)}</p><h3>{order.orderNumber}</h3></div>
                  <div className="admin-record-controls">
                    <label className="admin-field"><span>Order status</span><select value={order.orderStatus} disabled={updating === `${order._id}:orderStatus`} onChange={(event) => update(order._id, 'orderStatus', event.target.value)}>{allowed.map((item) => <option key={item}>{item}</option>)}</select></label>
                    <label className="admin-field"><span>Payment status</span><select value={order.paymentStatus} disabled={updating === `${order._id}:paymentStatus`} onChange={(event) => update(order._id, 'paymentStatus', event.target.value)}>{paymentStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
                  </div>
                </header>
                <div className="admin-record-columns">
                  <section><h4>Customer</h4><p><strong>{order.customerName}</strong></p><p><a href={`mailto:${order.email}`}>{order.email}</a></p><p><a href={`tel:${order.phone}`}>{order.phone}</a></p><p>{order.deliveryAddress}<br />{order.city} · {order.pincode}</p></section>
                  <section><h4>Items</h4>{order.items.map((item, index) => <p key={`${item.productId || item.productName}-${index}`}>{item.productName} × {item.quantity} <span>({formatMoney(item.price, order.currency)} each)</span></p>)}<p className="admin-order-total">Total: {formatMoney(order.totalAmount, order.currency)}</p><p>Payment method: {order.paymentMethod}</p></section>
                </div>
                {order.specialInstructions && <p className="admin-record-note"><strong>Delivery notes:</strong> {order.specialInstructions}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
