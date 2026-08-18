import React from "react";

/* ─── Premium Metrics Skeleton ─── */
export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="stat-tile p-5 flex flex-col gap-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-[0.875rem] bg-white/[0.06]" />
          <div className="flex items-end gap-0.5 h-6">
            {[3,5,4,7,6,8,10].map((h,j) => (
              <div key={j} className="w-1 rounded-sm bg-white/[0.06]" style={{ height: `${(h/10)*100}%` }} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-16 bg-white/[0.05] rounded-full" />
          <div className="h-7 w-12 bg-white/[0.08] rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Premium Chart Skeleton ─── */
export const ChartSkeleton: React.FC = () => (
  <div className="premium-card p-5 sm:p-7 flex flex-col gap-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/[0.06]" />
          <div className="h-4 w-36 bg-white/[0.06] rounded-full" />
        </div>
        <div className="h-3 w-52 bg-white/[0.04] rounded-full" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.04]">
        <div className="w-2 h-2 rounded-full bg-white/[0.1]" />
        <div className="h-2.5 w-6 bg-white/[0.06] rounded-full" />
      </div>
    </div>

    {/* Chart area */}
    <div className="flex gap-3">
      {/* Y-axis */}
      <div className="flex flex-col justify-between h-52 text-right shrink-0 pb-5">
        {[5,4,3,2,1,0].map((_, i) => (
          <div key={i} className="h-2.5 w-6 bg-white/[0.04] rounded" />
        ))}
      </div>
      {/* Grid + bars */}
      <div className="flex-1 chart-container p-4 h-52">
        <div className="h-full flex items-end justify-between gap-2">
          {[20, 55, 35, 80, 50, 65, 30].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="w-full rounded-t-lg bg-white/[0.06] max-w-[36px]"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Premium URL List Skeleton ─── */
export const UrlListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 w-full animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="url-card pl-5 pr-5 pt-5 pb-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 bg-white/[0.08] rounded-lg" />
              <div className="h-4 w-14 bg-white/[0.05] rounded-full" />
            </div>
            <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/[0.05] rounded-xl" />
            <div className="w-14 h-10 bg-white/[0.04] rounded-xl" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
          <div className="h-2.5 w-20 bg-white/[0.04] rounded" />
          <div className="flex gap-1.5">
            {[1,2,3,4].map((j) => (
              <div key={j} className="w-8 h-7 bg-white/[0.05] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);
