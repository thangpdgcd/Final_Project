import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Chrome } from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/features/auth';
import Logo from '@/components/common/Logo';
import EditorialPageShell from '@/components/layout/EditorialPageShell';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { LoginPayload, AuthUser } from '@/types';

const cloudinaryImg = (path: string) =>
  `https://res.cloudinary.com/dfjecxrnl/image/upload/f_auto,q_auto:best/${path}`;
const IMG_AUTH_PANEL = cloudinaryImg('v1775892150/99e2e916-6c84-475a-b4e9-418ff62302d1.png');

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('auth.loginEmailRequired'))
      .email(t('auth.loginEmailInvalid')),
    password: z.string().min(1, t('auth.loginPasswordRequired')),
    remember: z.boolean().optional(),
  });

const LoginPage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const didRedirectRef = useRef(false);

  useDocumentTitle('pages.login.documentTitle');

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  type LoginForm = z.infer<typeof loginSchema>;

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
    retry: 0,
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

      if (error instanceof Error && error.message === 'ROLE_NOT_ALLOWED') {
        messageApi.error(t('auth.roleNotAllowed'));
        return;
      }
      if (error instanceof Error && error.message === 'INVALID_LOGIN_RESPONSE') {
        messageApi.error(invalidResponseMessage);
        return;
      }

      const directErrorMessage = error instanceof Error ? error.message : '';
      const respData = (error as any)?.response?.data;
      const responseMessage =
        typeof respData === 'string'
          ? respData
          : typeof respData?.message === 'string'
            ? respData.message
            : typeof respData?.error === 'string'
              ? respData.error
              : '';

      const errorMessage = String(responseMessage || directErrorMessage || fallbackMessage).trim();

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
    navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <EditorialPageShell innerClassName="min-h-[calc(100vh-6rem)]">
      <div className="grid min-h-[inherit] grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-16 xl:px-24"
        >
          <div className="contact-form-card mx-auto w-full max-w-md rounded-md p-8 sm:p-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Logo size={40} showText={false} className="rounded-full ring-1 ring-[color:color-mix(in_srgb,var(--hl-outline-variant)_40%,transparent)]" />
              <span className="hl-sans text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--hl-secondary)]">
                {t('common.brandName')}
              </span>
            </div>

            <p className="hl-sans text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)] mb-3">
              {t('auth.loginTitle')}
            </p>
            <h1
              className="text-[color:var(--hl-primary)] text-3xl sm:text-4xl font-medium leading-tight tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('auth.loginTitle')}
            </h1>
            <p className="hl-sans text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)] leading-relaxed mb-8">
              {t('auth.loginSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="hl-field-label" htmlFor="login-email">
                  {t('auth.emailLabel')}
                </label>
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  className={`hl-input-underline ${errors.email ? 'border-b-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="hl-sans mt-2 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="hl-field-label" htmlFor="login-password">
                  {t('auth.passwordLabel')}
                </label>
                <input
                  {...register('password')}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`hl-input-underline ${errors.password ? 'border-b-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="hl-sans mt-2 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="hl-sans flex cursor-pointer items-center gap-2 text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_75%,transparent)]">
                  <input {...register('remember')} type="checkbox" className="h-4 w-4 accent-[color:var(--hl-primary)]" />
                  {t('auth.rememberMe')}
                </label>
                <button type="button" className="hl-sans text-sm font-semibold text-[color:var(--hl-primary)] hover:underline underline-offset-4">
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <button type="submit" disabled={loginMutation.isPending} className="btn-highland-primary w-full disabled:opacity-50">
                {loginMutation.isPending ? t('auth.authenticating') : t('auth.exploreTaste')}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative mb-6 flex items-center justify-center">
                <div className="flex-1 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)]" />
                <span className="hl-sans mx-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hl-secondary)]">
                  {t('auth.loginSocialDivider')}
                </span>
                <div className="flex-1 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Facebook size={20} />, titleKey: 'auth.loginSocialFacebook' },
                  { icon: <Chrome size={20} />, titleKey: 'auth.loginSocialGoogle' },
                  { icon: <Instagram size={20} />, titleKey: 'auth.loginSocialInstagram' },
                ].map((social, i) => (
                  <button key={i} type="button" title={t(social.titleKey)} className="contact-social-btn flex h-14 items-center justify-center">
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            <p className="hl-sans mt-10 text-center text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-[color:var(--hl-primary)] hover:underline underline-offset-4">
                {t('auth.joinNow')}
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-first min-h-[280px] lg:order-none lg:min-h-[min(100vh-6rem,920px)]"
        >
          <div className="absolute inset-0">
            <img
              src={IMG_AUTH_PANEL}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[color:var(--hl-surface)] via-[color:color-mix(in_srgb,var(--hl-surface)_40%,transparent)] to-transparent lg:from-[color:color-mix(in_srgb,var(--hl-surface)_55%,transparent)]"
              aria-hidden
            />
          </div>
          <div className="relative z-[1] hidden h-full flex-col justify-end p-10 lg:flex xl:p-14">
            <div className="about-glass-card max-w-md p-6">
              <Logo size={56} showText={false} className="mb-6 opacity-90" />
              <p
                className="text-2xl font-medium leading-snug text-[color:var(--hl-primary)]"
                style={{ fontFamily: 'var(--font-highland-display)' }}
              >
                {t('auth.loginBannerTitlePrefix')}{' '}
                <span className="text-[color:var(--hl-secondary)]">{t('auth.loginBannerTitleHighlight')}</span>
              </p>
              <p className="hl-sans mt-4 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_75%,transparent)]">
                {t('auth.loginBannerQuote')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </EditorialPageShell>
  );
};

export default LoginPage;

