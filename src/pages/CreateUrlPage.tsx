import React, { useState } from "react";
import {
  Calendar, Check, Copy, Lock, PlusCircle,
  QrCode, Tag, Link2, Eye, EyeOff, Star, ArrowRight, Settings2, Globe
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlQrCode } from "../components/UrlQrCode.js";
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
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) { toast.error("Please paste a URL first."); return; }
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      toast.error("Expiration date must be in the future.");
      return;
    }
    setIsSubmitting(true);
    setDisplayUrl(null); setWorkingUrl(null); setCreatedCode(null);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      const res = await api.url.create({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt && !isNaN(new Date(expiresAt).getTime()) ? new Date(expiresAt).toISOString() : null,
        password: password.trim() || undefined,
        tags, isPublic, isFavorite,
      });
      setDisplayUrl(getDisplayShortUrl(res.shortCode));
      setWorkingUrl(getWorkingShortUrl(res.shortCode));
      setCreatedCode(res.shortCode);
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
      setTimeout(() => setCopied(false), 2000);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Form ── */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="create-url-form">

            {/* Step 1 — URL */}
            <div className="space-y-3">
              <div className="font-medium text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Destination URL
              </div>

              <div className="space-y-1.5">
                <input
                  type="url"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Expiration date
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    min={getNowLocalDatetime()}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none"
                    id="create-url-expiry"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    Password protection
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

        {/* ── Side panel ── */}
        <div className="space-y-5">
          {displayUrl && workingUrl && createdCode ? (
            <div className="space-y-4">
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Link ready
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <a
                    href={workingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-mono font-medium text-zinc-900 dark:text-white hover:underline break-all block"
                  >
                    {displayUrl}
                  </a>
                </div>

                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-medium rounded-xl cursor-pointer transition-all border ${
                    copied
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5" /> Copied</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy link</>
                  }
                </button>
              </div>

              <UrlQrCode shortUrl={workingUrl} shortCode={createdCode} />
            </div>
          ) : (
            <div className="glass-card p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900/[0.04] dark:bg-white/[0.06] border border-zinc-900/10 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mx-auto">
                <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Link preview</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[220px] mx-auto leading-relaxed">
                  Your short link and QR code will appear here after creation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
