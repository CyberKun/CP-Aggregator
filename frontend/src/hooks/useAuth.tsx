'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi, userApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await userApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    const res = await authApi.login(data);
    const { token } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    try {
      const meRes = await userApi.getMe();
      setUser(meRes.data);
    } catch (err) {
      setUser(res.data.user);
    }
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    const { token } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    try {
      const meRes = await userApi.getMe();
      setUser(meRes.data);
    } catch (err) {
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await userApi.getMe();
        setUser(res.data);
      } catch (err) {
        console.error('Failed to refresh user', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
