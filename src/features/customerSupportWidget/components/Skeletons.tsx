import React from 'react';

export const WidgetThreadSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto px-4 py-4 space-y-3 bg-slate-950">
      {Array.from({ length: 8 }).map((_, i) => {
        const mine = i % 3 === 0;
        return (
          <div key={i} className={mine ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={[
                'h-9 w-[70%] max-w-[240px] rounded-3xl bg-slate-800 animate-pulse',
                mine ? 'rounded-br-lg' : 'rounded-bl-lg',
              ].join(' ')}
            />
          </div>
        );
      })}
    </div>
  );
};

