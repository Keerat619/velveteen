import { Link } from 'react-router-dom';
import PublicFrame from '../components/PublicFrame.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/commerce.js';
import { useState } from 'react';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [notice, setNotice] = useState('');

  const changeQuantity = (productId, value) => {
    const result = updateQuantity(productId, value);
    setNotice(result.message || '');
  };

  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner" aria-labelledby="cart-title">
        <p className="m-text-3">VELVETEEN · Your bag</p>
        <h1 id="cart-title" className="m-text-2">A few things to keep</h1>
        {notice && <p className="commerce-error" role="alert">{notice}</p>}
        {items.length === 0 ? (
          <div className="commerce-empty">
            <p>Your bag is waiting for its first handmade flower.</p>
            <Link className="commerce-button" to="/#season">Browse the collection</Link>
          </div>
        ) : (
          <div className="commerce-cart-layout">
            <div className="commerce-cart-list">
              {items.map((item) => (
                <article className="commerce-cart-item" key={item.productId}>
                  <Link className="commerce-cart-image" to={`/products/${item.productId}`}>
                    <img src={item.image} alt={`${item.name}, handmade pipe-cleaner flowers`} />
                  </Link>
                  <div className="commerce-cart-copy">
                    <h2 className="m-text-4"><Link to={`/products/${item.productId}`}>{item.name}</Link></h2>
                    <p>{formatMoney(item.price, item.currency)} each</p>
                    <label className="commerce-quantity">
                      <span>Quantity</span>
                      <input type="number" min="1" max={Math.min(item.stock || 99, 99)} value={item.quantity} onChange={(event) => changeQuantity(item.productId, event.target.value)} />
                    </label>
                    <button className="commerce-text-link" type="button" onClick={() => removeItem(item.productId)}>Remove</button>
                  </div>
                  <p className="commerce-cart-subtotal">{formatMoney(item.price * item.quantity, item.currency)}</p>
                </article>
              ))}
            </div>
            <aside className="commerce-summary">
              <h2 className="m-text-4">Order summary</h2>
              <div><span>Subtotal</span><strong>{formatMoney(subtotal, items[0]?.currency)}</strong></div>
              <p>Delivery details are collected at checkout. The server verifies current prices and availability when you place your order.</p>
              <Link className="commerce-button" to="/checkout">Continue to checkout</Link>
              <Link className="commerce-text-link" to="/#season">Continue browsing</Link>
            </aside>
          </div>
        )}
      </section>
    </PublicFrame>
  );
}
