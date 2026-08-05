import React, { useEffect, useState } from "react";
import {
  Calendar, ShieldCheck,
  Terminal, Server
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<{ totalUrls: number; totalClicks: number } | null>(null);

  useEffect(() => {
    const fetchProfileMetrics = async () => {
      try {
        const res = await api.analytics.getDashboardData();
        setMetrics({
          totalUrls: res.metrics.totalUrls,
          totalClicks: res.metrics.totalClicks,
        });
      } catch (error) {
        console.error("Failed to load profile metrics:", error);
      }
    };

    fetchProfileMetrics();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 text-zinc-100 transition-colors min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="profile-page-title">
          Your profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Account details and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl text-center space-y-5">
          <div className="w-20 h-20 accent-gradient text-white flex items-center justify-center rounded-3xl text-2xl font-bold mx-auto shadow-lg shadow-violet-600/25">
            {user ? user.name.substring(0, 2).toUpperCase() : "U"}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-display">{user?.name}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>

          <div className="border-t border-white/[0.06] pt-4 grid grid-cols-2 gap-2 text-center select-none font-semibold">
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Links</div>
              <div className="text-lg font-bold text-white mt-1">
                {metrics ? metrics.totalUrls : "-"}
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Clicks</div>
              <div className="text-lg font-bold text-white mt-1">
                {metrics ? metrics.totalClicks : "-"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Joined {user ? formatDate(user.createdAt) : "-"}</span>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2.5 font-display">
              <Server className="w-4 h-4 text-emerald-400" />
              Deployment setup
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              LinkCut saves data locally by default. To deploy with MongoDB Atlas for production, set these environment variables:
            </p>

            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.04] text-[11px] font-mono text-zinc-400 leading-relaxed space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase select-none">
                <Terminal className="w-3.5 h-3.5" /> Environment variables
              </div>
              <p className="bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04]">
                MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/linkcut" <br />
                JWT_SECRET="your-private-jwt-secret"
              </p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5 border border-emerald-500/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white font-display">Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sessions are secured with signed JWT tokens. Link passwords are hashed with bcrypt before storage — we never store them in plain text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
