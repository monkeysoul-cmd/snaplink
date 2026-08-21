import React, { useState } from "react";
import {
  Calendar, Check, Copy, Lock, PlusCircle,
  QrCode, Tag, Link2, Eye, EyeOff, Star, ArrowRight, Settings2, Globe
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlQrCode } from "../components/UrlQrCode.js";
import { getDisplayShortUrl, getWorkingShortUrl, getShortDomain } from "../utils/urlHelper.js";

export const CreateUrlPage: React.FC = () => {
  const { toast } = useToast();

  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [customAlias, setCustomAlias] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
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
    setIsSubmitting(true);
    setDisplayUrl(null); setWorkingUrl(null); setCreatedCode(null);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      const res = await api.url.create({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        password: password.trim() || undefined,
        tags, isPublic, isFavorite,
      });
      setDisplayUrl(getDisplayShortUrl(res.shortCode));
      setWorkingUrl(getWorkingShortUrl(res.shortCode));
      setCreatedCode(res.shortCode);
      toast.success("Link created!");
      setOriginalUrl(""); setCustomAlias(""); setExpiresAt("");
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
        <div className="lg:col-span-2 premium-card p-5 sm:p-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="create-url-form">

            {/* Step 1 — URL */}
            <div className="space-y-4">
              <div className="form-section-label font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Destination URL
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                  className="w-full px-4 py-4 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl font-medium placeholder-zinc-400 dark:placeholder-zinc-400 focus:outline-none"
                  placeholder="https://example.com/your-really-long-url-that-needs-shortening"
                  id="create-url-original"
                />
                {/* Live preview */}
                {originalUrl && (
                  <div className="flex items-center gap-2 px-1">
                    <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium truncate">
                      {(() => { try { return new URL(originalUrl).hostname; } catch { return originalUrl.slice(0, 40); } })()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Customize */}
            <div className="space-y-4">
              <div className="form-section-label font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                Customize
                <span className="font-normal normal-case text-zinc-500 dark:text-zinc-400 tracking-normal text-[11px]">(optional)</span>
              </div>

              {/* Custom alias */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block">
                  Custom back-half
                </label>
                <div className="flex items-center glass-input rounded-xl overflow-hidden focus-within:border-emerald-500/60 focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.15)] transition-all">
                  <span className="pl-4 pr-1 text-zinc-600 dark:text-zinc-300 text-sm font-semibold select-none whitespace-nowrap shrink-0 border-r border-black/10 dark:border-white/[0.08] pr-3 mr-0">
                    {getShortDomain()}/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-3.5 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 font-bold placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
                    placeholder="my-link"
                    id="create-url-alias"
                    maxLength={50}
                  />
                  <span className="pr-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono select-none shrink-0 font-semibold">{aliasLen}/50</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium px-1">Pick something short and memorable.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expiry */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    Expires on
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none font-medium"
                    id="create-url-expiry"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    Password protect
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
                      placeholder="••••••••"
                      id="create-url-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
                  placeholder="marketing, social, q3"
                  id="create-url-tags"
                />
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium px-1">Separate with commas to organize your links.</p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition select-none cursor-pointer group ${
                    isPublic
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'border-black/10 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400 hover:border-black/20 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-xs font-bold">Public stats</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Visible analytics</div>
                  </div>
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'left-4' : 'left-0.5'}`} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition select-none cursor-pointer ${
                    isFavorite
                      ? 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold'
                      : 'border-black/10 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400 hover:border-black/20 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-xs font-bold">Favorite</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Pin to top</div>
                  </div>
                  <Star className={`w-5 h-5 transition-all ${isFavorite ? 'text-amber-500 dark:text-amber-400 fill-current scale-110' : 'text-zinc-400'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 btn-glow disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer flex items-center justify-center gap-2"
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
            <div className="animate-scaleIn space-y-4">
              <div className="premium-card p-5 space-y-4">
                <div className="border-beam" />

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse-soft" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Link created!
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <a
                    href={workingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-emerald-600 dark:text-emerald-400 hover:underline break-all block transition-colors short-link-mono"
                  >
                    {displayUrl}
                  </a>
                  <div className="link-preview-domain mt-1.5">
                    <Globe className="w-2.5 h-2.5" />
                    {workingUrl}
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    copied
                      ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                      : 'btn-glass'
                  }`}
                >
                  {copied
                    ? <><Check className="w-4 h-4" /> Copied!</>
                    : <><Copy className="w-4 h-4" /> Copy link</>
                  }
                </button>
              </div>

              <UrlQrCode shortUrl={workingUrl} shortCode={createdCode} />
            </div>
          ) : (
            <div className="premium-card p-7 text-center space-y-5">
              <div className="empty-state-icon">
                <PlusCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400 animate-pulse-soft" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-display">Ready to shorten</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] mx-auto leading-relaxed font-medium">
                  Paste a URL and hit shorten — your QR code and short link will appear here.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                {["Custom aliases", "Password protection", "Click analytics"].map((f) => (
                  <div key={f} className="flex items-center gap-2 justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
