import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const TOKEN_KEY = 'velveteen_admin_token';
const AdminAuthContext = createContext(null);

function getToken() {
  try { return window.sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function removeToken() {
  try { window.sessionStorage.removeItem(TOKEN_KEY); } catch { /* session storage can be disabled */ }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setChecking(false);
      return () => { active = false; };
    }
    api.get('/admin/auth/me')
      .then(({ data }) => { if (active) setAdmin(data.admin); })
      .catch(() => { removeToken(); if (active) setAdmin(null); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    try { window.sessionStorage.setItem(TOKEN_KEY, data.token); } catch {
      throw new Error('Browser session storage is required to keep the admin session. Enable it and try again.');
    }
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    removeToken();
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, checking, login, logout }), [admin, checking]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  return context;
}
