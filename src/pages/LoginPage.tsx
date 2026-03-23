import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Facebook,
  Instagram,
  Chrome,
  Coffee,
  Leaf,
  Mountain
} from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import Logo from '@/components/common/Logo';
import type { LoginPayload, AuthUser } from '@/types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RedirectState = { from?: string | { pathname: string; search?: string } };

const getRedirectPath = (state: RedirectState | null): string => {
  const from = state?.from;
  if (!from) return '/';

  if (typeof from === 'string') {
    return from;
  }

  if (from.pathname) {
    return `${from.pathname}${from.search || ''}`;
  }

  return '/';
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const didRedirectRef = useRef(false);

  const redirectTo = useMemo(() => {
    return getRedirectPath((location.state as RedirectState) || null);
  }, [location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      if (!data.accessToken || !data.user) {
        messageApi.error(t('auth.loginError'));
        return;
      }

      const user = data.user as AuthUser;
      login(data.accessToken, user);
      messageApi.success(t('auth.loginSuccess'));
    },
    onError: (error: unknown) => {
      const fallbackMessage = t('auth.loginError');
      const invalidResponseMessage = t('common.error');

      if (error instanceof Error && error.message === 'INVALID_LOGIN_RESPONSE') {
        messageApi.error(invalidResponseMessage);
        return;
      }

      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : fallbackMessage;

      messageApi.error(errorMessage);
    },
  });

  // Redirect only after auth state updates, so modal-based login also works.
  useEffect(() => {
    if (!isAuthenticated) {
      didRedirectRef.current = false;
      return;
    }
    if (didRedirectRef.current) return;
    didRedirectRef.current = true;
    navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FDF5E6]">
      {/* Left (Form) - Dark themed premium form */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col justify-center px-6 md:px-20 lg:px-32 bg-[#1c1716] text-white py-12 lg:py-0"
      >
        <div className="max-w-md w-full mx-auto">
          {/* Brand/Logo for mobile */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <Logo size={40} showText={false} className="bg-white rounded-full p-1" />
            <span className="text-xl font-black tracking-widest uppercase text-white">{t('common.brandName')}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{t('auth.loginTitle')}.</h1>
          <p className="text-gray-400 font-medium mb-12">{t('auth.loginSubtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  className={`w-full bg-[#2a2423] border-2 ${errors.email ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600`}
                />
                {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.email.message}</p>}
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`w-full bg-[#2a2423] border-2 ${errors.password ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600`}
                />
                {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input {...register('remember')} type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-gray-700 bg-transparent rounded-md peer-checked:bg-[#FFD700] peer-checked:border-[#FFD700] transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#4B3621] opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{t('auth.rememberMe')}</span>
              </label>
              <button type="button" className="text-sm font-bold text-[#FFD700] hover:underline decoration-2">{t('auth.forgotPassword')}</button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#FFD700", color: "#4B3621" }}
              whileTap={{ scale: 0.98 }}
              disabled={loginMutation.isPending}
              className="w-full py-5 rounded-2xl bg-[#FFD700]/90 text-[#4B3621] font-black tracking-[0.2em] text-sm shadow-2xl shadow-[#FFD700]/10 disabled:opacity-50 transition-all uppercase"
            >
              {loginMutation.isPending ? t('auth.authenticating') : t('auth.exploreTaste')}
            </motion.button>
          </form>

          {/* Social Login */}
          <div className="mt-16">
            <div className="relative flex items-center justify-center mb-10">
              <div className="flex-1 border-t border-gray-800"></div>
              <span className="mx-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Secure Gateway</span>
              <div className="flex-1 border-t border-gray-800"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Facebook />, color: "hover:text-[#1877F2]", label: "FB" },
                { icon: <Chrome />, color: "hover:text-emerald-400", label: "GL" },
                { icon: <Instagram />, color: "hover:text-pink-500", label: "IG" }
              ].map((social, i) => (
                <button
                  key={i}
                  title={t('auth.loginSocialInfo', { provider: social.label })}
                  className={`h-16 flex items-center justify-center rounded-2xl bg-[#2a2423] text-gray-400 border border-transparent hover:border-gray-700 transition-all hover:bg-white/5 ${social.color}`}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-16 text-center text-gray-500 font-bold text-sm">
            {t('auth.noAccount')} {' '}
            <Link to="/register" className="text-white hover:text-[#FFD700] transition-colors underline decoration-2 underline-offset-4 decoration-[#FFD700]/30 font-black">
              {t('auth.joinNow')}
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right (Banner) - High-end gradient branding */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#4B3621]"
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px]"
          />
          <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-black rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center py-12 px-16 text-center">
          <Logo size={200} showText={false} className="mb-12" />

          <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase text-shadow">
            Brewing <br /> <span className="text-[#FFD700]">Excellence.</span>
          </h2>
          <p className="text-amber-100/60 max-w-sm mx-auto font-bold text-lg mb-16 leading-relaxed">
            "Pure roasted coffee from Kon Tum — rich aroma, bold flavor. Experience the source."
          </p>

          <div className="grid grid-cols-3 gap-12">
            {[
              { icon: <Coffee />, label: "Aromatic" },
              { icon: <Leaf />, label: "Organic" },
              { icon: <Mountain />, label: "Heritage" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#4B3621] transition-all duration-300 shadow-xl">
                  {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
