import React, { useEffect, useState } from "react";
import { 
  PlusCircle, RefreshCw, ArrowUpRight, TrendingUp
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
      console.error(err);
      toast.error("Couldn't load your dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-44 bg-white/5 rounded animate-pulse" />
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

  const maxClicks = Math.max(...dailyClicks.map((d) => d.clicks), 5);

  const statCards = [
    { emoji: "🔗", label: "Total Links", value: metrics.totalUrls, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/15" },
    { emoji: "👆", label: "Total Clicks", value: metrics.totalClicks, gradient: "from-teal-500 to-cyan-500", glow: "shadow-teal-500/15" },
    { emoji: "⚡", label: "Active Links", value: metrics.activeUrls, gradient: "from-emerald-600 to-green-500", glow: "shadow-emerald-600/15" },
    { emoji: "⭐", label: "Favorites", value: metrics.favoriteUrls, gradient: "from-teal-400 to-emerald-500", glow: "shadow-teal-400/15" },
  ];

  return (
    <div className="space-y-6 animate-pageEnter p-4 sm:p-6 lg:p-8 text-zinc-900 dark:text-zinc-100 transition-colors min-h-[calc(100vh-4rem)] relative">

      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-600/[0.06] rounded-full blur-[100px] animate-blob" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-teal-500/[0.05] rounded-full blur-[120px] animate-blob" style={{ animationDelay: "5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-cyan-500/[0.03] rounded-full blur-[80px] animate-aurora" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5 animate-fadeIn">
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
            className="p-2.5 glass-card rounded-xl text-zinc-400 hover:text-emerald-400 transition cursor-pointer disabled:opacity-50 flex items-center justify-center hover:scale-110 active:scale-95"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : "transition-transform group-hover:rotate-180"}`} />
          </button>

          <button
            onClick={() => handleNavigate("#/create")}
            className="px-4 py-2.5 btn-gradient text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/15 cursor-pointer flex items-center gap-2 transition-all"
            id="dash-create-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Link</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover-lift hover-glow transition-all animate-springUp stagger-${i + 1} group cursor-default`}
            style={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-2xl transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]"
              >
                {card.emoji}
              </span>
              <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${card.gradient} opacity-70 group-hover:opacity-100 group-hover:w-16 transition-all duration-500 shadow-sm`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {card.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-display animate-rollUp overflow-hidden">
                {card.value}
              </div>
              {/* Accent line below number — grows on hover, stays inside the tile */}
              <div className={`mt-2 h-[2px] rounded-full bg-gradient-to-r ${card.gradient} w-0 group-hover:w-full transition-all duration-500 ease-out`} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 animate-fadeInUp" style={{ animationDelay: "0.2s", opacity: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-display">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Clicks this week
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Daily click activity over the last 7 days.
            </p>
          </div>
        </div>

        {dailyClicks.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-zinc-500 border border-dashed border-white/[0.06] rounded-xl">
            No clicks yet. Share some links to see data here!
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="h-56 w-full flex items-end justify-between gap-1 sm:gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
              {dailyClicks.map((d, barIdx) => {
                const heightPercentage = Math.max((d.clicks / maxClicks) * 100, 4);

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="relative w-full flex items-end justify-center h-[90%]">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1 bg-zinc-800 border border-emerald-500/20 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg shadow-emerald-900/30 pointer-events-none z-10 text-center flex flex-col min-w-[56px] gap-0.5">
                        <span className="text-emerald-400">{d.clicks}</span>
                        <span className="text-zinc-500 font-medium">clicks</span>
                        {/* Tooltip arrow */}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-r border-b border-emerald-500/20 rotate-45" />
                      </div>

                      {/* Bar */}
                      <div
                        style={{
                          height: `${heightPercentage}%`,
                          animationDelay: `${barIdx * 80}ms`,
                        }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-400 hover:from-emerald-600 hover:via-emerald-400 hover:to-teal-300 rounded-t-md transition-all duration-300 relative overflow-hidden shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-400/35 animate-bar-grow"
                      >
                        {/* Shimmer on bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Glow cap */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal-300/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-zinc-500 font-medium truncate max-w-full group-hover:text-zinc-300 transition-colors duration-200">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.3s", opacity: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
              🏆 Top performers
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition cursor-pointer hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mostVisited.length === 0 ? (
            <div className="text-center py-6 text-xs sm:text-sm text-zinc-500">
              No links to rank yet. Create your first one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Link</th>
                    <th className="pb-3 font-semibold">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {mostVisited.map((u, rowIdx) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                      style={{ animationDelay: `${rowIdx * 50}ms` }}
                    >
                      <td className="py-3 pr-2 font-bold text-zinc-300 truncate max-w-[150px] sm:max-w-[220px]">
                        <a
                          href={getWorkingShortUrl(u.shortCode)}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {getDisplayShortUrl(u.shortCode)}
                        </a>
                        <span className="block text-[10px] text-zinc-600 font-medium truncate">{u.originalUrl}</span>
                      </td>
                      <td className="py-3 font-bold text-right sm:text-left">
                        <span className="text-white group-hover:text-emerald-300 transition-colors">{u.clicks}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Links */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.38s", opacity: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
              🕐 Recent links
            </h2>
            <button
              onClick={() => handleNavigate("#/links")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition cursor-pointer hover:gap-1.5"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUrls.length === 0 ? (
            <div className="text-center py-6 text-xs sm:text-sm text-zinc-500">
              Nothing here yet. Go shorten a link!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Link</th>
                    <th className="pb-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentUrls.map((u, rowIdx) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                      style={{ animationDelay: `${rowIdx * 50}ms` }}
                    >
                      <td className="py-3 pr-2 font-bold text-zinc-300 truncate max-w-[150px] sm:max-w-[220px]">
                        <a
                          href={getWorkingShortUrl(u.shortCode)}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {getDisplayShortUrl(u.shortCode)}
                        </a>
                        <span className="block text-[10px] text-zinc-600 font-medium truncate">{u.originalUrl}</span>
                      </td>
                      <td className="py-3 text-zinc-500 whitespace-nowrap text-right sm:text-left font-medium group-hover:text-zinc-300 transition-colors">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

