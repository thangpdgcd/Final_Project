import React from 'react';
import { motion } from 'framer-motion';

export type IconButtonProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number | string;
  className?: string;
  active?: boolean;
  bounceBadge?: boolean;
  cartTarget?: boolean;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      onClick,
      badge,
      className = '',
      active = false,
      bounceBadge = false,
      cartTarget = false,
      type = 'button',
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const base =
      'relative flex items-center justify-center w-10 h-10 rounded-full border-[2.5px] transition-all duration-300 group ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ' +
      'focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900';

    const stateClass = active
      ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900'
      : 'border-transparent bg-transparent text-stone-700 dark:text-stone-300 ' +
        'hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-orange-600 dark:hover:text-orange-400';

    const buttonClass = [base, stateClass, className].filter(Boolean).join(' ');

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        data-cart-target={cartTarget ? 'header' : undefined}
        className={buttonClass}
        aria-label={ariaLabel}
      >
        {badge !== undefined && badge !== null && badge !== '' && (
          <motion.span
            animate={bounceBadge ? { scale: [1, 1.26, 1] } : undefined}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-bold text-[var(--coffee-brown)] border-2 border-white dark:border-[#1c1716]"
          >
            {badge}
          </motion.span>
        )}
        {icon}
      </motion.button>
    );
  },
);

IconButton.displayName = 'IconButton';

