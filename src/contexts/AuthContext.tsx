import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for testing without backend
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@rcms.com': {
    password: 'Admin@123456',
    user: { id: '1', name: 'System Admin', email: 'admin@rcms.com', role: 'admin', isActive: true },
  },
  'worker@rcms.com': {
    password: 'Worker@123',
    user: { id: '2', name: 'John Worker', email: 'worker@rcms.com', role: 'worker', phone: '555-0102', isActive: true },
  },
  'staff@rcms.com': {
    password: 'Staff@123',
    user: { id: '3', name: 'Dr. Sarah Staff', email: 'staff@rcms.com', role: 'staff', phone: '555-0103', isActive: true },
  },
  'patient@rcms.com': {
    password: 'Patient@123',
    user: { id: '4', name: 'Rahul Sharma', email: 'patient@rcms.com', role: 'patient', phone: '555-0104', isActive: true },
  },
};

// Runtime-registered users (from Add User / Sign Up)
const runtimeUsers: Record<string, { password: string; user: User }> = {};

export const registerUser = (email: string, password: string, user: User) => {
  runtimeUsers[email.trim().toLowerCase()] = { password, user };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('rcms_token');
    const savedUser = localStorage.getItem('rcms_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('rcms_token');
        localStorage.removeItem('rcms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Please provide email and password');
    }

    // Try real backend first
    const API_URL = import.meta.env.VITE_API_URL;
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rcms_token', data.token);
      localStorage.setItem('rcms_user', JSON.stringify(data.user));
      return;
    }

    // Fallback to demo + runtime accounts
    const demo = DEMO_USERS[trimmedEmail] || runtimeUsers[trimmedEmail];
    if (!demo || demo.password !== trimmedPassword) {
      throw new Error('Invalid email or password. Try the demo accounts below.');
    }
    const fakeToken = 'demo_token_' + demo.user.role + '_' + Date.now();
    setToken(fakeToken);
    setUser(demo.user);
    localStorage.setItem('rcms_token', fakeToken);
    localStorage.setItem('rcms_user', JSON.stringify(demo.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rcms_token');
    localStorage.removeItem('rcms_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
