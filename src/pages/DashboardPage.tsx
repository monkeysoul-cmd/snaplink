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
      toast.error("Couldn't load dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleNavigate = (path: string) => { window.location.hash = path; };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
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
      label: "Total links",
      value: metrics.totalUrls,
    },
    {
      icon: MousePointerClick,
      label: "Total clicks",
      value: metrics.totalClicks,
    },
    {
      icon: Zap,
      label: "Active links",
      value: metrics.activeUrls,
    },
    {
      icon: Star,
      label: "Favorites",
      value: metrics.favoriteUrls,
    },
  ];

  const yAxisSteps = 5;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxClicks / yAxisSteps) * (yAxisSteps - i))
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white" id="dashboard-title">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Overview of your links and visitor activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
          </button>

          <button
            onClick={() => handleNavigate("#/create")}
            className="px-4 py-2.5 btn-glow text-xs sm:text-sm rounded-xl cursor-pointer flex items-center gap-2"
            id="dash-create-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New link</span>
          </button>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card p-5 flex flex-col justify-between cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white font-mono tracking-tight"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {card.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bar Chart ── */}
      <div className="glass-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Clicks this week
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Daily click activity over the last 7 days
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>Live</span>
          </div>
        </div>

        {dailyClicks.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-sm text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl gap-2 font-medium">
            <TrendingUp className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
            No clicks yet. Share some links to inspect traffic.
          </div>
        ) : (
          <div className="w-full">
            {/* Chart with Y-axis */}
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-52 text-right shrink-0 pb-5 text-xs text-zinc-400 font-mono">
                {yLabels.map((v, i) => (
                  <span key={i}>{v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}</span>
                ))}
              </div>

              {/* Bars container */}
              <div className="flex-1 relative h-52 border-b border-zinc-200 dark:border-zinc-800">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yLabels.slice(0, -1).map((_, i) => (
                    <div key={i} className="w-full border-b border-zinc-100 dark:border-zinc-800/60" style={{ flex: 1 }} />
                  ))}
                </div>

                {/* Bars flex */}
                <div className="relative h-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4">
                  {dailyClicks.map((d) => {
                    const heightPercentage = Math.max((d.clicks / maxClicks) * 100, 4);
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="relative w-full flex items-end justify-center h-full">
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
                            {d.clicks} clicks
                          </div>

                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercentage}%` }}
                            className="w-full max-w-[32px] rounded-t-sm bg-zinc-900 dark:bg-white hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors"
                          />
                        </div>

                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-full">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Top performers
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mostVisited.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No links recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mostVisited.map((u, rowIdx) => (
                <div
                  key={u.id || u._id || rowIdx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-medium text-zinc-400 shrink-0">
                    {rowIdx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={getWorkingShortUrl(u.shortCode)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono font-medium text-zinc-900 dark:text-white hover:underline block truncate"
                    >
                      {getDisplayShortUrl(u.shortCode)}
                    </a>
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{u.originalUrl}</span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-mono font-medium text-zinc-900 dark:text-white">
                      {u.clicks.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-400">clicks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Links */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recent links
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUrls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No links created yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUrls.map((u, rowIdx) => (
                <div
                  key={u.id || u._id || rowIdx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1 mr-1" />

                  <div className="flex-1 min-w-0">
                    <a
                      href={getWorkingShortUrl(u.shortCode)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono font-medium text-zinc-900 dark:text-white hover:underline block truncate"
                    >
                      {getDisplayShortUrl(u.shortCode)}
                    </a>
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{u.originalUrl}</span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
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
