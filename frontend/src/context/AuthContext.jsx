// ============================================================
//  Auth Context — JWT authentication state management
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as loginApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Default loading to true, but evaluate token immediately if possible
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const meRes = await getMe();
        if (mounted) setUser(meRes.data);
      } catch {
        // Token missing/invalid/expired.
        localStorage.removeItem('access_token');
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    const token = res?.data?.access_token;
    if (token) {
      localStorage.setItem('access_token', token);
    }

    const meRes = await getMe();
    setUser(meRes.data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
