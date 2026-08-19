import React, { useState } from "react";
import { Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";

export const UnlockPage: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getShortCode = () => {
    const hash = window.location.hash;
    const parts = hash.split("/");
    return parts[parts.length - 1] || "";
  };

  const shortCode = getShortCode();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Please enter the password.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const data = await api.url.verifyPassword(shortCode, password);
      toast.success("Unlocked! Redirecting...");
      
      // Redirect to the target
      window.location.href = data.originalUrl;
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Wrong password. Try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#f0fdf4] dark:bg-[#060612] transition-colors" />
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber-600/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />

      <div className="w-full max-w-md premium-card rounded-3xl p-6 sm:p-8 animate-slideUp relative z-10">
        {/* Gradient top accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />

        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-2xl mb-1 select-none">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white font-display">This link is locked</h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            Enter the password for <span className="font-bold text-emerald-600 dark:text-teal-400">/{shortCode}</span> to continue.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-scaleIn">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4" id="unlock-form">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              placeholder="••••••••"
              id="unlock-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-600/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              window.location.hash = "#/";
            }}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-teal-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
