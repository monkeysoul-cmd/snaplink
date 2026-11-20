import React, { useState } from "react";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Link2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg("Please fill in all fields."); return; }
    setIsSubmitting(true); setErrorMsg(null);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setErrorMsg(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch relative overflow-hidden bg-[#fafafa] dark:bg-[#090a0f] transition-colors">
      {/* Ambient subtle emerald/teal glow backdrop (strictly zero purple) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Left form panel ── */}
      <div className="flex flex-col justify-center items-center flex-1 p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm glass-card p-8 sm:p-10 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Sign in
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 text-xs font-medium text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 pl-9 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                  placeholder="name@example.com"
                  id="login-email"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pl-9 pr-9 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                  placeholder="••••••••"
                  id="login-password"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 btn-glow text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium mt-2 disabled:opacity-50"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-black/[0.06] dark:border-white/[0.08]" />

          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <button
              onClick={() => { window.location.hash = "#/register"; }}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
            >
              Create one free
            </button>
          </div>
        </div>
      </div>

      {/* ── Right decorative & details showcase panel — desktop only ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 xl:p-16 relative overflow-hidden border-l border-black/[0.06] dark:border-white/[0.06] bg-zinc-100/40 dark:bg-zinc-950/40">
        {/* Top badge and intro */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>SnapLink Edge Network</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">99.99% Uptime</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
              Fast, focused link infrastructure for modern teams.
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Transform long URLs into memorable, trackable short links with sub-30ms global redirection, real-time telemetry, and enterprise-grade security.
            </p>
          </div>
        </div>

        {/* Live link inspector & metrics showcase card */}
        <div className="relative z-10 max-w-lg w-full space-y-4 my-8">
          <div className="glass-card rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] shadow-lg backdrop-blur-md space-y-4">
            {/* Live edge indicator header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">HTTP 302 FOUND</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                ~24ms edge latency
              </span>
            </div>

            {/* Shortened URL display */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Shortened link</div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-black/[0.04] dark:border-white/[0.04]">
                <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  snaplink.vercel.app/launch
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Destination URL */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Destination target</div>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded-lg">
                https://example.com/company/product-announcement-2026
              </div>
            </div>

            {/* Telemetry metrics row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 text-center">
                <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Total Visits</div>
                <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-0.5">1,248</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">+18.4% today</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 text-center">
                <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Mobile Share</div>
                <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-0.5">74%</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">iOS & Android</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 text-center">
                <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Security</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">SSRF-Safe</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Protected</div>
              </div>
            </div>
          </div>

          {/* Feature checklist */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Branded custom slugs</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Bcrypt password gates</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Real-time click telemetry</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Instant QR downloads</span>
            </div>
          </div>
        </div>

        {/* Footer trust indicator */}
        <div className="relative z-10 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 max-w-lg">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            End-to-end encrypted sessions
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Edge cached
          </span>
        </div>
      </div>
    </div>
  );
};
