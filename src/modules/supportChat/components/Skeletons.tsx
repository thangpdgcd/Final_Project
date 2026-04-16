import React from 'react';

export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="p-3 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-3 w-10 bg-white/10 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const ThreadSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-3">
      {Array.from({ length: 10 }).map((_, i) => {
        const mine = i % 3 === 0;
        return (
          <div key={i} className={mine ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={[
                'h-10 w-[70%] max-w-[520px] rounded-2xl bg-white/10 animate-pulse',
                mine ? 'rounded-br-md' : 'rounded-bl-md',
              ].join(' ')}
            />
          </div>
        );
      })}
    </div>
  );
};

