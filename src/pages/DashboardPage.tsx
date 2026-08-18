import React, { useEffect, useState } from "react";
import {
  PlusCircle, RefreshCw, ArrowUpRight, TrendingUp, Link2, MousePointerClick, Zap, Star
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { AnalyticsDashboardData } from "../types.js";
import { MetricsSkeleton, ChartSkeleton } from "../components/Skeletons.js";
import { getDisplayShortUrl, getWorkingShortUrl } from "../utils/urlHelper.js";

export const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await api.analytics.getDashboardData();
      setData(res);
    } catch (err: any) {
      toast.error("Couldn't load your dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleNavigate = (path: string) => { window.location.hash = path; };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-44 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <MetricsSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const metrics = data?.metrics || { totalUrls: 0, totalClicks: 0, activeUrls: 0, favoriteUrls: 0 };
  const mostVisited = data?.mostVisited || [];
  const recentUrls = data?.recentUrls || [];
  const dailyClicks = data?.dailyClicks || [];
  const maxClicks = Math.max(...dailyClicks.map((d) => d.clicks), 1);

  const statCards = [
    {
      icon: Link2,
      label: "Total Links",
      value: metrics.totalUrls,
      tileClass: "stat-tile-emerald",
      iconRingClass: "icon-ring-emerald",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-300",
    },
    {
      icon: MousePointerClick,
      label: "Total Clicks",
      value: metrics.totalClicks,
      tileClass: "stat-tile-teal",
      iconRingClass: "icon-ring-teal",
      iconColor: "text-teal-400",
      valueColor: "text-teal-300",
    },
    {
      icon: Zap,
      label: "Active Links",
      value: metrics.activeUrls,
      tileClass: "stat-tile-cyan",
      iconRingClass: "icon-ring-cyan",
      iconColor: "text-cyan-400",
      valueColor: "text-cyan-300",
    },
    {
      icon: Star,
      label: "Favorites",
      value: metrics.favoriteUrls,
      tileClass: "stat-tile-green",
      iconRingClass: "icon-ring-green",
      iconColor: "text-green-400",
      valueColor: "text-green-300",
    },
  ];

  // Build chart Y-axis labels
  const yAxisSteps = 5;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxClicks / yAxisSteps) * (yAxisSteps - i))
  );

  return (
    <div className="space-y-6 animate-pageEnter p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] relative">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/3 left-1/6 w-96 h-96 bg-teal-500/4 rounded-full blur-[140px] animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="dashboard-title">
            Your Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Here's how your links are performing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-2.5 glass-card rounded-xl text-zinc-500 hover:text-emerald-400 transition cursor-pointer disabled:opacity-50 hover:scale-110 active:scale-95"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          <button
            onClick={() => handleNavigate("#/create")}
            className="px-4 py-2.5 btn-glow text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center gap-2"
            id="dash-create-btn"
          >
            <PlusCircle className="w-4 h-4" />
            New Link
          </button>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`stat-tile ${card.tileClass} p-5 flex flex-col gap-4 animate-springUp stagger-${i + 1} group cursor-default`}
              style={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className={`icon-ring ${card.iconRingClass}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor} relative z-10`} />
                </div>
                {/* Mini sparkline placeholder */}
                <div className="flex items-end gap-0.5 h-6 opacity-40 group-hover:opacity-70 transition-opacity">
                  {[3, 5, 4, 7, 6, 8, card.value > 0 ? 10 : 2].map((h, j) => (
                    <div
                      key={j}
                      className={`w-1 rounded-sm ${card.iconColor.replace('text-', 'bg-')}`}
                      style={{ height: `${(h / 10) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  {card.label}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${card.valueColor} font-display animate-rollUp`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {card.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bar Chart ── */}
      <div className="premium-card p-5 sm:p-7 animate-fadeInUp" style={{ animationDelay: "0.2s", opacity: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Clicks this week
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Daily click activity over the last 7 days
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {dailyClicks.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-sm text-zinc-600 border border-dashed border-white/[0.05] rounded-xl gap-2">
            <TrendingUp className="w-6 h-6 text-zinc-700" />
            No clicks yet. Share some links to see data here!
          </div>
        ) : (
          <div className="w-full">
            {/* Chart with Y-axis */}
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-56 text-right shrink-0 pb-5">
                {yLabels.map((v, i) => (
                  <span key={i} className="chart-y-label">{v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}</span>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 chart-container p-4">
                <div className="h-full flex flex-col justify-between">
                  {/* Grid lines */}
                  {yLabels.slice(0, -1).map((_, i) => (
                    <div key={i} className="chart-grid-line w-full" style={{ flex: 1 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Bars overlay — absolute positioned over chart */}
            <div className="relative -mt-60 ml-12 mr-0">
              <div className="h-52 flex items-end justify-between gap-1.5 sm:gap-3 px-4">
                {dailyClicks.map((d, barIdx) => {
                  const heightPercentage = Math.max((d.clicks / maxClicks) * 100, 3);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="relative w-full flex items-end justify-center h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1 bg-zinc-900 border border-emerald-500/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-20 text-center min-w-[52px] flex flex-col gap-0.5">
                          <span className="text-emerald-400 font-mono text-sm">{d.clicks}</span>
                          <span className="text-zinc-500">clicks</span>
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-emerald-500/20 rotate-45" />
                        </div>

                        {/* Bar */}
                        <div
                          style={{
                            height: `${heightPercentage}%`,
                            background: 'linear-gradient(180deg, #34d399 0%, #10b981 40%, #059669 100%)',
                            animationDelay: `${barIdx * 80}ms`,
                            boxShadow: '0 0 12px rgba(16,185,129,0.15)',
                          }}
                          className="w-full max-w-[36px] rounded-t-lg transition-all duration-300 relative overflow-hidden cursor-pointer animate-bar-grow group-hover:max-w-[40px]"
                        >
                          {/* Inner shimmer */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {/* Glow cap */}
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal-300/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium truncate max-w-full group-hover:text-zinc-400 transition-colors font-mono">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="premium-card p-5 sm:p-6 space-y-5 animate-fadeInUp" style={{ animationDelay: "0.3s", opacity: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
              <span className="text-base">🏆</span> Top performers
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition cursor-pointer hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mostVisited.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="empty-state-icon">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-500">No links to rank yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mostVisited.map((u, rowIdx) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.03] hover:border-emerald-500/15 transition-all group"
                >
                  {/* Rank badge */}
                  <div
                    className="rank-number shrink-0"
                    style={{
                      background: rowIdx === 0
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : rowIdx === 1
                        ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                        : rowIdx === 2
                        ? 'linear-gradient(135deg, #cd7c2f, #a16207)'
                        : 'rgba(255,255,255,0.06)',
                      color: rowIdx < 3 ? '#fff' : '#71717a',
                    }}
                  >
                    {rowIdx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={getWorkingShortUrl(u.shortCode)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors short-link-mono block truncate"
                    >
                      {getDisplayShortUrl(u.shortCode)}
                    </a>
                    <span className="block text-[10px] text-zinc-600 font-medium truncate">{u.originalUrl}</span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors font-mono">
                      {u.clicks.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-wider">clicks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Links */}
        <div className="premium-card p-5 sm:p-6 space-y-5 animate-fadeInUp" style={{ animationDelay: "0.38s", opacity: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
              <span className="text-base">🕐</span> Recent links
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition cursor-pointer hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUrls.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="empty-state-icon">
                <Link2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-500">Nothing here yet. Go shorten a link!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUrls.map((u, rowIdx) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.03] hover:border-emerald-500/15 transition-all group"
                  style={{ animationDelay: `${rowIdx * 40}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="timeline-dot shrink-0" />

                  <div className="flex-1 min-w-0">
                    <a
                      href={getWorkingShortUrl(u.shortCode)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors short-link-mono block truncate"
                    >
                      {getDisplayShortUrl(u.shortCode)}
                    </a>
                    <span className="block text-[10px] text-zinc-600 font-medium truncate">{u.originalUrl}</span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[10px] text-zinc-500 whitespace-nowrap group-hover:text-zinc-400 transition-colors font-mono">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="text-[9px] text-zinc-600">{u.clicks} clicks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
