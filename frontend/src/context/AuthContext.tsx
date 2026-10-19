import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; targetRole?: string; experienceLevel?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('interviewpilot_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { user: userData, tokens } = response.data.data;
      localStorage.setItem('interviewpilot_token', tokens.accessToken);
      setUser(userData);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; targetRole?: string; experienceLevel?: string }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      const { user: userData, tokens } = response.data.data;
      localStorage.setItem('interviewpilot_token', tokens.accessToken);
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup even if server fails
    } finally {
      localStorage.removeItem('interviewpilot_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
