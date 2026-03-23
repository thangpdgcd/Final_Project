import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import Modal from '@/components/common/Modal';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/store/AuthContext';

import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import ForgotPasswordForm from './forms/ForgotPasswordForm';

export type AuthView = 'login' | 'register' | 'forgot';

export type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<AuthView>('login');
  const didRedirectRef = useRef(false);

  type RedirectState = { from?: string | { pathname: string; search?: string } };

  const getRedirectPath = (state: RedirectState | null): string => {
    const from = state?.from;
    if (!from) return '/profile';

    if (typeof from === 'string') return from;

    if (from.pathname) return `${from.pathname}${from.search || ''}`;

    return '/profile';
  };

  useEffect(() => {
    if (open) setView('login');
  }, [open]);

  useEffect(() => {
    if (!open) {
      didRedirectRef.current = false;
      return;
    }

    if (!isAuthenticated) return;
    if (didRedirectRef.current) return;

    didRedirectRef.current = true;

    const redirectTo = getRedirectPath(location.state as RedirectState | null);
    navigate(redirectTo, { replace: true });
  }, [open, isAuthenticated, navigate, location.state]);

  const title =
    view === 'login'
      ? t('auth.loginSubmit')
      : view === 'register'
        ? t('auth.registerTitle')
        : 'Forgot password';

  const subtitle =
    view === 'login'
      ? t('auth.loginSubtitle')
      : view === 'register'
        ? t('auth.registerDivider')
        : 'Enter your email and we will send you a reset link.';

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="w-[90%] max-w-sm"
      showCloseButton={true}
    >
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Logo
            size={48}
            showText={false}
            className="bg-[#4B3621] rounded-full p-2 text-[#FFD700]"
          />
          <h2 className="text-2xl font-black text-[#4B3621] dark:text-amber-100 tracking-tight uppercase">
            {title}
          </h2>
          <p className="text-gray-500 font-bold text-sm text-center">{subtitle}</p>
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'login' && <LoginForm setView={setView} />}
              {view === 'register' && <RegisterForm setView={setView} />}
              {view === 'forgot' && <ForgotPasswordForm setView={setView} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;

