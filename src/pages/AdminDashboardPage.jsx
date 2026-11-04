import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminOrdersPanel from '../components/admin/AdminOrdersPanel.jsx';
import AdminProductsPanel from '../components/admin/AdminProductsPanel.jsx';
import AdminRequestsPanel from '../components/admin/AdminRequestsPanel.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { api, getApiError } from '../services/api.js';

const panels = [
  { id: 'orders', label: 'Orders' },
  { id: 'requests', label: 'Custom requests' },
  { id: 'products', label: 'Products' },
];

export default function AdminDashboardPage() {
  const { admin, logout } = useAdminAuth();
  const [activePanel, setActivePanel] = useState('orders');
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/admin/dashboard/stats')
      .then(({ data }) => { if (active) setStats(data.stats); })
      .catch((error) => { if (active) setStatsError(getApiError(error, 'Dashboard summary is unavailable.')); });
    return () => { active = false; };
  }, []);

  return (
    <main className="admin-app">
      <header className="admin-topbar">
        <Link to="/" className="admin-brand">Velveteen <span>Studio dashboard</span></Link>
        <div className="admin-account"><span>{admin?.email}</span><button type="button" className="admin-button admin-button--quiet" onClick={logout}>Log out</button></div>
      </header>
      <div className="admin-main">
        <div className="admin-welcome"><div><p className="admin-eyebrow">Owner workspace</p><h1>Good day, {admin?.username || 'Studio owner'}.</h1><p>Orders, enquiries, and catalogue — in one calm place.</p></div></div>
        {statsError && <p className="admin-error" role="alert">{statsError}</p>}
        {stats && <section className="admin-stats" aria-label="Store overview">
          <article><span>All orders</span><strong>{stats.totalOrders}</strong></article>
          <article><span>New orders</span><strong>{stats.newOrders}</strong></article>
          <article><span>In progress</span><strong>{stats.inProgressOrders}</strong></article>
          <article><span>Delivered</span><strong>{stats.completedOrders}</strong></article>
          <article><span>New custom requests</span><strong>{stats.newCustomRequests}</strong></article>
        </section>}
        {!stats && !statsError && <p className="admin-loading" role="status">Loading studio overview…</p>}
        <nav className="admin-tabs" aria-label="Dashboard sections">
          {panels.map((panel) => <button type="button" key={panel.id} className={activePanel === panel.id ? 'is-active' : ''} aria-current={activePanel === panel.id ? 'page' : undefined} onClick={() => setActivePanel(panel.id)}>{panel.label}</button>)}
        </nav>
        {activePanel === 'orders' && <AdminOrdersPanel />}
        {activePanel === 'requests' && <AdminRequestsPanel />}
        {activePanel === 'products' && <AdminProductsPanel />}
      </div>
      <footer className="admin-footer">Velveteen · Private owner workspace</footer>
    </main>
  );
}
