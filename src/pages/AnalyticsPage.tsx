import React, { useEffect, useState } from "react";
import { 
  Globe, Laptop, Smartphone, Monitor, 
  RefreshCw
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { AnalyticsDashboardData } from "../types.js";
import { ChartSkeleton } from "../components/Skeletons.js";

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
      console.error(error);
      toast.error("Couldn't load analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-44 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
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

  const barColors = {
    device: "from-emerald-500 to-teal-500",
    browser: "from-teal-500 to-cyan-500",
    country: "from-emerald-600 to-green-500",
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 text-zinc-900 dark:text-zinc-100 transition-colors min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
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
          className="p-2 glass-card rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer disabled:opacity-50 flex items-center justify-center self-start"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`} />
        </button>
      </div>

      {totalClicks === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12">
          <div className="text-4xl">📊</div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-200 font-display">No data yet</h3>
            <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              Share your shortened links to start seeing device, browser, and country breakdowns here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Devices */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-6 hover-lift hover-glow transition-all">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
                📱 Devices
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                What devices people use to click your links.
              </p>
            </div>

            <div className="space-y-5">
              {deviceStats.map((stat) => {
                const Icon = getDeviceIcon(stat.name);
                return (
                  <div key={stat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-zinc-500" />
                        <span>{stat.name}</span>
                      </div>
                      <span className="text-white">
                        {stat.percentage}% <span className="text-zinc-500 font-medium text-[10px] sm:text-xs">({stat.count})</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${stat.percentage}%` }}
                        className={`h-full bg-gradient-to-r ${barColors.device} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browsers */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-6 hover-lift hover-glow transition-all">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
                🌐 Browsers
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Which browsers are most popular with your audience.
              </p>
            </div>

            <div className="space-y-5">
              {browserStats.map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-300">
                    <span>{stat.name}</span>
                    <span className="text-white">
                      {stat.percentage}% <span className="text-zinc-500 font-medium text-[10px] sm:text-xs">({stat.count})</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${stat.percentage}%` }}
                      className={`h-full bg-gradient-to-r ${barColors.browser} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 md:col-span-2 xl:col-span-1 space-y-6 hover-lift hover-glow transition-all">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-display">
                🌍 Countries
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Where in the world your clicks are coming from.
              </p>
            </div>

            <div className="space-y-5">
              {countryStats.map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-zinc-500" />
                      <span>{stat.name}</span>
                    </div>
                    <span className="text-white">
                      {stat.percentage}% <span className="text-zinc-500 font-medium text-[10px] sm:text-xs">({stat.count})</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${stat.percentage}%` }}
                      className={`h-full bg-gradient-to-r ${barColors.country} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
