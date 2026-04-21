import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

import { authService } from '@/services/auth/auth.service';
import type { RegisterPayload } from '@/types/index';

import type { AuthView } from '../AuthModal';

const buildRegisterSchema = (t: (key: string) => string) =>
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

type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;

type RegisterFormProps = {
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ setView }) => {
  const { message: messageApi } = App.useApp();
  const { t } = useTranslation();
  const registerSchema = buildRegisterSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      messageApi.success(t('auth.registerSuccess'));
      setView('login');
    },
    onError: () => {
      messageApi.error(t('auth.registerError'));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      roleID: '1',
    });
  };

  return (
    <>
      <motion.form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        <div className="space-y-4">
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors"
              size={18}
            />
            <input
              {...register('name')}
              type="text"
              placeholder={t('auth.registerFullNameLabel')}
              className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${
                errors.name ? 'border-red-500/50' : 'border-transparent'
              } focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">
                {errors.name.message}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors"
              size={18}
            />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder={t('auth.registerConfirmPasswordLabel')}
              className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${
                errors.confirmPassword ? 'border-red-500/50' : 'border-transparent'
              } focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-4 rounded-2xl bg-[#4B3621] text-white font-black tracking-[0.2em] text-sm shadow-xl shadow-[#4B3621]/20 disabled:opacity-50 transition-all uppercase"
        >
          {registerMutation.isPending ? t('auth.registerProcessing') : t('auth.registerSubmit')}
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-gray-400 font-bold text-xs uppercase tracking-tight hover:text-[#4B3621] transition-colors"
          >
            {t('auth.registerAlreadyHaveAccount')}
          </button>
        </div>
      </motion.form>
    </>
  );
};

export default RegisterForm;
