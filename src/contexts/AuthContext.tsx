import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { login as loginApi, fetchProfile, UserProfile } from '@/services/authService';
export type UserRole = 'aggregator' | 'admin' | 'morth';

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  user: UserProfile | null;
  accessToken?: string;
}

interface AuthContextType {
  auth: AuthState;
  login: (phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const storageKey = 'gacp_auth';

function loadStoredAuth(): AuthState {
  if (typeof window === 'undefined') {
    return { isLoggedIn: false, role: 'aggregator', user: null };
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as AuthState;
    }
  } catch {
    // ignore malformed state
  }

  return { isLoggedIn: false, role: 'aggregator', user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadStoredAuth);

  useEffect(() => {
    const token = localStorage.getItem('gacp_access_token');
    if (token && !auth.user) {
      refreshProfile();
    }
  }, []);

  const persistAuth = (newAuth: AuthState) => {
    setAuth(newAuth);
    localStorage.setItem(storageKey, JSON.stringify(newAuth));
    if (newAuth.accessToken) {
      localStorage.setItem('gacp_access_token', newAuth.accessToken);
    }
  };

  const login = async (phone: string, role: UserRole) => {
    const response = await loginApi(phone, role);
    const newAuth: AuthState = {
      isLoggedIn: true,
      role: response.user.role as UserRole,
      user: response.user,
      accessToken: response.accessToken,
    };
    persistAuth(newAuth);
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, role: 'aggregator', user: null });
    localStorage.removeItem(storageKey);
    localStorage.removeItem('gacp_access_token');
  };

  const refreshProfile = async () => {
    try {
      const profile = await fetchProfile();
      const updatedAuth: AuthState = {
        isLoggedIn: true,
        role: profile.role as UserRole,
        user: profile,
        accessToken: auth.accessToken,
      };
      persistAuth(updatedAuth);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
