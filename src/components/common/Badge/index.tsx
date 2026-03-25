import React from 'react';

type BadgeVariant = 'bestSeller' | 'new' | 'pending' | 'completed';

const variantMap: Record<BadgeVariant, string> = {
  bestSeller: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  completed: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
};

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const Badge: React.FC<BadgeProps> = ({ label, variant = 'new', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${variantMap[variant]} ${className}`}
  >
    {label}
  </span>
);

export default Badge;
