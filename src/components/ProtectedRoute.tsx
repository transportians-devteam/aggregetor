import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { auth } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem('gacp_access_token');
  if (!auth.isLoggedIn || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleProtectedRoute({ children, allowedRoles }: { children: ReactElement; allowedRoles: string[] }) {
  const { auth } = useAuth();

  const token = localStorage.getItem('gacp_access_token');
  if (!auth.isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
