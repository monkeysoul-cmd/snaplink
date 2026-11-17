import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, Check, Copy, Lock, PlusCircle,
  QrCode, Tag, Link2, Eye, EyeOff, Star, ArrowRight, Settings2, Globe,
  ExternalLink, CheckCircle2, Sparkles, Share2
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlQrCode } from "../components/UrlQrCode.js";
import { ExpiryPicker } from "../components/ExpiryPicker.js";
import { getDisplayShortUrl, getWorkingShortUrl, getShortDomain } from "../utils/urlHelper.js";

const computeDefaultExpiry = (pref: string | null): string => {
  if (!pref || pref === "never") return "";
  const now = new Date();
  switch (pref) {
    case "1d": now.setDate(now.getDate() + 1); break;
    case "7d": now.setDate(now.getDate() + 7); break;
    case "30d": now.setDate(now.getDate() + 30); break;
    case "90d": now.setDate(now.getDate() + 90); break;
    case "1y": now.setFullYear(now.getFullYear() + 1); break;
    default: return "";
  }
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const getNowLocalDatetime = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const CreateUrlPage: React.FC = () => {
  const { toast } = useToast();

  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [customAlias, setCustomAlias] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    const saved = localStorage.getItem("linkcut_default_expiry");
    return computeDefaultExpiry(saved);
  });
  const [password, setPassword] = useState<string>("");
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [workingUrl, setWorkingUrl] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [lastOriginalUrl, setLastOriginalUrl] = useState<string | null>(null);
  const [lastExpiresAt, setLastExpiresAt] = useState<string | null>(null);
  const [lastHasPassword, setLastHasPassword] = useState<boolean>(false);
  const [lastTags, setLastTags] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = originalUrl.trim();
    if (!cleanUrl) { toast.error("Please paste a URL first."); return; }
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }

    let finalAlias: string | undefined = undefined;
    if (customAlias.trim()) {
      const trimmedAlias = customAlias.trim().replace(/\s+/g, "-");
      if (trimmedAlias.length < 3) {
        toast.error("Custom alias must be at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAlias)) {
        toast.error("Custom alias can only contain letters, numbers, hyphens, and underscores.");
        return;
      }
      finalAlias = trimmedAlias;
    }

    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime();
      if (isNaN(expiryTime)) {
        toast.error("Please enter a valid expiration date.");
        return;
      }
      if (expiryTime <= Date.now() - 60000) {
        toast.error("Expiration date must be in the future.");
        return;
      }
    }
    setIsSubmitting(true);
    setDisplayUrl(null); setWorkingUrl(null); setCreatedCode(null);
    try {
      const tags: string[] = Array.from(new Set(tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)));
      const parsedExpiry = expiresAt && !isNaN(new Date(expiresAt).getTime()) 
        ? new Date(expiresAt).toISOString() 
        : null;

      const res = await api.url.create({
        originalUrl: cleanUrl,
        customAlias: finalAlias,
        expiresAt: parsedExpiry,
        password: password.trim() || undefined,
        tags, isPublic, isFavorite,
      });
      const disp = getDisplayShortUrl(res.shortCode);
      const work = getWorkingShortUrl(res.shortCode);
      setDisplayUrl(disp);
      setWorkingUrl(work);
      setCreatedCode(res.shortCode);
      setLastOriginalUrl(cleanUrl);
      setLastExpiresAt(parsedExpiry);
      setLastHasPassword(Boolean(password.trim()));
      setLastTags(tags);
      toast.success("Link created!");
      setOriginalUrl(""); setCustomAlias("");
      setExpiresAt(computeDefaultExpiry(localStorage.getItem("linkcut_default_expiry")));
      setPassword(""); setTagsInput(""); setIsFavorite(false);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!workingUrl) return;
    try {
      await navigator.clipboard.writeText(workingUrl);
      setCopied(true);
      toast.success("Copied!");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy.");
    }
  };

  const aliasLen = customAlias.length;

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      {/* ── Header ── */}
      <div className="border-b border-black/5 dark:border-white/[0.05] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-display" id="create-url-title">
          Shorten a link
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 font-medium">
          Paste any URL, customize it, and get a short link you can share anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left main section (Form + Generated Link Showcase) ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* ── Generated Link Success Showcase (Left Side View) ── */}
          {displayUrl && workingUrl && createdCode && (
            <div className="glass-card p-6 sm:p-7 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] space-y-5 animate-fadeIn shadow-lg shadow-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-display">
                      Your link is live & ready!
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Share your branded short link anywhere.
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active 302 Redirect
                </span>
              </div>

              {/* Short Link Hero Display Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Shortened Link
                  </div>
                  <a
                    href={workingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 hover:underline break-all block transition-colors group/link flex items-center gap-2"
                  >
                    <span>{displayUrl}</span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover/link:opacity-100 shrink-0" />
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "btn-glow"
                    }`}
                    id="copy-hero-btn"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={workingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition cursor-pointer"
                    title="Test link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Destination & Metadata */}
              <div className="space-y-2 text-xs">
                {lastOriginalUrl && (
                  <div className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-white/[0.03] p-3 rounded-xl border border-black/5 dark:border-white/5">
                    <Globe className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">Destination: </span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 break-all">{lastOriginalUrl}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {lastHasPassword && (
                    <span className="gradient-badge badge-amber flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Password Protected
                    </span>
                  )}
                  {lastExpiresAt && (
                    <span className="gradient-badge badge-blue flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" /> Expires {new Date(lastExpiresAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  {lastTags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="border-t border-black/5 dark:border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setDisplayUrl(null);
                    setWorkingUrl(null);
                    setCreatedCode(null);
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Shorten another link
                </button>

                <button
                  onClick={() => { window.location.hash = "#/links"; }}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View in your links</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Form Card ── */}
          <div className="glass-card p-5 sm:p-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="create-url-form">

            {/* Step 1 — URL */}
            <div className="space-y-3">
              <div className="font-medium text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Destination URL
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  inputMode="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl font-medium placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
                  placeholder="https://example.com/your-long-url-to-shorten"
                  id="create-url-original"
                />
                {/* Live preview */}
                {originalUrl && (
                  <div className="flex items-center gap-2 px-1">
                    <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-xs text-zinc-500 font-mono truncate">
                      {(() => { try { return new URL(originalUrl).hostname; } catch { return originalUrl.slice(0, 40); } })()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Customize */}
            <div className="space-y-4">
              <div className="font-medium text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Optional settings
              </div>

              {/* Custom alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                  Custom alias
                </label>
                <div className="flex items-center glass-input rounded-xl overflow-hidden">
                  <span className="pl-3.5 pr-2 text-zinc-500 text-xs font-mono select-none shrink-0 border-r border-black/[0.06] dark:border-white/[0.08]">
                    {getShortDomain()}/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-3 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                    placeholder="my-link"
                    id="create-url-alias"
                    maxLength={50}
                  />
                  <span className="pr-3 text-[10px] text-zinc-400 font-mono select-none shrink-0">{aliasLen}/50</span>
                </div>
              </div>

              {/* Expiry */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Expiration date
                </label>
                <ExpiryPicker
                  value={expiresAt}
                  onChange={setExpiresAt}
                  id="create-url-expiry"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  Password protection (optional)
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600"
                    placeholder="••••••••"
                    id="create-url-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600"
                  placeholder="marketing, social, product"
                  id="create-url-tags"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isPublic
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                      : 'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-xs font-medium">Public statistics</div>
                    <div className="text-[10px] text-zinc-400">Visitor visible stats</div>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full relative transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${isPublic ? 'left-4' : 'left-0.5'}`} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isFavorite
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium'
                      : 'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-xs font-medium">Favorite</div>
                    <div className="text-[10px] text-zinc-400">Pin to top</div>
                  </div>
                  <Star className={`w-4 h-4 transition-all ${isFavorite ? 'text-amber-500 dark:text-amber-400 fill-current' : 'text-zinc-400'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 btn-glow disabled:opacity-50 text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium"
              id="create-url-submit"
            >
              <span>{isSubmitting ? "Creating..." : "Shorten URL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          </div>
        </div>

        {/* ── Right side panel (Quick Share, QR Code & Live Preview) ── */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {displayUrl && workingUrl && createdCode ? (
            <div className="space-y-4">
              {/* Quick Share Card */}
              <div className="glass-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Quick Share
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                    Live
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-1">
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Short URL
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {displayUrl}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopy}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border ${
                      copied
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <a
                    href={workingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>

              {/* QR Code Scanner & Download */}
              <UrlQrCode shortUrl={workingUrl} shortCode={createdCode} />
            </div>
          ) : (
            <div className="glass-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-xs text-zinc-900 dark:text-white">Live Link Preview</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 font-semibold">
                  302 Direct
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-1">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Short URL Preview
                </div>
                <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {getDisplayShortUrl(customAlias.trim() || "my-link")}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-1">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Destination Target
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">
                  {originalUrl.trim() || "https://example.com/your-destination"}
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/[0.06] space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Instant QR code ready upon creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-time click tracking & analytics</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
