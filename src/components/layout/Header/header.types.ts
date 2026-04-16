import type React from 'react';

export type IconButtonProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  className?: string;
  active?: boolean;
  cartTarget?: boolean;
  bounceBadge?: boolean;
};

