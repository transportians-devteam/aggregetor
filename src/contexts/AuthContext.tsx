import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  fetchProfile,
  loginDevelopment,
  logoutServer,
  verifyLoginOtp,
  LoginResponse,
  UserProfile,
  UserRole,
} from '@/services/authService';
import { ACCESS_TOKEN_KEY, AUTH_STORAGE_KEY, REFRESH_TOKEN_KEY } from '@/services/api';

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  user: UserProfile | null;
}

interface AuthContextType {
  auth: AuthState;
  acceptSession: (session: LoginResponse) => void;
  loginDevelopment: (phone: string, role: UserRole) => Promise<void>;
  loginWithOtp: (challengeId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const emptyAuth: AuthState = { isLoggedIn: false, role: null, user: null };
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) as AuthState : emptyAuth;
  } catch {
    return emptyAuth;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadStoredAuth);

  const clearLocal = useCallback(() => {
    setAuth(emptyAuth);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const acceptSession = useCallback((session: LoginResponse) => {
    const state: AuthState = { isLoggedIn: true, role: session.user.role, user: session.user };
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    const state: AuthState = { isLoggedIn: true, role: profile.role, user: profile };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) refreshProfile().catch(clearLocal);
    const clear = () => clearLocal();
    window.addEventListener('gacp-session-cleared', clear);
    return () => window.removeEventListener('gacp-session-cleared', clear);
  }, [clearLocal, refreshProfile]);

  const context = useMemo<AuthContextType>(() => ({
    auth,
    acceptSession,
    loginDevelopment: async (phone, role) => acceptSession(await loginDevelopment(phone, role)),
    loginWithOtp: async (challengeId, code) => acceptSession(await verifyLoginOtp(challengeId, code)),
    logout: async () => {
      try { await logoutServer(); } finally { clearLocal(); }
    },
    refreshProfile,
  }), [acceptSession, auth, clearLocal, refreshProfile]);

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export type { UserRole };
