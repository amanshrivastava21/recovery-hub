import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Runtime-registered users (from Add User / Sign Up)
const runtimeUsers: Record<string, { password: string; user: User }> = {};

export const registerUser = (email: string, password: string, user: User) => {
  const key = email.trim().toLowerCase();
  runtimeUsers[key] = { password, user };
  
  // ✅ LocalStorage mein save karo taaki refresh ke baad bhi kaam kare
  const saved = JSON.parse(localStorage.getItem('rcms_runtime_users') || '{}');
  saved[key] = { password, user };
  localStorage.setItem('rcms_runtime_users', JSON.stringify(saved));
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const AuthProvider = ({children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // ✅ Ye add karo - saved users load karo
  const savedUsers = JSON.parse(localStorage.getItem('rcms_runtime_users') || '{}');
  Object.assign(runtimeUsers, savedUsers);

  // Existing code neeche as it is rahega
  const savedToken = localStorage.getItem('rcms_token');
  const savedUser = localStorage.getItem('rcms_user');
  if (savedToken && savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      let nextToken = savedToken;

      if (savedToken.startsWith('runtime_token_') && parsedUser?.staffRole) {
        const userId = parsedUser.id || parsedUser._id || parsedUser.email;
        nextToken = `runtime_token_${parsedUser.role}_${parsedUser.staffRole}_${userId}_${Date.now()}`;
        localStorage.setItem('rcms_token', nextToken);
      }

      setToken(nextToken);
      setUser(parsedUser);
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

    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        });
        const data = await res.json();

        if (res.ok) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('rcms_token', data.token);
          localStorage.setItem('rcms_user', JSON.stringify(data.user));
          return;
        }

        throw new Error(data.message || 'Invalid email or password');
      } catch (err) {
        const runtimeUser = runtimeUsers[trimmedEmail];
        if (runtimeUser && runtimeUser.password === trimmedPassword) {
          const userId = runtimeUser.user.id || runtimeUser.user._id || runtimeUser.user.email;
          const tokenStaffRole = runtimeUser.user.staffRole || runtimeUser.user.role;
          const fakeToken = `runtime_token_${runtimeUser.user.role}_${tokenStaffRole}_${userId}_${Date.now()}`;
          setToken(fakeToken);
          setUser(runtimeUser.user);
          localStorage.setItem('rcms_token', fakeToken);
          localStorage.setItem('rcms_user', JSON.stringify(runtimeUser.user));
          return;
        }

        if (err instanceof Error && err.message?.toLowerCase().includes('failed to fetch')) {
          throw new Error('Unable to reach backend. Please ensure the backend server is running.');
        }

        throw err;
      }
    }

    const runtimeUser = runtimeUsers[trimmedEmail];
    if (!runtimeUser || runtimeUser.password !== trimmedPassword) {
      throw new Error('Invalid email or password.');
    }

    const userId = runtimeUser.user.id || runtimeUser.user._id || runtimeUser.user.email;
    const tokenStaffRole = runtimeUser.user.staffRole || runtimeUser.user.role;
    const fakeToken = `runtime_token_${runtimeUser.user.role}_${tokenStaffRole}_${userId}_${Date.now()}`;
    setToken(fakeToken);
    setUser(runtimeUser.user);
    localStorage.setItem('rcms_token', fakeToken);
    localStorage.setItem('rcms_user', JSON.stringify(runtimeUser.user));
    return;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rcms_token');
    localStorage.removeItem('rcms_user');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('rcms_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
