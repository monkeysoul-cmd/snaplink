import React from "react";

export const MetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-4 sm:p-5 glass-card rounded-2xl flex flex-col gap-3 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded" />
            <div className="h-6 w-12 bg-black/10 dark:bg-white/[0.08] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 glass-card rounded-2xl animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-black/5 dark:bg-white/5 rounded" />
          <div className="h-3 w-48 bg-black/[0.03] dark:bg-white/[0.03] rounded" />
        </div>
        <div className="h-8 w-24 bg-black/5 dark:bg-white/5 rounded-xl" />
      </div>
      <div className="h-56 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl flex items-end justify-between p-4 gap-2">
        {[20, 45, 10, 80, 50, 65, 30].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="w-full bg-black/5 dark:bg-white/5 rounded-md"
          />
        ))}
      </div>
    </div>
  );
};

export const UrlListSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 glass-card rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 bg-black/10 dark:bg-white/[0.08] rounded" />
              <div className="h-4 w-12 bg-black/5 dark:bg-white/5 rounded-full" />
            </div>
            <div className="h-3 w-2/3 bg-black/[0.04] dark:bg-white/[0.03] rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-black/[0.04] dark:bg-white/[0.03] rounded-md" />
              <div className="h-5 w-14 bg-black/[0.04] dark:bg-white/[0.03] rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:self-center">
            <div className="h-9 w-24 bg-black/5 dark:bg-white/5 rounded-xl" />
            <div className="h-9 w-9 bg-black/5 dark:bg-white/5 rounded-xl" />
            <div className="h-9 w-9 bg-black/5 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
