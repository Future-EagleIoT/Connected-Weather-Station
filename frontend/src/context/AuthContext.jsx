// ============================================================
//  Auth Context — JWT authentication state management
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Default loading to true, but evaluate token immediately if possible
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    let mounted = true;
    
    // Simulate an async request to check user token validity
    setTimeout(() => {
      if (mounted) {
        const status = authService.getCurrentUser();
        if (!status) {
          setLoading(false);
        } else {
          setUser({ id: 0, name: "Operator" });
          setLoading(false);
        }
      }
    }, 100);
    
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user || { id: 0, name: "Operator" });
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
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
