import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-coffee-brown)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--color-dark-brown)]',
  ghost:
    'border border-[var(--color-coffee-brown)] text-[var(--color-coffee-brown)] hover:bg-[var(--color-coffee-brown)] hover:text-white',
  icon: 'h-10 w-10 rounded-full border border-[var(--color-coffee-brown)] text-[var(--color-coffee-brown)] hover:bg-[var(--color-coffee-brown)] hover:text-white',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...rest
}) => {
  return (
    <button
      type={rest.type ?? 'button'}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${variantMap[variant]} ${variant !== 'icon' ? sizeMap[size] : ''} ${className}`}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
