// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      api.getCurrentUser()
        .then(res => {
          if (res.success && res.data) {
            // Ensure the role field is present
            setUser({
              ...res.data,
              role: res.data.role // should be 'agent', 'customer_care', 'finance', 'admin'
            });
          } else {
            localStorage.removeItem('token');
            api.setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          api.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success && res.data && res.data.token) {
      api.setToken(res.data.token);
      // Set user state with role from login response
      setUser({
        username: res.data.username,
        fullName: res.data.fullName,
        role: res.data.role, // Ensure role is set
        ...res.data
      });
      return res;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    return api.register(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}