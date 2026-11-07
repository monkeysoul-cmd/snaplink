import React from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#fafafa] dark:bg-[#090a0f] transition-colors">
      <div className="text-center space-y-6 max-w-sm relative z-10 glass-card p-8 sm:p-10 rounded-2xl shadow-xl">
        {/* Visual icon */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-700 dark:text-zinc-300">
          <Search className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            Error 404
          </span>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Page not found
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            This link may have expired or does not exist. Double-check the URL or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => navigateTo("#/")}
            className="px-5 py-2.5 btn-glow text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          
          <button
            onClick={() => {
              window.history.back();
            }}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 font-medium text-sm cursor-pointer transition-colors hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
