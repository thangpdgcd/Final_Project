import React from 'react';

type SkeletonProps = {
  className?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-700 ${className}`} />
);

export default Skeleton;
