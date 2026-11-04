import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export default function AdminGate() {
  const { admin, checking } = useAdminAuth();
  const location = useLocation();
  if (checking) return <main className="admin-gate-loading" role="status">Checking owner access…</main>;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return <Outlet />;
}
