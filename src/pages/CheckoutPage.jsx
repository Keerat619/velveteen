import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicFrame from '../components/PublicFrame.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api, getApiError } from '../services/api.js';
import { formatMoney } from '../utils/commerce.js';

const initialForm = {
  customerName: '',
  email: '',
  phone: '',
  deliveryAddress: '',
  city: '',
  pincode: '',
  paymentMethod: 'Cash on Delivery',
  specialInstructions: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    };
    try {
      const { data } = await api.post('/orders', payload);
      clearCart();
      navigate(`/order-confirmation/${encodeURIComponent(data.order.orderNumber)}`, { state: { order: data.order } });
    } catch (requestError) {
      setError(getApiError(requestError, 'We could not place your order. Please review your details and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner" aria-labelledby="checkout-title">
        <p className="m-text-3">VELVETEEN · Secure order request</p>
        <h1 id="checkout-title" className="m-text-2">Checkout</h1>
        {!items.length ? (
          <div className="commerce-empty"><p>Your bag is empty.</p><Link className="commerce-button" to="/products">Browse the collection</Link></div>
        ) : (
          <div className="commerce-checkout-layout">
            <form className="commerce-form" onSubmit={submitOrder}>
              <h2 className="m-text-4">Delivery details</h2>
              <div className="commerce-form-grid">
                <label className="commerce-field commerce-field--wide"><span>Full name</span><input name="customerName" value={form.customerName} onChange={update} autoComplete="name" minLength="2" maxLength="120" required /></label>
                <label className="commerce-field"><span>Email address</span><input type="email" name="email" value={form.email} onChange={update} autoComplete="email" maxLength="254" required /></label>
                <label className="commerce-field"><span>Phone number</span><input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" minLength="7" maxLength="24" required /></label>
                <label className="commerce-field commerce-field--wide"><span>Delivery address</span><textarea name="deliveryAddress" value={form.deliveryAddress} onChange={update} autoComplete="street-address" minLength="5" maxLength="500" rows="3" required /></label>
                <label className="commerce-field"><span>City</span><input name="city" value={form.city} onChange={update} autoComplete="address-level2" minLength="2" maxLength="100" required /></label>
                <label className="commerce-field"><span>PIN / postal code</span><input name="pincode" value={form.pincode} onChange={update} autoComplete="postal-code" minLength="4" maxLength="12" required /></label>
              </div>

              <fieldset className="commerce-payment">
                <legend className="m-text-4">Payment preference</legend>
                <label className="commerce-payment-option">
                  <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={form.paymentMethod === 'Cash on Delivery'} onChange={update} />
                  <span><strong>Cash on Delivery</strong><small>Pay when your order arrives.</small></span>
                </label>
                <label className="commerce-payment-option">
                  <input type="radio" name="paymentMethod" value="Manual Payment" checked={form.paymentMethod === 'Manual Payment'} onChange={update} />
                  <span><strong>Manual Payment</strong><small>The studio will share payment instructions after confirming your order. No card details are collected here.</small></span>
                </label>
              </fieldset>

              <label className="commerce-field"><span>Delivery notes (optional)</span><textarea name="specialInstructions" value={form.specialInstructions} onChange={update} maxLength="1200" rows="3" placeholder="Anything the studio should know?" /></label>
              {error && <p className="commerce-error" role="alert">{error}</p>}
              <button className="commerce-button" type="submit" disabled={submitting}>{submitting ? 'Placing your order…' : 'Place order'}</button>
              <p className="commerce-fineprint">Submitting an order does not authorize a card payment. Current product prices, availability, and the final total are verified by the server.</p>
            </form>

            <aside className="commerce-summary">
              <h2 className="m-text-4">Your order</h2>
              {items.map((item) => (
                <div className="commerce-summary-line" key={item.productId}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{formatMoney(item.price * item.quantity, item.currency)}</strong>
                </div>
              ))}
              <div className="commerce-summary-total"><span>Estimated subtotal</span><strong>{formatMoney(subtotal, items[0]?.currency)}</strong></div>
              <p>Shipping, taxes (if applicable), and live product pricing will be confirmed by the studio.</p>
              <Link className="commerce-text-link" to="/cart">Back to bag</Link>
            </aside>
          </div>
        )}
      </section>
    </PublicFrame>
  );
}
