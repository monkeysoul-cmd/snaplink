import React, { useState, useEffect, useRef } from "react";
import { Check, Copy, ArrowRight, BarChart3, Lock, Tag, Link2 } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { getDisplayShortUrl, getWorkingShortUrl } from "../utils/urlHelper.js";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [workingUrl, setWorkingUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<any>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes("?") 
      ? window.location.hash.split("?")[1] 
      : "";
    const hashParams = new URLSearchParams(hashQuery);
    const err = searchParams.get("error") || hashParams.get("error");

    if (err === "inactive") {
      setRedirectError("This shortened link has been deactivated by its owner.");
      toast.error("This shortened link is inactive.");
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split("?")[0]);
    } else if (err === "expired") {
      setRedirectError("This shortened link has expired and is no longer accessible.");
      toast.error("This shortened link has expired.");
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split("?")[0]);
    }
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = longUrl.trim();
    if (!cleanUrl) { toast.error("Please enter a URL to shorten."); return; }
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }
    setIsShortening(true);
    try {
      const data = await api.url.create({ originalUrl: cleanUrl });
      const fullShort = getDisplayShortUrl(data.shortCode);
      const fullWorking = getWorkingShortUrl(data.shortCode);
      setShortenedUrl(fullShort);
      setWorkingUrl(fullWorking);
      toast.success("Link shortened");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsShortening(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = workingUrl || shortenedUrl;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copied to clipboard");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try selecting it manually.");
    }
  };

  const navigateTo = (hash: string) => { window.location.hash = hash; };

  const features = [
    {
      icon: BarChart3,
      title: "Click analytics",
      description: "Inspect who is clicking your links: devices, browsers, and geographic locations with tabular accuracy.",
    },
    {
      icon: Lock,
      title: "Password & expiry",
      description: "Protect sensitive links behind a password or schedule links to expire automatically on a specific date.",
    },
    {
      icon: Tag,
      title: "Custom aliases",
      description: "Replace random characters with clean, readable slugs that represent your content and brand.",
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* ── Ambient background light (soft optical wash for glassmorphism) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.05] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-teal-500/[0.03] dark:bg-teal-500/[0.03] rounded-full blur-[160px]" />
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-10 sm:pt-16 pb-12">

          {/* Redirection Error Notice */}
          {redirectError && (
            <div className="max-w-xl mx-auto p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium">
              <span>{redirectError}</span>
              <button
                onClick={() => setRedirectError(null)}
                className="p-1 rounded-lg hover:bg-amber-500/15 transition-colors cursor-pointer text-amber-700 dark:text-amber-400"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/[0.03] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Fast link shortener with real-time analytics
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-zinc-900 dark:text-white">
            Shorten links.
            <br />
            <span className="text-zinc-500 dark:text-zinc-400">Track every click.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
            Turn long URLs into clean, memorable links. Protect them with passwords, set expiry dates, and inspect visitor metrics.
          </p>
        </div>

        {/* ═══════════════ SHORTENER GLASS BOX ═══════════════ */}
        <div className="hero-box max-w-2xl mx-auto p-6 sm:p-8 mb-20">
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Link2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Paste long URL
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 glass-input text-sm rounded-xl placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-medium pr-10"
                    placeholder="https://example.com/very-long-url-to-shorten"
                  />
                  {longUrl && (
                    <button
                      type="button"
                      onClick={() => setLongUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer text-base"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isShortening}
                  className="px-6 py-3.5 btn-glow text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <span>{isShortening ? "Shortening..." : "Shorten"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Result Box */}
          {shortenedUrl && (
            <div className="mt-5 p-4 rounded-xl bg-zinc-900/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                    <span>Short link ready</span>
                  </div>
                  <a
                    href={workingUrl || shortenedUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-mono font-medium text-zinc-900 dark:text-white hover:underline break-all block"
                  >
                    {shortenedUrl}
                  </a>
                </div>

                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer transition shrink-0 active:scale-95"
                  title="Copy short link"
                >
                  {copied
                    ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
              </div>

              {/* Sign-up nudge */}
              {!isAuthenticated && (
                <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Need custom aliases, QR codes & analytics?</span>
                  <button
                    onClick={() => navigateTo("#/register")}
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    Create free account
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════ FEATURES GRID ═══════════════ */}
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Built for clarity and control
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Everything you need to share links confidently and understand your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bento-tile p-6 flex flex-col justify-between cursor-default"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mb-4">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-base mb-1.5 text-zinc-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <button
              onClick={() => navigateTo(isAuthenticated ? "#/dashboard" : "#/register")}
              className="px-8 py-3.5 btn-glow text-sm rounded-xl cursor-pointer inline-flex items-center gap-2"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Get started for free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2.5">No credit card required.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
