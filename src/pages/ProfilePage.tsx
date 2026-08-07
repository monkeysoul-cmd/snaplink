import React, { useEffect, useRef, useState } from "react";
import {
  Calendar, User, Mail,
  Bell, Trash2, Globe, Settings,
  ChevronDown, Check, Clock, Infinity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";

const EXPIRY_OPTIONS = [
  { label: "Never",   value: "never", icon: Infinity },
  { label: "1 day",   value: "1d",    icon: Clock },
  { label: "7 days",  value: "7d",    icon: Clock },
  { label: "30 days", value: "30d",   icon: Clock },
  { label: "90 days", value: "90d",   icon: Clock },
  { label: "1 year",  value: "1y",    icon: Clock },
];

const LS_EXPIRY_KEY = "linkcut_default_expiry";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<{ totalUrls: number; totalClicks: number } | null>(null);
  const [defaultExpiry, setDefaultExpiry] = useState<string>(
    () => localStorage.getItem(LS_EXPIRY_KEY) ?? "never"
  );
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [savingExpiry, setSavingExpiry] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!expiryOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExpiryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expiryOpen]);

  const handleExpiryChange = (value: string) => {
    setSavingExpiry(true);
    setExpiryOpen(false);
    setTimeout(() => {
      setDefaultExpiry(value);
      localStorage.setItem(LS_EXPIRY_KEY, value);
      setSavingExpiry(false);
      const label = EXPIRY_OPTIONS.find(o => o.value === value)?.label ?? value;
      toast(`Default link expiry set to "${label}"`, "success");
    }, 300);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

  const selectedExpiry = EXPIRY_OPTIONS.find(o => o.value === defaultExpiry) ?? EXPIRY_OPTIONS[0];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 text-zinc-100 transition-colors min-h-[calc(100vh-4rem)]">

      {/* Header */}
      <div
        className="border-b border-black/5 dark:border-white/[0.06] pb-5 animate-fadeIn"
        style={{ animationFillMode: "both" }}
      >
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-display"
          id="profile-page-title"
        >
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Profile Summary Card ── */}
        <div
          className="lg:col-span-1 glass-card p-6 rounded-2xl text-center space-y-5 animate-slideInLeft"
          style={{ animationDelay: "0.05s", animationFillMode: "both" }}
        >
          {/* Avatar with pulse ring */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 accent-gradient text-white flex items-center justify-center rounded-3xl text-2xl font-bold shadow-lg shadow-emerald-600/25 animate-breathe">
              {user ? user.name.substring(0, 2).toUpperCase() : "U"}
            </div>
            <span className="absolute -inset-1 rounded-3xl border border-emerald-500/30 animate-ping-slow pointer-events-none" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-display">{user?.name}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>

          <div className="border-t border-black/5 dark:border-white/[0.06] pt-4 grid grid-cols-2 gap-2 text-center select-none">
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Links</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1 animate-count-pop">
                {metrics ? metrics.totalUrls : "—"}
              </div>
            </div>
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Clicks</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1 animate-count-pop">
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
          <div
            className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 animate-fadeInUp"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2.5 font-display">
              <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Account information
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 shrink-0 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Full name</div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.name ?? "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-teal-500/20 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/15 shrink-0 group-hover:bg-teal-500/20 transition-colors duration-300">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Email address</div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{user?.email ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div
            className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 animate-fadeInUp"
            style={{ animationDelay: "0.18s", animationFillMode: "both" }}
          >
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2.5 font-display">
              <Settings className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Preferences
            </h3>
            <div className="space-y-2.5">

              {/* Default link expiry — interactive dropdown */}
              <div
                ref={dropdownRef}
                className="relative flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Default link expiry</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Applied when creating new links</div>
                  </div>
                </div>

                <button
                  id="expiry-toggle-btn"
                  onClick={() => setExpiryOpen(v => !v)}
                  disabled={savingExpiry}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 px-2.5 py-1.5 rounded-lg shrink-0 ml-3 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-haspopup="listbox"
                  aria-expanded={expiryOpen}
                >
                  {savingExpiry ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin inline-block" />
                  ) : (
                    <>
                      <selectedExpiry.icon className="w-3 h-3" />
                      {selectedExpiry.label}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-300 ${expiryOpen ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>

                {/* Dropdown menu */}
                {expiryOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 z-50 w-44 glass-card rounded-xl border border-emerald-500/15 overflow-hidden shadow-2xl animate-scaleIn origin-top-right"
                    role="listbox"
                    aria-label="Default link expiry options"
                  >
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={opt.value === defaultExpiry}
                        onClick={() => handleExpiryChange(opt.value)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-sm transition-all duration-150 cursor-pointer
                          ${opt.value === defaultExpiry
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-white"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <opt.icon className="w-3.5 h-3.5 opacity-70" />
                          {opt.label}
                        </span>
                        {opt.value === defaultExpiry && (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications row */}
              <div className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Notifications</div>
                    <div className="text-xs text-zinc-500 mt-0.5">In-app toast notifications active</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-lg shrink-0 ml-3">
                  On
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="glass-card p-5 sm:p-6 rounded-2xl border !border-rose-500/20 space-y-4 animate-fadeInUp"
            style={{ animationDelay: "0.26s", animationFillMode: "both" }}
          >
            <h3 className="font-bold text-base text-rose-500 dark:text-rose-400 flex items-center gap-2.5 font-display">
              <Trash2 className="w-4 h-4" />
              Danger zone
            </h3>
            <div className="flex items-center justify-between p-3 bg-rose-500/[0.04] rounded-xl border border-rose-500/10 hover:border-rose-500/25 hover:bg-rose-500/[0.07] transition-all duration-300">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Delete account</div>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Permanently removes your account and links. Cannot be undone.
                </p>
              </div>
              <button
                id="delete-account-btn"
                onClick={() => toast("To delete your account, please contact support.", "info")}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shrink-0 ml-4 hover:scale-105 active:scale-95"
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
