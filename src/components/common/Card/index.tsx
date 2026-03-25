import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card: React.FC<CardProps> = ({ className = '', children, ...rest }) => (
  <div
    className={`rounded-2xl border border-stone-200/70 bg-white/95 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 dark:border-stone-800 dark:bg-[#1e1e1e] ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
