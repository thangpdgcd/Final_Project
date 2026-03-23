import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/auth.service';
import type { RegisterPayload } from '@/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên ít nhất 2 ký tự'),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      message.success('✅ Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    },
    onError: () => {
      message.error('❌ Đăng ký thất bại. Email đã được sử dụng?');
    },
  });

  const onSubmit = (values: RegisterForm) => {
    mutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      address: values.address,
      phoneNumber: values.phoneNumber,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #f5ead0 100%)' }}>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308731/199bea82-b758-411d-863a-1b7be6ecc8b4.png"
            alt="Phan Coffee"
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="text-xs font-semibold tracking-widest text-amber-600 uppercase">Tạo tài khoản</div>
            <div className="text-xl font-bold text-[#4e3524]" style={{ fontFamily: 'var(--font-display)' }}>Phan Coffee</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A', type: 'text', required: true },
            { name: 'email', label: 'Email', placeholder: 'your@email.com', type: 'text', required: true },
            { name: 'phoneNumber', label: 'Số điện thoại', placeholder: '0901234567', type: 'text', required: false },
            { name: 'address', label: 'Địa chỉ', placeholder: '123 Đường ABC, TP. HCM', type: 'text', required: false },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                size="large"
                placeholder={field.placeholder}
                status={errors[field.name as keyof RegisterForm] ? 'error' : ''}
                {...register(field.name as keyof RegisterForm)}
              />
              {errors[field.name as keyof RegisterForm] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name as keyof RegisterForm]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <Input.Password size="large" placeholder="••••••••" status={errors.password ? 'error' : ''} {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <Input.Password size="large" placeholder="••••••••" status={errors.confirmPassword ? 'error' : ''} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            loading={mutation.isPending}
            style={{ background: '#6f4e37', borderColor: '#6f4e37' }}
          >
            Đăng ký
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#6f4e37] font-semibold hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
