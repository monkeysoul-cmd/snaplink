import React, { useState } from "react";
import { 
  Calendar, Check, Copy, Lock, PlusCircle, 
  QrCode, Tag, Link2, Eye, EyeOff, Star, ArrowRight
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlQrCode } from "../components/UrlQrCode.js";
import { getDisplayShortUrl, getWorkingShortUrl, getRedirectUrl, getShortDomain } from "../utils/urlHelper.js";

export const CreateUrlPage: React.FC = () => {
  const { toast } = useToast();
  
  // Form Fields
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [customAlias, setCustomAlias] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success State
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [workingUrl, setWorkingUrl] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      toast.error("Please paste a URL first.");
      return;
    }

    setIsSubmitting(true);
    setDisplayUrl(null);
    setWorkingUrl(null);
    setCreatedCode(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await api.url.create({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        password: password.trim() || undefined,
        tags,
        isPublic,
        isFavorite,
      });

      setDisplayUrl(getDisplayShortUrl(res.shortCode));
      setWorkingUrl(getWorkingShortUrl(res.shortCode));
      setCreatedCode(res.shortCode);
      toast.success("Link created!");
      
      setOriginalUrl("");
      setCustomAlias("");
      setExpiresAt("");
      setPassword("");
      setTagsInput("");
      setIsFavorite(false);
    } catch (error: any) {
      console.error(error);
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
      toast.success("Copied working link!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Couldn't copy — try selecting it manually.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 text-zinc-100 transition-colors min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="create-url-title">
          Shorten a link
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Paste any URL, customize it, and get a short link you can share anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 rounded-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5" id="create-url-form">
            {/* Long URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-violet-400" />
                Long URL *
              </label>
              <input
                type="text"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="w-full px-4 py-3.5 glass-input text-sm text-zinc-100 rounded-xl font-medium placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
                placeholder="https://example.com/your-really-long-url"
                id="create-url-original"
              />
            </div>

            {/* Custom back-half */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                ✏️ Custom back-half <span className="text-zinc-600 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 z-10 pointer-events-none text-zinc-800 dark:text-zinc-300 text-sm font-semibold select-none">
                  {getShortDomain()} /
                </span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full pl-[108px] pr-4 py-3.5 glass-input text-sm text-zinc-100 rounded-xl font-semibold placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
                  placeholder="summer-sale"
                  id="create-url-alias"
                />
              </div>
              <p className="text-[10px] text-zinc-600 font-medium">
                Pick something short and memorable.
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Expiry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Expires on <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
                  id="create-url-expiry"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Password protect <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
                  placeholder="••••••••"
                  id="create-url-password"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Tags <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
                  placeholder="newsletter, pricing, q3"
                  id="create-url-tags"
                />
                <p className="text-[10px] text-zinc-600 font-medium leading-tight">
                  Separate with commas to organize your links.
                </p>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  Options
                </label>
                <div className="flex gap-4 p-3.5 glass-input rounded-xl items-center">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-700 cursor-pointer bg-transparent"
                    />
                    Public stats
                  </label>
                  
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-700 cursor-pointer bg-transparent"
                    />
                    Favorite
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 btn-gradient disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-violet-600/15 cursor-pointer flex items-center justify-center gap-2"
              id="create-url-submit"
            >
              <span>{isSubmitting ? "Creating..." : "Shorten URL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {displayUrl && workingUrl && createdCode ? (
            <div className="animate-scaleIn space-y-4">
              <div className="glass-card p-5 rounded-2xl space-y-4" style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  🎉 Link created!
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <a
                    href={getRedirectUrl(createdCode)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold text-violet-300 hover:text-violet-200 hover:underline break-all block transition-colors"
                  >
                    {displayUrl}
                  </a>
                  <p className="text-[11px] text-zinc-500 font-mono break-all">
                    Live link: {workingUrl}
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 glass-input text-xs text-zinc-300 font-semibold rounded-xl cursor-pointer transition hover:text-white hover:border-violet-500/30"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-500" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code */}
              <UrlQrCode shortUrl={workingUrl} shortCode={createdCode} />
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl text-center space-y-4">
              <div className="text-4xl animate-float">✂️</div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-zinc-200 font-display">Ready to shorten</h3>
                <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                  Paste a URL and hit shorten — your QR code will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
