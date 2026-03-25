import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Coffee,
  Leaf,
  Mountain,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { authService } from '@/features/auth/services/auth.service';
import Logo from '@/components/common/Logo';
import type { RegisterPayload } from '@/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên ít nhất 2 ký tự'),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      messageApi.success(t("auth.registerSuccess"));
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || t("auth.registerError");
      messageApi.error(errorMessage);
    },
  });

  const onSubmit = (values: RegisterForm) => {
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      roleID: '1', // Default user role
    });
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FDF5E6]">
        {/* Left (Form) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-center px-6 md:px-20 lg:px-32 bg-[#1c1716] text-white py-12 lg:py-0"
        >
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-3 mb-12 lg:hidden">
              <Logo size={40} showText={false} className="bg-white rounded-full p-1" />
              <span className="text-xl font-black tracking-widest uppercase text-white">{t("common.brandName")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{t("auth.registerJoinUs")}</h1>
            <p className="text-gray-400 font-medium mb-12 text-lg">{t("auth.registerSubtitle")}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                  <input
                    {...register('name')}
                    placeholder={t("auth.registerFullNameLabel")}
                    className={`w-full bg-[#2a2423] border-2 ${errors.name ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600 focus:bg-[#332b2a]`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={t("auth.registerEmailLabel")}
                    className={`w-full bg-[#2a2423] border-2 ${errors.email ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600 focus:bg-[#332b2a]`}
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder={t("auth.registerPasswordLabel")}
                    className={`w-full bg-[#2a2423] border-2 ${errors.password ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600 focus:bg-[#332b2a]`}
                  />
                  {errors.password && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder={t("auth.registerConfirmPasswordLabel")}
                    className={`w-full bg-[#2a2423] border-2 ${errors.confirmPassword ? 'border-red-500/50' : 'border-transparent'} focus:border-[#FFD700]/30 py-4 pl-12 pr-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-600 focus:bg-[#332b2a]`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#FFD700", color: "#4B3621" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={registerMutation.isPending}
                  className="w-full py-5 rounded-2xl bg-[#FFD700]/90 text-[#4B3621] font-black tracking-[0.2em] text-sm shadow-2xl shadow-[#FFD700]/10 disabled:opacity-50 transition-all uppercase flex items-center justify-center gap-2 group"
                >
                  {registerMutation.isPending ? t("auth.registerProcessing") : t("auth.registerSubmit")}
                  {!registerMutation.isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </div>
            </form>

            <div className="mt-12 pt-12 border-t border-gray-800 flex items-center justify-between">
              <p className="text-gray-500 font-bold text-sm">
                    {t("auth.registerAlreadyHaveAccount")}{" "}
                    <Link
                      to="/login"
                      className="text-white hover:text-[#FFD700] transition-colors underline decoration-2 underline-offset-4 decoration-[#FFD700]/30 font-black"
                    >
                      {t("auth.registerGotoLogin")}
                    </Link>
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                <ShieldCheck size={14} className="text-emerald-500" />
                    {t("auth.registerSecureData")}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right (Banner) */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#4B3621]"
        >
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

            <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
              {t("auth.registerBannerTitlePrefix")}{" "}
              <br />
              <span className="text-[#FFD700]">{t("auth.registerBannerTitleHighlight")}</span>
            </h2>
            <p className="text-amber-100/60 max-w-sm mx-auto font-bold text-lg mb-16 leading-relaxed">
              {t("auth.registerBannerQuote")}
            </p>

            <div className="grid grid-cols-3 gap-12">
              {[
                { icon: <Coffee />, labelKey: "auth.registerFeaturePremium" },
                { icon: <Leaf />, labelKey: "auth.registerFeatureFresh" },
                { icon: <Mountain />, labelKey: "auth.registerFeatureAuthentic" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#4B3621] transition-all duration-300 shadow-xl">
                    {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">
                    {t(feature.labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
