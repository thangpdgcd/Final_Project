import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthHydrated, selectIsAuthenticated } from '@/redux/selectors';

const RequireAuth: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hydrated = useAppSelector(selectAuthHydrated);
  const location = useLocation();
  const { t } = useTranslation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) return;
    if (toastShownRef.current) return;

    toast.warning(t('customersCart.notLoggedIn'), { toastId: 'require-login' });
    toastShownRef.current = true;
  }, [isAuthenticated, hydrated, t]);

  if (!hydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
};

export default RequireAuth;

