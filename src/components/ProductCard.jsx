import { Link } from 'react-router-dom';
import { availabilityLabel, formatMoney } from '../utils/commerce.js';

export default function ProductCard({ product, onAddToCart }) {
  const productId = product._id || product.id;
  const result = () => onAddToCart(product);
  return (
    <article className="commerce-product-card">
      <Link className="commerce-product-image" to={`/products/${productId}`} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={`${product.name}, handmade pipe-cleaner flowers`} loading="lazy" />
      </Link>
      <div className="commerce-product-info">
        <p className="m-text-3">{String(product.category || '').replaceAll('-', ' ')}</p>
        <h2 className="m-text-4"><Link to={`/products/${productId}`}>{product.name}</Link></h2>
        <p className="commerce-product-description">{product.description}</p>
        <div className="commerce-product-meta">
          <strong>{formatMoney(product.price, product.currency)}</strong>
          <span>{availabilityLabel(product.availability)}</span>
        </div>
        <div className="commerce-product-actions">
          <Link className="commerce-text-link" to={`/products/${productId}`}>Details</Link>
          <button className="commerce-button commerce-button--small" type="button" onClick={result}>Add to bag</button>
        </div>
      </div>
    </article>
  );
}
