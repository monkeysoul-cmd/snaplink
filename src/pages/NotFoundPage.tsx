import React from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#f0fdf4] dark:bg-[#060612] transition-colors" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-teal-600/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '5s' }} />

      <div className="text-center space-y-6 max-w-md animate-slideUp relative z-10">
        {/* Visual */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 premium-card rounded-3xl flex items-center justify-center mx-auto animate-float">
            <Search className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -top-2 -right-4 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-lg shadow-rose-500/25">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-display">
            Page not found
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-sm mx-auto font-medium">
            This link may have expired or doesn't exist. Double-check the URL or head back home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigateTo("#/")}
            className="px-5 py-2.5 btn-glow text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go home
          </button>
          
          <button
            onClick={() => {
              window.history.back();
            }}
            className="px-5 py-2.5 glass-card text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 hover:text-zinc-900 dark:hover:text-white hover:border-emerald-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};
