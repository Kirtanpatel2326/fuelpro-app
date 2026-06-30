import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, formatApiErrorDetail } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    // null = not loaded yet
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated

  const fetchMe = useCallback(async () => {
    // Mock user for UI preview phase (uncomment API when backend is ready)
    // try {
    //   const { data } = await api.get('/auth/me');
    //   setUser(data.data);
    //   setStatus('authenticated');
    //   return data.data;
    // } catch {
      setUser(null);
      setStatus('unauthenticated');
      return null;
    // }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    // Mock login for UI preview
    const role = email === 'admin@fuelpro.com' ? 'admin' : 'customer';
    const mockUser = { id: Date.now(), name: role === 'admin' ? 'FuelPro Admin' : 'Alex Rivers', email, role };
    setUser(mockUser);
    setStatus('authenticated');
    return { ok: true, user: mockUser };
  }, []);

  const register = useCallback(async (payload) => {
    // Mock register
    const mockUser = { id: Date.now(), name: payload.name || 'New User', email: payload.email, role: 'customer' };
    setUser(mockUser);
    setStatus('authenticated');
    return { ok: true, user: mockUser };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const socialLogin = useCallback(async (provider, token) => {
    // Mock social login
    const mockUser = { id: Date.now(), name: `${provider} User`, email: `user@${provider.toLowerCase()}.com`, role: 'customer' };
    setUser(mockUser);
    setStatus('authenticated');
    return { ok: true, user: mockUser };
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, socialLogin, register, logout, refresh: fetchMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
