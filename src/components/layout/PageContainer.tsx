import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  /**
   * When true, uses a wider max width (good for product grids / dashboards).
   * Default: false (content width).
   */
  wide?: boolean;
};

const PageContainer: React.FC<Props> = ({ children, className = '', wide = false }) => {
  const maxWidth = wide ? 'max-w-[1400px]' : 'max-w-7xl';
  return (
    <div className={[maxWidth, 'mx-auto w-full px-4 sm:px-6 lg:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
};

export default PageContainer;

