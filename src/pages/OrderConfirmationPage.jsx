import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PublicFrame from '../components/PublicFrame.jsx';
import { api, getApiError } from '../services/api.js';
import { formatMoney } from '../utils/commerce.js';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/orders/${encodeURIComponent(orderNumber)}`, { headers: { 'x-order-email': email } });
      setOrder(data.order);
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not find an order with those details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner commerce-confirmation" aria-labelledby="confirmation-title">
        <p className="m-text-3">VELVETEEN · Thank you</p>
        <h1 id="confirmation-title" className="m-text-2">{order ? 'Your order is in.' : 'Order details'}</h1>
        {order ? (
          <div className="commerce-confirmation-card">
            <p>Thank you for supporting handmade work. Keep your order number for your records.</p>
            <p className="commerce-order-number"><span>Order number</span><strong>{order.orderNumber || orderNumber}</strong></p>
            <div className="commerce-confirmation-items">
              {order.items?.map((item, index) => (
                <div className="commerce-summary-line" key={`${item.productId || item.productName}-${index}`}>
                  <span>{item.productName || item.name} × {item.quantity}</span>
                  <strong>{formatMoney(item.price * item.quantity, order.currency)}</strong>
                </div>
              ))}
            </div>
            <div className="commerce-summary-total"><span>Order total</span><strong>{formatMoney(order.totalAmount, order.currency)}</strong></div>
            <p>Payment preference: <strong>{order.paymentMethod}</strong> · Status: <strong>{order.orderStatus}</strong></p>
            {order.paymentMethod === 'Manual Payment' && <p>The studio will contact you with manual payment instructions. No payment was taken on this site.</p>}
            <p className="commerce-fineprint">To look up this order again, use the same email address provided at checkout.</p>
          </div>
        ) : (
          <div className="commerce-confirmation-card">
            <p>For privacy, enter the email address used at checkout to retrieve this order.</p>
            <p className="commerce-order-number"><span>Order number</span><strong>{orderNumber}</strong></p>
            <form className="commerce-lookup-form" onSubmit={lookup}>
              <label className="commerce-field"><span>Checkout email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength="254" autoComplete="email" required /></label>
              {error && <p className="commerce-error" role="alert">{error}</p>}
              <button className="commerce-button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'View order'}</button>
            </form>
          </div>
        )}
        <div className="commerce-confirmation-links"><Link className="commerce-button" to="/products">Continue browsing</Link><Link className="commerce-text-link" to="/">Back to home</Link></div>
      </section>
    </PublicFrame>
  );
}
