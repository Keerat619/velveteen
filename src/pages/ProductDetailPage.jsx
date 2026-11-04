import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicFrame from '../components/PublicFrame.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api, getApiError } from '../services/api.js';
import { availabilityLabel, formatMoney } from '../utils/commerce.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get(`/products/${id}`, { signal: controller.signal })
      .then(({ data }) => { setProduct(data.product); setError(''); })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError') setError(getApiError(requestError, 'This product could not be loaded.'));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const addProduct = () => {
    const result = addItem(product);
    setNotice(result.message || '');
  };

  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner" aria-labelledby="product-title">
        <p className="m-text-3"><Link to="/products">The collection</Link> · Product details</p>
        {loading && <p className="commerce-notice" role="status">Loading product…</p>}
        {error && <div className="commerce-empty"><p className="commerce-error" role="alert">{error}</p><Link to="/products">Return to the collection</Link></div>}
        {!loading && product && (
          <div className="commerce-detail">
            <figure className="commerce-detail-image">
              <img src={product.image} alt={`${product.name}, handmade pipe-cleaner flowers`} />
            </figure>
            <div className="commerce-detail-copy">
              <p className="m-text-3">{String(product.category).replaceAll('-', ' ')}</p>
              <h1 id="product-title" className="m-text-2">{product.name}</h1>
              <p className="commerce-detail-description">{product.description}</p>
              <p className="commerce-detail-price">{formatMoney(product.price, product.currency)}</p>
              <p className="commerce-availability">{availabilityLabel(product.availability)}{Number.isFinite(product.stock) ? ` · ${product.stock} available` : ''}</p>
              {notice && <p className="commerce-notice" role="status">{notice}</p>}
              <button className="commerce-button" type="button" onClick={addProduct}>Add to bag</button>
              <Link className="commerce-text-link" to="/cart">View your bag</Link>
              <p className="commerce-fineprint">Final order totals are verified by the studio when your order is placed. Product availability may change.</p>
            </div>
          </div>
        )}
      </section>
    </PublicFrame>
  );
}
