import React, { useState } from "react";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Link2, CheckCircle2 } from "lucide-react";
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
      await login(email, password);
      toast.success("Welcome back");
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setErrorMsg(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch relative overflow-hidden bg-[#fafafa] dark:bg-[#090a0f] transition-colors">
      {/* ── Left decorative visual panel — desktop only ── */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 p-12 relative overflow-hidden border-r border-black/[0.06] dark:border-white/[0.06] bg-zinc-100/40 dark:bg-zinc-950/40">
        <div className="relative z-10 max-w-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-md mx-auto">
            <Link2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              SnapLink
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Fast, focused URL shortener with real-time visitor analytics, custom slugs, and QR codes.
            </p>
          </div>

          {/* Minimalist floating preview card */}
          <div className="glass-card p-4 rounded-xl text-left space-y-2.5 mt-8 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active link
              </span>
              <span>1,248 clicks</span>
            </div>
            <div className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
              snaplink.io/launch
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
              https://example.com/company/product-announcement-2026
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Custom slugs</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Real-time metrics</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col justify-center items-center flex-1 p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm glass-card p-8 sm:p-10 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Sign in
            </h2>
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
    </div>
  );
};
