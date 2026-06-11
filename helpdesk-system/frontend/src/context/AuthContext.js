import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hd_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem('hd_token', data.token);
    localStorage.setItem('hd_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('hd_token');
    localStorage.removeItem('hd_user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAgent, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
