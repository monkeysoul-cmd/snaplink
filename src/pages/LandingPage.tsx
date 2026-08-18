import React, { useState, useEffect, useRef } from "react";
import { Check, Copy, ArrowRight, Zap, BarChart3, Lock, Tag, Link2, Sparkles, TrendingUp, Globe, Shield } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { getDisplayShortUrl, getWorkingShortUrl } from "../utils/urlHelper.js";

/* ─── Animated counter hook ─── */
function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef<boolean>(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, start]);
  return count;
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [workingUrl, setWorkingUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showBurst, setShowBurst] = useState<boolean>(false);

  const links = useCountUp(2_400_000);
  const clicks = useCountUp(18_700_000);
  const users = useCountUp(94_000);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) { toast.error("Please enter a URL to shorten."); return; }
    setIsShortening(true);
    try {
      const data = await api.url.create({ originalUrl: longUrl });
      const fullShort = getDisplayShortUrl(data.shortCode);
      const fullWorking = getWorkingShortUrl(data.shortCode);
      setShortenedUrl(fullShort);
      setWorkingUrl(fullWorking);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
      toast.success("Link shortened!");
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
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try selecting it manually.");
    }
  };

  const navigateTo = (hash: string) => { window.location.hash = hash; };

  const features = [
    {
      icon: BarChart3,
      title: "Click analytics",
      description: "See exactly who's clicking your links — devices, browsers, and countries. Beautiful charts, zero setup.",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      ringClass: "icon-ring-emerald",
      accent: "#34d399",
    },
    {
      icon: Lock,
      title: "Password protection",
      description: "Lock any link with a password or set it to auto-expire. Share confidently knowing you're in control.",
      gradient: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
      ringClass: "icon-ring-teal",
      accent: "#2dd4bf",
    },
    {
      icon: Tag,
      title: "Custom aliases",
      description: "Ditch the random characters. Use memorable words like /summer-sale that people actually want to click.",
      gradient: "linear-gradient(135deg, #06b6d4, #67e8f9)",
      ringClass: "icon-ring-cyan",
      accent: "#67e8f9",
    },
  ];

  const stats = [
    { label: "Links shortened", value: links, suffix: "+", format: (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n.toLocaleString(), icon: Link2 },
    { label: "Total clicks tracked", value: clicks, suffix: "+", format: (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n.toLocaleString(), icon: TrendingUp },
    { label: "Happy users", value: users, suffix: "+", format: (n: number) => n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : n.toLocaleString(), icon: Globe },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* ── Deep background ── */}
      <div className="absolute inset-0 bg-[#020d0a]" />

      {/* ── Animated mesh orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[min(600px,90vw)] h-[min(600px,90vw)] bg-emerald-600/10 rounded-full blur-[160px] animate-blob" />
        <div className="absolute bottom-0 right-1/5 w-[min(500px,80vw)] h-[min(500px,80vw)] bg-teal-500/8 rounded-full blur-[140px] animate-blob" style={{ animationDelay: '5s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(900px,110vw)] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-emerald-400/5 rounded-full blur-[80px] animate-blob animate-liquidMorph" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Scanline effect ── */}
      <div className="scanline absolute inset-0" />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-400/20 animate-ping-slow"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${8 + i * 8}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${2.5 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8 pt-10 sm:pt-20 pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 backdrop-blur-sm animate-fadeIn select-none">
            <Sparkles className="w-3.5 h-3.5" />
            Free link shortener — unlimited links, zero limits
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
          </div>

          {/* Headline — word-by-word stagger */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] font-display animate-springUp">
            <span className="text-white">Make every</span>
            <br />
            <span
              className="animate-gradientShimmer"
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #2dd4bf 40%, #22d3ee 70%, #a78bfa 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              link count.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-fadeIn"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            Turn long ugly URLs into <span className="text-zinc-200 font-medium">short branded links</span> in seconds.
            Add passwords, set expiry dates, and see who's clicking — all for free.
          </p>
        </div>

        {/* ═══════════════ SHORTENER BOX ═══════════════ */}
        <div
          className="hero-box max-w-2xl mx-auto p-6 sm:p-8 mb-24 animate-slideUp"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          {/* Animated border beam */}
          <div className="border-beam" />

          <form onSubmit={handleShorten} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                <Link2 className="w-3 h-3 text-emerald-400" />
                Paste your long URL
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    required
                    className="w-full px-4 py-4 glass-input text-sm text-zinc-100 rounded-xl placeholder-zinc-600 focus:outline-none font-medium pr-10"
                    placeholder="https://example.com/a-very-long-url-that-nobody-wants-to-type"
                  />
                  {longUrl && (
                    <button
                      type="button"
                      onClick={() => setLongUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isShortening}
                  className="px-7 py-4 btn-glow text-white font-bold text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  <span>{isShortening ? "Working..." : "Shorten it"}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isShortening ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </form>

          {/* Result */}
          {shortenedUrl && (
            <div className="mt-6 p-5 bg-emerald-500/8 border border-emerald-500/18 rounded-2xl animate-scaleIn space-y-3 relative overflow-hidden">
              {/* Success burst ring */}
              {showBurst && <div className="success-burst" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft shrink-0" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Your short link is ready!</span>
                  </div>
                  <a
                    href={workingUrl || shortenedUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold text-teal-300 hover:text-teal-200 hover:underline break-all transition-colors short-link-mono block"
                  >
                    {shortenedUrl}
                  </a>
                </div>

                <button
                  onClick={handleCopy}
                  className="p-3 glass-card rounded-xl text-zinc-300 cursor-pointer transition hover:text-white hover:scale-110 shrink-0 active:scale-95"
                  title="Copy"
                >
                  {copied
                    ? <Check className="w-4 h-4 text-emerald-400" />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
              </div>

              {/* Sign-up nudge */}
              {!isAuthenticated && (
                <div className="border-t border-emerald-500/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500">Want custom aliases, QR codes & detailed analytics?</span>
                  <button
                    onClick={() => navigateTo("#/register")}
                    className="font-bold text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    Sign up free
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════ STATS BAND ═══════════════ */}
        <div className="max-w-4xl mx-auto mb-24 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value, format, icon: Icon }, i) => (
              <div
                key={label}
                className="premium-card p-6 text-center group cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="stats-number mb-1">{format(value)}</div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ FEATURES BENTO GRID ═══════════════ */}
        <div className="max-w-5xl mx-auto space-y-16 relative z-10 pb-24">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.07] rounded-full text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              <Shield className="w-3 h-3 text-emerald-400" />
              Features
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-display tracking-tight">
              Everything you need,
              <br />
              <span className="gradient-text">nothing you don't.</span>
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Powerful features wrapped in a beautiful interface. No complexity, just results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bento-tile p-7 group animate-tiltIn stagger-${i + 1} cursor-default`}
                  style={{ opacity: 0 }}
                >
                  {/* Top accent line on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
                  />

                  {/* Ambient glow */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${feature.accent}18, transparent 70%)` }}
                  />

                  {/* Icon */}
                  <div
                    className={`feature-icon mb-5`}
                    style={{ background: feature.gradient }}
                  >
                    <Icon className="w-5 h-5 text-white relative z-10" />
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-white font-display group-hover:text-emerald-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {feature.description}
                  </p>

                  {/* Bottom accent */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500"
                    style={{ background: feature.gradient }}
                  />
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <button
              onClick={() => navigateTo(isAuthenticated ? "#/dashboard" : "#/register")}
              className="px-10 py-4 btn-glow text-white font-bold text-sm rounded-2xl cursor-pointer inline-flex items-center gap-3 animate-magneticGlow group"
            >
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{isAuthenticated ? "Go to Dashboard" : "Get started — it's free"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-zinc-600 mt-3">No credit card required. Always free.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
