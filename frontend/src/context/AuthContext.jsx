import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track if we've done initial session check
  const checkedRef = useRef(false);

  useEffect(() => {
    // Only run ONCE on mount — never again
    if (checkedRef.current) return;
    checkedRef.current = true;

    const checkSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []); // strict empty deps — only on mount

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if logout API fails, clear local state
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
