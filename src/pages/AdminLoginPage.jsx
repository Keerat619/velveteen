import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { getApiError } from '../services/api.js';

export default function AdminLoginPage() {
  const { admin, checking, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!checking && admin) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const destination = location.state?.from?.pathname;
      navigate(destination?.startsWith('/admin') && destination !== '/admin/login' ? destination : '/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || (requestError.message?.startsWith('Browser session storage') ? requestError.message : getApiError(requestError, 'Unable to sign in. Check your details and try again.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="admin-brand">Velveteen <span>Owner access</span></Link>
        <p className="admin-eyebrow">Private studio workspace</p>
        <h1>Sign in</h1>
        <p className="admin-login-note">This area is for the studio owner. There is no public sign-up.</p>
        <form className="admin-form" onSubmit={submit}>
          <label className="admin-field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required maxLength="254" /></label>
          <label className="admin-field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required maxLength="200" /></label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-button" type="submit" disabled={submitting || checking}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <Link className="admin-back-link" to="/">← Back to the shop</Link>
      </div>
    </main>
  );
}
