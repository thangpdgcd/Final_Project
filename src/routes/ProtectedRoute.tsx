import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: (string | number)[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const isLoggedIn = isAuthenticated || Boolean(token);

  if (isLoading) return null;

  if (!isLoggedIn) {
    const loginPath = '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // Normalize roleID so "1" (string) matches 1 (number).
  const normalizeRole = (role: string | number | undefined) => {
    if (role === undefined || role === null) return role;
    if (typeof role === 'string') {
      const n = Number(role);
      return Number.isNaN(n) ? role : n;
    }
    return role;
  };

  if (allowedRoles && user) {
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    const normalizedUserRole = normalizeRole(user.roleID);

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
