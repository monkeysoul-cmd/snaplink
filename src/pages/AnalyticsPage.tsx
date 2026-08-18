import React, { useEffect, useRef, useState } from "react";
import {
  Globe, Laptop, Smartphone, Monitor, RefreshCw,
  MousePointerClick, Activity
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { AnalyticsDashboardData } from "../types.js";
import { ChartSkeleton } from "../components/Skeletons.js";

/* ─── Animated progress bar that grows on mount ─── */
const AnimatedBar: React.FC<{
  percentage: number;
  gradient: string;
}> = ({ percentage, gradient }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 120);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="analytics-bar-track flex-1">
      <div
        className="analytics-bar-fill"
        style={{ width: `${width}%`, background: gradient }}
      />
    </div>
  );
};

/* ─── SVG Donut Ring chart ─── */
const DonutChart: React.FC<{
  data: { name: string; percentage: number; color: string }[];
  label: string;
  total: number;
}> = ({ data, label, total }) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 200);
  }, []);

  let cumulative = 0;
  const segments = data.map((d) => {
    const dash = (d.percentage / 100) * circumference;
    const offset = circumference - cumulative * circumference / 100;
    cumulative += d.percentage;
    return { ...d, dash, offset };
  });

  return (
    <div className="flex items-center gap-4 justify-center flex-wrap">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(52,211,153,0.08)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${mounted ? seg.dash : 0} ${circumference}`}
              strokeDashoffset={-circumference + seg.offset}
              strokeLinecap="round"
              style={{ transition: `stroke-dasharray 1.2s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.15}s` }}
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-extrabold text-white font-mono">{total}</div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {data.slice(0, 5).map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[80px]">{d.name}</span>
            <span className="text-[11px] font-bold text-zinc-300 font-mono ml-auto">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Color palette for analytics items ─── */
const ITEM_COLORS = [
  { bg: 'linear-gradient(90deg, #10b981, #34d399)', dot: '#34d399', text: 'text-emerald-400' },
  { bg: 'linear-gradient(90deg, #14b8a6, #2dd4bf)', dot: '#2dd4bf', text: 'text-teal-400' },
  { bg: 'linear-gradient(90deg, #06b6d4, #67e8f9)', dot: '#67e8f9', text: 'text-cyan-400' },
  { bg: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', dot: '#a78bfa', text: 'text-violet-400' },
  { bg: 'linear-gradient(90deg, #f59e0b, #fbbf24)', dot: '#fbbf24', text: 'text-amber-400' },
];

export const AnalyticsPage: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await api.analytics.getDashboardData();
      setData(res);
    } catch (error) {
      toast.error("Couldn't load analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-44 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const deviceStats = data?.deviceStats || [];
  const browserStats = data?.browserStats || [];
  const countryStats = data?.countryStats || [];
  const totalClicks = data?.metrics.totalClicks || 0;

  const getDeviceIcon = (name: string) => {
    if (name.toLowerCase() === "mobile") return Smartphone;
    if (name.toLowerCase() === "tablet") return Laptop;
    return Monitor;
  };

  const analyticsCards = [
    {
      id: "devices",
      title: "Devices",
      subtitle: "What devices your audience uses",
      icon: Smartphone,
      stats: deviceStats,
      colorKey: "device" as const,
    },
    {
      id: "browsers",
      title: "Browsers",
      subtitle: "Which browsers are most popular",
      icon: Globe,
      stats: browserStats,
      colorKey: "browser" as const,
    },
    {
      id: "countries",
      title: "Countries",
      subtitle: "Where in the world clicks come from",
      icon: Globe,
      stats: countryStats,
      colorKey: "country" as const,
      wide: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.05]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="analytics-page-title">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            See where your clicks are coming from.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing}
          className="p-2.5 glass-card rounded-xl text-zinc-500 hover:text-emerald-400 transition cursor-pointer disabled:opacity-50 flex items-center justify-center self-start hover:scale-110 active:scale-95"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {totalClicks === 0 ? (
        <div className="premium-card p-12 text-center space-y-5 max-w-lg mx-auto mt-12">
          <div className="empty-state-icon">
            <Activity className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-zinc-200 font-display">No data yet</h3>
            <p className="text-sm text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              Share your shortened links to start seeing device, browser, and country breakdowns here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Total clicks hero number ── */}
          <div className="premium-card p-6 flex items-center gap-6 animate-springUp" style={{ opacity: 0 }}>
            <div className="icon-ring icon-ring-emerald">
              <MousePointerClick className="w-5 h-5 text-emerald-400 relative z-10" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total clicks tracked</div>
              <div className="text-4xl font-extrabold text-white font-mono">{totalClicks.toLocaleString()}</div>
            </div>
            <div className="ml-auto opacity-30">
              <Activity className="w-16 h-16 text-emerald-400" />
            </div>
          </div>

          {/* ── Three analytics cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {analyticsCards.map((card, cardIdx) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`premium-card p-5 sm:p-6 space-y-5 animate-tiltIn stagger-${cardIdx + 1} ${card.wide ? 'md:col-span-2 xl:col-span-1' : ''}`}
                  style={{ opacity: 0 }}
                >
                  {/* Card header */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="icon-ring icon-ring-emerald w-8 h-8 text-sm">
                        <CardIcon className="w-4 h-4 text-emerald-400 relative z-10" />
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-white font-display">
                        {card.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-zinc-500">{card.subtitle}</p>
                  </div>

                  {/* Stats list */}
                  {card.stats.length === 0 ? (
                    <div className="text-center py-4 text-xs text-zinc-600">No data available</div>
                  ) : (
                    <div className="space-y-4">
                      {card.stats.map((stat, statIdx) => {
                        const color = ITEM_COLORS[statIdx % ITEM_COLORS.length];
                        const ItemIcon = card.id === "devices" ? getDeviceIcon(stat.name) : Globe;
                        return (
                          <div key={stat.name} className="space-y-1.5 group">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {/* Color dot */}
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ background: color.dot, boxShadow: `0 0 6px ${color.dot}80` }}
                                />
                                {card.id !== "browsers" && (
                                  <ItemIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                )}
                                <span className="text-xs sm:text-sm font-semibold text-zinc-300 truncate">
                                  {stat.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-sm font-bold font-mono ${color.text}`}>
                                  {stat.percentage}%
                                </span>
                                <span className="text-[10px] text-zinc-600 font-medium">
                                  ({stat.count.toLocaleString()})
                                </span>
                              </div>
                            </div>
                            <AnimatedBar percentage={stat.percentage} gradient={color.bg} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Donut mini chart — only for devices */}
                  {card.id === "devices" && card.stats.length > 0 && (
                    <>
                      <div className="section-divider" />
                      <DonutChart
                        data={card.stats.map((s, i) => ({
                          name: s.name,
                          percentage: s.percentage,
                          color: ITEM_COLORS[i % ITEM_COLORS.length].dot,
                        }))}
                        label="clicks"
                        total={totalClicks}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
