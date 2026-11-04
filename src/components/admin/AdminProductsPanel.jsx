import { useCallback, useEffect, useState } from 'react';
import { api, getApiError } from '../../services/api.js';
import { formatMoney } from '../../utils/commerce.js';

const categories = ['roses', 'tulip-bouquets', 'sunflowers', 'custom-bouquets', 'mini-arrangements', 'pipe-cleaner-crafts', 'decorative-gifts'];
const availabilities = ['available', 'made-to-order', 'unavailable'];
const blankProduct = { name: '', description: '', price: '', image: '', category: '', availability: 'available', stock: '', isActive: true };

function productForm(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    image: product.image || '',
    category: product.category || '',
    availability: product.availability || 'available',
    stock: product.stock == null ? '' : String(product.stock),
    isActive: product.isActive !== false,
  };
}

export default function AdminProductsPanel() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data.products);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load products.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => { setForm(blankProduct); setEditingId(''); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      category: form.category,
      availability: form.availability,
    };
    if (form.stock.trim() !== '') payload.stock = Number(form.stock);
    else if (editingId) payload.stock = null;
    if (editingId) payload.isActive = form.isActive;
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        setNotice('Product updated.');
      } else {
        await api.post('/admin/products', payload);
        setNotice('Product created.');
      }
      resetForm();
      await load();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not save this product.'));
    } finally {
      setSaving(false);
    }
  };

  const archive = async (product) => {
    if (!window.confirm(`Archive “${product.name}”? It will no longer appear in the public collection.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/admin/products/${product._id}`);
      if (editingId === product._id) resetForm();
      setNotice('Product archived. Existing order records remain intact.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not archive this product.'));
    }
  };

  return (
    <section className="admin-panel" aria-labelledby="admin-products-title">
      <div className="admin-panel-heading">
        <div><p className="admin-eyebrow">Studio catalogue</p><h2 id="admin-products-title">Products</h2></div>
        <button className="admin-button admin-button--quiet" type="button" onClick={load} disabled={loading}>Refresh</button>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-products-layout">
        <form className="admin-product-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit product' : 'Add a product'}</h3>
          <label className="admin-field"><span>Product name</span><input name="name" value={form.name} onChange={updateField} minLength="2" maxLength="120" required /></label>
          <label className="admin-field"><span>Description</span><textarea name="description" value={form.description} onChange={updateField} minLength="5" maxLength="2500" rows="4" required /></label>
          <label className="admin-field"><span>Price</span><input type="number" name="price" value={form.price} onChange={updateField} min="0.01" max="10000000" step="0.01" required /></label>
          <label className="admin-field"><span>Image path or HTTPS URL</span><input name="image" value={form.image} onChange={updateField} maxLength="2048" placeholder="/images/your-product.jpg" required /></label>
          <label className="admin-field"><span>Category</span><select name="category" value={form.category} onChange={updateField} required><option value="" disabled>Choose category</option>{categories.map((category) => <option key={category} value={category}>{category.replaceAll('-', ' ')}</option>)}</select></label>
          <label className="admin-field"><span>Availability</span><select name="availability" value={form.availability} onChange={updateField}>{availabilities.map((availability) => <option key={availability} value={availability}>{availability.replaceAll('-', ' ')}</option>)}</select></label>
          <label className="admin-field"><span>Stock quantity <small>(leave blank for untracked stock)</small></span><input type="number" name="stock" value={form.stock} onChange={updateField} min="0" max="100000" step="1" /></label>
          {editingId && <label className="admin-checkbox"><input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} /><span>Active in the catalogue</span></label>}
          <div className="admin-form-actions"><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}</button>{editingId && <button className="admin-button admin-button--quiet" type="button" onClick={resetForm}>Cancel edit</button>}</div>
          <p className="admin-help">Only studio-provided prices should be entered here. Currency is set in the backend environment.</p>
        </form>

        <div className="admin-products-list">
          {loading ? <p className="admin-loading" role="status">Loading products…</p> : !products.length ? <p className="admin-empty">No products yet. Add the studio’s real catalogue when prices and images are ready.</p> : products.map((product) => (
            <article className={`admin-product-row${product.isActive ? '' : ' is-archived'}`} key={product._id}>
              {product.image && <img src={product.image} alt="" loading="lazy" />}
              <div className="admin-product-row-copy"><h3>{product.name}</h3><p>{formatMoney(product.price, product.currency)} · {product.category.replaceAll('-', ' ')}</p><p>{product.availability.replaceAll('-', ' ')}{Number.isFinite(product.stock) ? ` · ${product.stock} in stock` : ''}{product.isActive ? '' : ' · archived'}</p></div>
              <div className="admin-product-row-actions"><button type="button" className="admin-button admin-button--quiet" onClick={() => { setEditingId(product._id); setForm(productForm(product)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>{product.isActive && <button type="button" className="admin-text-button" onClick={() => archive(product)}>Archive</button>}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
