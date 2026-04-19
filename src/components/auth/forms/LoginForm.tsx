import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/store/AuthContext';
import { authService } from '@/features/auth';
import type { LoginPayload } from '@/types';

import type { AuthView } from '../AuthModal';

const buildLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('auth.loginEmailRequired'))
      .email(t('auth.loginEmailInvalid')),
    password: z.string().min(1, t('auth.loginPasswordRequired')),
    remember: z.boolean().optional(),
  });

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

type LoginFormProps = {
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
};

const LoginForm: React.FC<LoginFormProps> = ({ setView }) => {
  const { message: messageApi } = App.useApp();
  const { t } = useTranslation();
  const { login } = useAuth();
  const loginSchema = buildLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    retry: 0,
    onSuccess: (data) => {
      if (!data?.accessToken || !data?.user) {
        messageApi.error(t('auth.loginError'));
        return;
      }

      login(data.accessToken, data.user);
      messageApi.success(t('auth.loginSuccess'));
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === 'ROLE_NOT_ALLOWED') {
        messageApi.error(t('auth.roleNotAllowed'));
        return;
      }
      messageApi.error(t('auth.loginError'));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-5"
      >
        <div className="space-y-4">
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors"
              size={18}
            />
            <input
              {...register('email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${
                errors.email ? 'border-red-500/50' : 'border-transparent'
              } focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors"
              size={18}
            />
            <input
              {...register('password')}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${
                errors.password ? 'border-red-500/50' : 'border-transparent'
              } focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              {...register('remember')}
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#4B3621] focus:ring-[#4B3621]"
            />
            <span className="text-[12px] font-bold text-gray-400 group-hover:text-[#4B3621] transition-colors">
              {t('auth.rememberMe')}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setView('forgot')}
            className="text-[12px] font-bold text-[#4B3621] hover:underline decoration-2"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-4 rounded-2xl bg-[#4B3621] text-white font-black tracking-[0.2em] text-sm shadow-xl shadow-[#4B3621]/20 disabled:opacity-50 transition-all uppercase"
        >
          {loginMutation.isPending ? t('auth.authenticating') : t('auth.exploreTaste')}
        </button>

        <div className="pt-2 text-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-tight">
            {t('auth.loginNoAccount')}{' '}
            <button
              type="button"
              onClick={() => setView('register')}
              className="text-[#4B3621] dark:text-[#FFD700] hover:underline font-black transition-colors"
            >
              {t('auth.loginRegister')}
            </button>
          </p>
        </div>
      </motion.form>
    </>
  );
};

export default LoginForm;

