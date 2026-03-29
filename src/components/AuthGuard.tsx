import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@/store/AuthContext';

const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [hasToastShown, setHasToastShown] = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = isAuthenticated || Boolean(token);

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !hasToastShown) {
      toast.warning('Vui lòng đăng nhập', { toastId: 'require-login' });
      setHasToastShown(true);
    }
  }, [isLoading, isLoggedIn, hasToastShown]);

  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthGuard;
