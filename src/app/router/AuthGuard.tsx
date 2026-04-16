import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';

const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;
    if (toastShown) return;

    toast.warning(t('customersCart.notLoggedIn'), { toastId: 'require-login' });
    setToastShown(true);
  }, [isAuthenticated, isLoading, t, toastShown]);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
};

export default AuthGuard;

