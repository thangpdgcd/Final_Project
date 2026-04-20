import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</span>
      ) : null}
      <input
        id={id}
        className={`h-11 w-full rounded-2xl border bg-white px-3 text-sm outline-none transition-all duration-300 dark:bg-[#1e1e1e] ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/40'
            : 'border-stone-300 focus:border-[var(--color-caramel)] focus:ring-2 focus:ring-amber-100 dark:border-stone-700 dark:focus:ring-amber-900/40'
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
};

export default Input;
