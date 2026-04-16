import React, { useMemo } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { authService } from '@/features/auth';
import Logo from '@/components/common/Logo';
import EditorialPageShell from '@/components/layout/EditorialPageShell';
import type { RegisterPayload } from '@/types';

const cloudinaryImg = (path: string) =>
  `https://res.cloudinary.com/dfjecxrnl/image/upload/f_auto,q_auto:best/${path}`;
const IMG_REGISTER_PANEL = cloudinaryImg('v1775892015/0275d0e9-3a86-4b5b-bf3e-bdcf1440aae2.png');

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, t('auth.registerFullNameRequired')),
      email: z
        .string()
        .min(1, t('auth.registerEmailRequired'))
        .email(t('auth.registerEmailInvalid')),
      password: z.string().min(6, t('auth.registerPasswordRequired')),
      confirmPassword: z.string().min(1, t('auth.registerConfirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.registerConfirmPasswordNotMatch'),
      path: ['confirmPassword'],
    });

const RegisterPage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useDocumentTitle('pages.register.documentTitle');

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  type RegisterForm = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      messageApi.success(t('auth.registerSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || t('auth.registerError');
      messageApi.error(errorMessage);
    },
  });

  const onSubmit = (values: RegisterForm) => {
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      roleID: '1',
    });
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
              {t('auth.registerJoinUs')}
            </p>
            <h1
              className="text-[color:var(--hl-primary)] text-3xl sm:text-4xl font-medium leading-tight tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-highland-display)' }}
            >
              {t('auth.registerJoinUs')}
            </h1>
            <p className="hl-sans text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_72%,transparent)] leading-relaxed mb-8">
              {t('auth.registerSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="hl-field-label" htmlFor="reg-name">
                  {t('auth.registerFullNameLabel')}
                </label>
                <input
                  {...register('name')}
                  id="reg-name"
                  autoComplete="name"
                  placeholder={t('auth.registerFullNamePlaceholder')}
                  className={`hl-input-underline ${errors.name ? 'border-b-red-500' : ''}`}
                />
                {errors.name && <p className="hl-sans mt-2 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="hl-field-label" htmlFor="reg-email">
                  {t('auth.registerEmailLabel')}
                </label>
                <input
                  {...register('email')}
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.loginEmailPlaceholder')}
                  className={`hl-input-underline ${errors.email ? 'border-b-red-500' : ''}`}
                />
                {errors.email && <p className="hl-sans mt-2 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="hl-field-label" htmlFor="reg-password">
                  {t('auth.registerPasswordLabel')}
                </label>
                <input
                  {...register('password')}
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('auth.loginPasswordPlaceholder')}
                  className={`hl-input-underline ${errors.password ? 'border-b-red-500' : ''}`}
                />
                {errors.password && <p className="hl-sans mt-2 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="hl-field-label" htmlFor="reg-confirm">
                  {t('auth.registerConfirmPasswordLabel')}
                </label>
                <input
                  {...register('confirmPassword')}
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('auth.loginPasswordPlaceholder')}
                  className={`hl-input-underline ${errors.confirmPassword ? 'border-b-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="hl-sans mt-2 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn-highland-primary mt-2 flex w-full items-center justify-center gap-2 disabled:opacity-50"
              >
                {registerMutation.isPending ? t('auth.registerProcessing') : t('auth.registerSubmit')}
                {!registerMutation.isPending && <ArrowRight size={18} aria-hidden />}
              </button>
            </form>

            <div className="mt-10 flex flex-col gap-4 border-t border-[color:color-mix(in_srgb,var(--hl-outline-variant)_35%,transparent)] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="hl-sans text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
                {t('auth.registerAlreadyHaveAccount')}{' '}
                <Link to="/login" className="font-semibold text-[color:var(--hl-primary)] hover:underline underline-offset-4">
                  {t('auth.registerGotoLogin')}
                </Link>
              </p>
              <div className="hl-sans flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--hl-secondary)]">
                <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
                {t('auth.registerSecureData')}
              </div>
            </div>
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
              src={IMG_REGISTER_PANEL}
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
                {t('auth.registerBannerTitlePrefix')}{' '}
                <span className="text-[color:var(--hl-secondary)]">{t('auth.registerBannerTitleHighlight')}</span>
              </p>
              <p className="hl-sans mt-4 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--hl-on-surface)_75%,transparent)]">
                {t('auth.registerBannerQuote')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </EditorialPageShell>
  );
};

export default RegisterPage;

