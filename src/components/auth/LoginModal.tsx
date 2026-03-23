import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Facebook,
  Instagram,
  Chrome
} from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import Modal from '@/components/common/Modal';
import Logo from '@/components/common/Logo';
import type { LoginPayload, AuthUser } from '@/types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

/**
 * LoginModal: A premium authentication modal using Phan Coffee brand styles
 */
const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onRegisterClick }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

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
      if (!data.token || !data.user) {
        messageApi.error(t('auth.loginError'));
        return;
      }
      const user = data.user as AuthUser;
      login(data.token, user);
      messageApi.success(t('auth.loginSuccess'));
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: () => {
      messageApi.error(t('auth.loginError'));
    },
  });

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      maxWidth="max-w-md"
      showCloseButton={true}
    >
      {contextHolder}
      <div className="flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Logo size={48} showText={false} className="bg-[#4B3621] rounded-full p-2 text-[#FFD700]" />
          <h2 className="text-3xl font-black text-[#4B3621] dark:text-amber-100 tracking-tight uppercase">
            {t('auth.loginSubmit')}
          </h2>
          <p className="text-gray-500 font-bold text-sm text-center">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors" size={18} />
              <input
                {...register('email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${errors.email ? 'border-red-500/50' : 'border-transparent'} focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              />
              {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4B3621] transition-colors" size={18} />
              <input
                {...register('password')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className={`w-full bg-gray-50 dark:bg-[#2a2423] border-2 ${errors.password ? 'border-red-500/50' : 'border-transparent'} focus:border-[#4B3621]/20 dark:focus:border-[#FFD700]/20 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-400`}
              />
              {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input {...register('remember')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#4B3621] focus:ring-[#4B3621]" />
              <span className="text-[12px] font-bold text-gray-400 group-hover:text-[#4B3621] transition-colors">{t('auth.rememberMe')}</span>
            </label>
            <button type="button" className="text-[12px] font-bold text-[#4B3621] hover:underline decoration-2">{t('auth.forgotPassword')}</button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loginMutation.isPending}
            className="w-full py-4 rounded-2xl bg-[#4B3621] text-white font-black tracking-[0.2em] text-sm shadow-xl shadow-[#4B3621]/20 disabled:opacity-50 transition-all uppercase"
          >
            {loginMutation.isPending ? t('auth.authenticating') : t('auth.exploreTaste')}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="w-full relative flex items-center justify-center my-8">
          <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
          <span className="mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Quick Access</span>
          <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { icon: <Facebook />, color: "hover:text-[#1877F2]", label: "FB" },
            { icon: <Chrome />, color: "hover:text-amber-600", label: "GL" },
            { icon: <Instagram />, color: "hover:text-pink-500", label: "IG" }
          ].map((social, i) => (
            <button
              key={i}
              title={t('auth.loginSocialInfo', { provider: social.label })}
              className={`h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#2a2423] text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all ${social.color}`}
            >
              {React.cloneElement(social.icon as React.ReactElement, { size: 18 })}
            </button>
          ))}
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-400 font-bold text-xs uppercase tracking-tight">
          {t('auth.noAccount')} {' '}
          <button 
            onClick={onRegisterClick}
            className="text-[#4B3621] dark:text-[#FFD700] hover:underline font-black transition-colors"
          >
            {t('auth.joinNow')}
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;
