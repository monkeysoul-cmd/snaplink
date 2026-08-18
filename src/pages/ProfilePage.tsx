import React, { useEffect, useRef, useState } from "react";
import {
  Calendar, User, Mail,
  Bell, Trash2, Globe, Settings,
  ChevronDown, Check, Clock, Infinity,
  Link2, MousePointerClick,
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
  const { toast, notificationsEnabled, setNotificationsEnabled } = useToast();

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
        setMetrics({ totalUrls: res.metrics.totalUrls, totalClicks: res.metrics.totalClicks });
      } catch {}
    };
    fetchProfileMetrics();
  }, []);

  useEffect(() => {
    if (!expiryOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExpiryOpen(false);
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
      const label = EXPIRY_OPTIONS.find((o) => o.value === value)?.label ?? value;
      toast.success(`Default expiry set to "${label}"`);
    }, 300);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const selectedExpiry = EXPIRY_OPTIONS.find((o) => o.value === defaultExpiry) ?? EXPIRY_OPTIONS[0];
  const initials = user ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] animate-pageEnter">

      {/* ── Header ── */}
      <div className="border-b border-white/[0.05] pb-5 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="profile-page-title">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Profile Summary Card ── */}
        <div className="lg:col-span-1 premium-card p-6 text-center space-y-6 animate-slideInLeft" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>

          {/* Avatar with gradient ring */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="profile-avatar-lg">
              {initials}
            </div>
            {/* Ping ring */}
            <span className="absolute w-24 h-24 rounded-3xl border border-emerald-500/20 animate-ping-slow pointer-events-none" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-display">{user?.name}</h2>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-5">
            <div className="stat-tile stat-tile-emerald p-4 text-center cursor-default group">
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Links</div>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono animate-count-pop">
                {metrics ? metrics.totalUrls : "—"}
              </div>
            </div>
            <div className="stat-tile stat-tile-teal p-4 text-center cursor-default">
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Clicks</div>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono animate-count-pop">
                {metrics ? metrics.totalClicks.toLocaleString() : "—"}
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center border-t border-white/[0.05] pt-4">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Joined {formatDate(user.createdAt)}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account information */}
          <div className="premium-card p-5 sm:p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <h3 className="font-bold text-base text-white flex items-center gap-2.5 font-display">
              <div className="icon-ring icon-ring-emerald w-8 h-8">
                <User className="w-4 h-4 text-emerald-400 relative z-10" />
              </div>
              Account information
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3.5 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-emerald-500/15 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/12 shrink-0 group-hover:bg-emerald-500/18 transition-colors">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Full name</div>
                  <div className="text-sm font-semibold text-zinc-200 mt-0.5">{user?.name ?? "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-teal-500/15 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/12 shrink-0 group-hover:bg-teal-500/18 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Email address</div>
                  <div className="text-sm font-semibold text-zinc-200 mt-0.5">{user?.email ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="premium-card p-5 sm:p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
            <h3 className="font-bold text-base text-white flex items-center gap-2.5 font-display">
              <div className="icon-ring icon-ring-teal w-8 h-8">
                <Settings className="w-4 h-4 text-teal-400 relative z-10" />
              </div>
              Preferences
            </h3>

            <div className="space-y-2.5">
              {/* Default expiry dropdown */}
              <div
                ref={dropdownRef}
                className="relative flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-emerald-500/15 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Default link expiry</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Applied when creating new links</div>
                  </div>
                </div>

                <button
                  id="expiry-toggle-btn"
                  onClick={() => setExpiryOpen((v) => !v)}
                  disabled={savingExpiry}
                  className="btn-glass flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 ml-3 cursor-pointer disabled:opacity-60"
                  aria-haspopup="listbox"
                  aria-expanded={expiryOpen}
                >
                  {savingExpiry ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin inline-block" />
                  ) : (
                    <>
                      <selectedExpiry.icon className="w-3 h-3" />
                      {selectedExpiry.label}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expiryOpen ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>

                {expiryOpen && (
                  <div
                    className="absolute right-0 bottom-full mb-2 z-50 w-44 premium-card rounded-xl overflow-hidden shadow-2xl animate-scaleIn origin-bottom-right"
                    role="listbox"
                  >
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={opt.value === defaultExpiry}
                        onClick={() => handleExpiryChange(opt.value)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-sm transition-all duration-150 cursor-pointer ${
                          opt.value === defaultExpiry
                            ? "bg-emerald-500/15 text-emerald-400 font-semibold"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <opt.icon className="w-3.5 h-3.5 opacity-70" />
                          {opt.label}
                        </span>
                        {opt.value === defaultExpiry && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-emerald-500/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 shrink-0 transition-colors ${notificationsEnabled ? "text-emerald-400" : "text-zinc-500"}`} />
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Notifications</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {notificationsEnabled ? "In-app toast notifications active" : "Notifications are muted"}
                    </div>
                  </div>
                </div>

                <button
                  id="notifications-toggle-btn"
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  onClick={() => {
                    const nextState = !notificationsEnabled;
                    setNotificationsEnabled(nextState);
                    if (nextState) toast.success("Notifications enabled");
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    notificationsEnabled ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span className="sr-only">Toggle notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="premium-card p-5 sm:p-6 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.26s", animationFillMode: "both", borderColor: 'rgba(239,68,68,0.2)' }}>
            <h3 className="font-bold text-base text-rose-400 flex items-center gap-2.5 font-display">
              <div className="icon-ring w-8 h-8" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Trash2 className="w-4 h-4 text-rose-400 relative z-10" />
              </div>
              Danger zone
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-rose-500/[0.04] rounded-xl border border-rose-500/12 hover:border-rose-500/25 hover:bg-rose-500/[0.07] transition-all duration-300">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-200">Delete account</div>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                  Permanently removes your account and all links. Cannot be undone.
                </p>
              </div>
              <button
                id="delete-account-btn"
                onClick={() => toast.info("To delete your account, please contact support.")}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ml-4 hover:scale-105 active:scale-95"
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
