import React, { useState } from "react";
import { Check, Copy, ArrowRight, Zap, BarChart3, Lock, Tag, Link2 } from "lucide-react";
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

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      toast.error("Please enter a URL to shorten.");
      return;
    }

    setIsShortening(true);
    try {
      const data = await api.url.create({ originalUrl: longUrl });
      const fullShort = getDisplayShortUrl(data.shortCode);
      const fullWorking = getWorkingShortUrl(data.shortCode);
      setShortenedUrl(fullShort);
      setWorkingUrl(fullWorking);
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
      toast.success("Copied working link!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Couldn't copy — try selecting it manually.");
    }
  };

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const features = [
    {
      icon: BarChart3,
      title: "Click analytics",
      description: "See exactly who's clicking your links — which devices, browsers, and countries. Beautiful charts, zero setup.",
      gradient: "from-emerald-500 to-teal-600",
      glowColor: "shadow-emerald-500/20",
    },
    {
      icon: Lock,
      title: "Password protection",
      description: "Lock any link with a password or set it to auto-expire. Share confidently knowing you're in control.",
      gradient: "from-teal-400 to-cyan-600",
      glowColor: "shadow-teal-400/20",
    },
    {
      icon: Tag,
      title: "Custom aliases",
      description: "Ditch the random characters. Use memorable words like /summer-sale that people actually want to click.",
      gradient: "from-cyan-400 to-sky-600",
      glowColor: "shadow-cyan-400/20",
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] transition-colors relative overflow-hidden">
      {/* === ANIMATED MESH BACKGROUND === */}
      <div className="absolute inset-0 bg-[#020d0a]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/[0.06] rounded-full blur-[180px] animate-aurora" />
      <div className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-cyan-400/[0.06] rounded-full blur-[100px] animate-blob" style={{ animationDelay: '8s' }} />

      {/* === HERO SECTION === */}
      <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-8 sm:pt-16 pb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold select-none text-emerald-300 backdrop-blur-sm animate-fadeIn">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Free link shortener — no limits
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-slideUp">
            <span className="text-white">Make every link </span>
            <br className="hidden sm:inline" />
            <span className="gradient-text">count.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed animate-fadeIn" style={{ animationDelay: '0.2s', opacity: 0 }}>
            Turn long ugly URLs into short branded links. Add passwords, set expiry dates, and see who's clicking — all for free.
          </p>
        </div>

        {/* === SHORTENER BOX === */}
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 mb-20 relative z-10 animate-slideUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
          {/* Inner glow accent */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <form onSubmit={handleShorten} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                Your long URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  required
                  className="flex-1 px-4 py-3.5 glass-input text-sm text-zinc-100 rounded-xl placeholder-zinc-600 focus:outline-none font-medium"
                  placeholder="Paste your long URL here..."
                />
                <button
                  type="submit"
                  disabled={isShortening}
                  className="px-6 py-3.5 btn-gradient text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  <span>{isShortening ? "Working..." : "Shorten it"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Result */}
          {shortenedUrl && (
            <div className="mt-6 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl animate-scaleIn space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    ✅ Your short link is ready!
                  </span>
                  <a
                    href={workingUrl || shortenedUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-teal-300 hover:text-teal-200 hover:underline break-all transition-colors"
                  >
                    {shortenedUrl}
                  </a>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-3 glass-card rounded-xl text-zinc-300 cursor-pointer transition shrink-0 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Sign-up nudge for guests */}
              {!isAuthenticated && (
                <div className="border-t border-emerald-500/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
                  <span>Want custom aliases, QR codes, and click stats?</span>
                  <button
                    onClick={() => navigateTo("#/register")}
                    className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    Sign up free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === FEATURES SECTION === */}
        <div className="max-w-5xl mx-auto space-y-12 relative z-10 pb-20">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
              Everything you need
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Powerful features wrapped in a beautiful interface. No complexity, just results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`glass-card rounded-2xl p-7 hover-lift hover-glow transition-all group animate-slideUp stagger-${i + 1}`}
                  style={{ opacity: 0 }}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.glowColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center pt-8">
            <button
              onClick={() => navigateTo(isAuthenticated ? "#/dashboard" : "#/register")}
              className="px-8 py-4 btn-gradient text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 cursor-pointer inline-flex items-center gap-2 transition-all hover:shadow-emerald-600/35"
            >
              <Zap className="w-4 h-4" />
              <span>{isAuthenticated ? "Go to Dashboard" : "Get started — it's free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
