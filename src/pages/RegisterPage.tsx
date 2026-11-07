import React, { useState } from "react";
import { Loader2, User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#10b981"];
  if (!password) return null;
  return (
    <div className="space-y-1 pt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors"
            style={{
              background: i <= strength ? colors[strength] : "rgba(128,128,128,0.2)",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono font-medium" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Account created");
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      const msg = err.message || "Failed to create account.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#fafafa] dark:bg-[#090a0f] transition-colors relative overflow-hidden">
      {/* Soft ambient lighting for glassmorphic refraction */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 sm:p-10 rounded-2xl shadow-xl relative z-10">
        {/* Header */}
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Create an account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Start creating branded short links and tracking visits
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 text-xs font-medium text-rose-600 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Full name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-3.5 py-2.5 pl-9 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                placeholder="Alex Morgan"
                id="register-name"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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
                id="register-email"
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
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 pl-9 pr-9 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                placeholder="••••••••"
                id="register-password"
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
            {password && <PasswordStrength password={password} />}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 pl-9 pr-9 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                placeholder="••••••••"
                id="register-confirm-password"
              />
              <ShieldCheck className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 btn-glow text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium mt-3 disabled:opacity-50"
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-black/[0.06] dark:border-white/[0.08]" />

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <button
            onClick={() => { window.location.hash = "#/login"; }}
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
