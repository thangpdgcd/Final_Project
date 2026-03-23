import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';

import type { AuthView } from '../AuthModal';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordFormProps = {
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  setView,
}) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitting(true);
    try {
      // No backend endpoint is wired for password reset yet.
      // We keep this UX-safe: validate email then show a success message.
      messageApi.info(
        'If an account exists for this email, you will receive a reset link shortly.',
      );
      setTimeout(() => setView('login'), 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-5"
      >
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-[#4B3621] text-white font-black tracking-[0.2em] text-sm shadow-xl shadow-[#4B3621]/20 disabled:opacity-50 transition-all uppercase"
        >
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-[12px] font-bold text-[#4B3621] hover:underline decoration-2"
          >
            Back to login
          </button>
        </div>
      </motion.form>
    </>
  );
};

export default ForgotPasswordForm;

