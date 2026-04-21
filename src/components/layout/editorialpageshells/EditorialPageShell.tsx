import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

const EditorialPageShell: React.FC<Props> = ({ children, className = '', innerClassName = '' }) => {
  return (
    <div className={['min-h-screen bg-[color:var(--hl-surface)]', className].filter(Boolean).join(' ')}>
      <div className={['mx-auto w-full', innerClassName].filter(Boolean).join(' ')}>{children}</div>
    </div>
  );
};

export default EditorialPageShell;

