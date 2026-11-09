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
    const cleanHash = (window.location.hash || "").split("?")[0].replace(/\/+$/, "");
    const parts = cleanHash.split("/").filter(Boolean);
    const unlockIdx = parts.findIndex((p) => p.replace("#", "") === "unlock");
    if (unlockIdx !== -1 && parts[unlockIdx + 1]) {
      return decodeURIComponent(parts[unlockIdx + 1]);
    }
    return parts[parts.length - 1]?.replace(/^#/, "") || "";
  };

  const shortCode = getShortCode();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Please enter the password.");
      return;
    }

    if (!shortCode) {
      setErrorMsg("Invalid link code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const data = await api.url.verifyPassword(shortCode, password);
      toast.success("Unlocked");
      const targetUrl = /^https?:\/\//i.test(data.originalUrl) 
        ? data.originalUrl 
        : `https://${data.originalUrl}`;
      window.location.href = targetUrl;
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Incorrect password.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#fafafa] dark:bg-[#090a0f] transition-colors">
      <div className="w-full max-w-sm glass-card p-8 sm:p-10 rounded-2xl shadow-xl relative z-10">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mx-auto">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Protected link
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Enter the password for <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">/{shortCode}</span> to continue
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4" id="unlock-form">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 glass-input text-sm rounded-xl focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600"
              placeholder="••••••••"
              id="unlock-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 btn-glow text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <span>Unlock link</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              window.location.hash = "#/";
            }}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};
