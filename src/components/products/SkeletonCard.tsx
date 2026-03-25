import React from 'react';

const SkeletonCard: React.FC = React.memo(() => {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#1e1e1e]">
      <div className="aspect-square w-full animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700" />
      <div className="mt-4 space-y-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-4 w-full animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-orange-100 dark:bg-orange-900/50" />
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
