import { useMemo, useState } from 'react';
import PublicFrame from '../components/PublicFrame.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCatalogPage() {
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [notice, setNotice] = useState('');

  const categories = useMemo(() => [...new Set(products.map((product) => product.category))], [products]);
  const filtered = products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const addProduct = (product) => {
    const result = addItem(product);
    setNotice(result.message || '');
  };

  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner" aria-labelledby="catalog-title">
        <p className="m-text-3">VELVETEEN · The collection</p>
        <h1 id="catalog-title" className="m-text-2">Handmade pieces</h1>
        <p className="commerce-intro">Each piece is shaped from soft chenille stems and listed with its current price and availability.</p>
        <div className="commerce-toolbar">
          <label className="commerce-field">
            <span>Search the collection</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rose, tulip, keepsake…" />
          </label>
          <label className="commerce-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All pieces</option>
              {categories.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}
            </select>
          </label>
        </div>
        {notice && <p className="commerce-notice" role="status">{notice}</p>}
        {loading && <p className="commerce-notice" role="status">Loading the collection…</p>}
        {error && <p className="commerce-error" role="alert">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="commerce-empty"><p>{products.length ? 'No pieces match those filters.' : 'The collection is being prepared.'}</p><a href="/#contact">Ask about a custom piece</a></div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="commerce-product-grid">
            {filtered.map((product) => <ProductCard key={product._id} product={product} onAddToCart={addProduct} />)}
          </div>
        )}
      </section>
    </PublicFrame>
  );
}
