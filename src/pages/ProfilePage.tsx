import React, { useEffect, useState } from "react";
import {
  Calendar, ShieldCheck, User, Mail,
  Bell, Trash2, Lock, Globe, Settings,
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
      <div className="border-b border-black/5 dark:border-white/[0.06] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-display" id="profile-page-title">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your account, security, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Profile Summary Card ── */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl text-center space-y-5">
          <div className="w-20 h-20 accent-gradient text-white flex items-center justify-center rounded-3xl text-2xl font-bold mx-auto shadow-lg shadow-emerald-600/25">
            {user ? user.name.substring(0, 2).toUpperCase() : "U"}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-display">{user?.name}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>

          <div className="border-t border-black/5 dark:border-white/[0.06] pt-4 grid grid-cols-2 gap-2 text-center select-none">
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Links</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {metrics ? metrics.totalUrls : "—"}
              </div>
            </div>
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Clicks</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {metrics ? metrics.totalClicks : "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
            <Calendar className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Joined {user ? formatDate(user.createdAt) : "—"}</span>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account information */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2.5 font-display">
              <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Account information
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 shrink-0">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Full name</div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.name ?? "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/15 shrink-0">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Email address</div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.email ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2.5 font-display">
              <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Security
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 border border-emerald-500/15 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">JWT session tokens</div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    Your session uses signed JWTs that expire automatically — no persistent cookies.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg shrink-0 border border-teal-500/15 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Bcrypt password hashing</div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    Your password and any link-protection keys are hashed — never stored in plain text.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2.5 font-display">
              <Settings className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Preferences
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Default link expiry</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Links never expire unless set manually</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-lg shrink-0 ml-3">Never</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">Notifications</div>
                    <div className="text-xs text-zinc-500 mt-0.5">In-app toast notifications active</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-lg shrink-0 ml-3">On</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border !border-rose-500/20 space-y-4">
            <h3 className="font-bold text-base text-rose-500 dark:text-rose-400 flex items-center gap-2.5 font-display">
              <Trash2 className="w-4 h-4" />
              Danger zone
            </h3>
            <div className="flex items-center justify-between p-3 bg-rose-500/[0.04] rounded-xl border border-rose-500/10">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Delete account</div>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Permanently removes your account and links. Cannot be undone.
                </p>
              </div>
              <button
                onClick={() => toast("To delete your account, please contact support.", "info")}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
