import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'bestSeller' | 'new';
}

const Badge: React.FC<BadgeProps> = React.memo(({ label, variant = 'bestSeller' }) => {
  const palette =
    variant === 'new'
      ? 'bg-emerald-100/95 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
      : 'bg-orange-100/95 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm ${palette}`}
    >
      {label}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
