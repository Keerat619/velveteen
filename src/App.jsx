import { lazy, Suspense, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AdminGate from './components/AdminGate.jsx';
import PublicFrame from './components/PublicFrame.jsx';
import { useCart } from './context/CartContext.jsx';
import {
  Contact,
  Events,
  Faq,
  MakingJourney,
  Opening,
  Process,
  Season,
  StandingOrders,
  StudioNotes,
  StudioSessions,
  Work,
} from './components/sections.jsx';
import { useProducts } from './hooks/useProducts.js';
import { useMotion } from './hooks/useMotion.js';

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage.jsx'));
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'));

function HomePage() {
  const rootRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState('Custom bouquet');
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  useMotion(rootRef, products.length);

  return (
    <PublicFrame rootRef={rootRef} onSelectProduct={setSelectedProduct}>
      <Opening onSelectProduct={setSelectedProduct} />
      <Season products={products} loading={loading} error={error} onAddToCart={addItem} onSelectProduct={setSelectedProduct} />
      <Work onSelectProduct={setSelectedProduct} />
      <MakingJourney />
      <StandingOrders onSelectProduct={setSelectedProduct} />
      <Events onSelectProduct={setSelectedProduct} />
      <Process />
      <StudioSessions onSelectProduct={setSelectedProduct} />
      <StudioNotes onSelectProduct={setSelectedProduct} />
      <Faq />
      <Contact selectedProduct={selectedProduct} onSelectProduct={setSelectedProduct} />
    </PublicFrame>
  );
}

function NotFoundPage() {
  return (
    <PublicFrame className="commerce-page">
      <section className="commerce-inner commerce-empty" aria-labelledby="not-found-title">
        <p className="m-text-3">VELVETEEN · A small detour</p>
        <h1 id="not-found-title" className="m-text-2">We couldn’t find that page.</h1>
        <p>It may have moved, or the link may be resting somewhere else.</p>
        <Link className="commerce-button" to="/">Back to the studio</Link>
      </section>
    </PublicFrame>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Opening the studio…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminGate />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
