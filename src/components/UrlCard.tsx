import React, { useState } from "react";
import {
  Calendar, Check, Copy, Edit, ExternalLink, Lock, QrCode, Star, Trash2,
  Eye, EyeOff, Tag, ToggleLeft, ToggleRight, X, AlertTriangle, MousePointerClick, Shield
} from "lucide-react";
import { UrlItem } from "../types.js";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlQrCode } from "./UrlQrCode.js";
import { getDisplayShortUrl, getWorkingShortUrl, getRedirectUrl } from "../utils/urlHelper.js";

interface UrlCardProps {
  url: UrlItem;
  onUpdate: () => void;
  onDelete: () => void;
}

export const UrlCard: React.FC<UrlCardProps> = ({ url, onUpdate, onDelete }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeletingConfirm, setIsDeletingConfirm] = useState<boolean>(false);

  // Edit state
  const [editUrl, setEditUrl] = useState<string>(url.originalUrl);
  const [editAlias, setEditAlias] = useState<string>(url.customAlias || "");
  const [editExpiry, setEditExpiry] = useState<string>(
    url.expiresAt ? new Date(url.expiresAt).toISOString().substring(0, 16) : ""
  );
  const [editPassword, setEditPassword] = useState<string>("");
  const [editTags, setEditTags] = useState<string>(url.tags.join(", "));
  const [editIsActive, setEditIsActive] = useState<boolean>(url.isActive);
  const [editIsPublic, setEditIsPublic] = useState<boolean>(url.isPublic);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showEditPwd, setShowEditPwd] = useState<boolean>(false);

  const displayShortLink = getDisplayShortUrl(url.shortCode);
  const workingShortLink = getWorkingShortUrl(url.shortCode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(workingShortLink);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try selecting it manually.");
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.url.update(url.id, { isFavorite: !url.isFavorite });
      onUpdate();
      toast.success(url.isFavorite ? "Removed from favorites." : "Added to favorites!");
    } catch (error: any) {
      toast.error(error.message || "Couldn't update.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl.trim()) { toast.error("URL is required."); return; }
    setIsSaving(true);
    try {
      const tagList = editTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      await api.url.update(url.id, {
        originalUrl: editUrl,
        customAlias: editAlias.trim() || null,
        expiresAt: editExpiry ? new Date(editExpiry).toISOString() : null,
        password: editPassword.trim() || undefined,
        tags: tagList,
        isActive: editIsActive,
        isPublic: editIsPublic,
      });
      toast.success("Link updated!");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Couldn't save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.url.delete(url.id);
      toast.success("Link deleted.");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Couldn't delete.");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const isExpired = url.expiresAt ? new Date(url.expiresAt).getTime() < Date.now() : false;

  return (
    <div className="url-card w-full pl-4 pr-5 pt-5 pb-4 flex flex-col gap-4 group">
      {/* Standard view */}
      {!isEditing && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2 min-w-0">
              {/* Short link row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => window.open(workingShortLink, "_blank")}
                  className="text-base sm:text-lg font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 cursor-pointer short-link-mono transition-colors group/link"
                  id={`link-short-${url.id}`}
                >
                  {displayShortLink}
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                </button>

                {/* Status badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {url.passwordHash && (
                    <span className="gradient-badge badge-amber flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                  {isExpired ? (
                    <span className="gradient-badge badge-rose">Expired</span>
                  ) : url.expiresAt ? (
                    <span className="gradient-badge badge-blue flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      Expires {formatDate(url.expiresAt)}
                    </span>
                  ) : null}
                  {!url.isActive && (
                    <span className="gradient-badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a' }}>
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Original URL */}
              <p className="text-xs text-zinc-500 truncate max-w-full font-medium">
                {url.originalUrl}
              </p>
            </div>

            {/* Right: favorite + clicks */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  url.isFavorite
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "text-zinc-600 hover:bg-white/[0.04] border-transparent hover:border-amber-500/20 hover:text-amber-400"
                }`}
                title={url.isFavorite ? "Remove from favorites" : "Add to favorites"}
                id={`fav-toggle-${url.id}`}
              >
                <Star className={`w-4 h-4 ${url.isFavorite ? 'fill-current' : ''}`} />
              </button>

              <div className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center select-none min-w-[56px]">
                <div className="flex items-center gap-1 justify-center">
                  <MousePointerClick className="w-2.5 h-2.5 text-zinc-500" />
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Clicks</div>
                </div>
                <div className="text-sm font-extrabold text-white font-mono">{url.clicks.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {url.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-zinc-600 mr-0.5 shrink-0" />
              {url.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/8 text-emerald-400 rounded-full border border-emerald-500/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
            <span className="text-[10px] text-zinc-600 font-medium shrink-0 font-mono">
              {formatDate(url.createdAt)}
            </span>

            {/* Icon-only action buttons with tooltips */}
            <div className="flex items-center gap-1">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer group/btn ${
                  copied
                    ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                    : 'glass-input text-zinc-400 hover:text-white hover:border-emerald-500/20'
                }`}
                id={`copy-btn-${url.id}`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copy</span></>
                )}
              </button>

              {/* QR */}
              <button
                onClick={() => setShowQr(!showQr)}
                title="QR Code"
                className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  showQr
                    ? "bg-violet-500/12 border-violet-500/25 text-violet-400"
                    : "glass-input text-zinc-500 hover:text-violet-400 hover:border-violet-500/20"
                }`}
                id={`qr-btn-${url.id}`}
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>

              {/* Edit */}
              <button
                onClick={() => setIsEditing(true)}
                title="Edit"
                className="p-1.5 sm:p-2 rounded-lg glass-input text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 transition-all cursor-pointer shrink-0"
                id={`edit-btn-${url.id}`}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={() => setIsDeletingConfirm(true)}
                title="Delete"
                className="p-1.5 sm:p-2 rounded-lg glass-input text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
                id={`del-btn-${url.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QR drawer */}
          {showQr && (
            <div className="border-t border-white/[0.05] pt-4 animate-fadeIn">
              <UrlQrCode shortUrl={workingShortLink} shortCode={url.shortCode} />
            </div>
          )}

          {/* Delete confirmation */}
          {isDeletingConfirm && (
            <div className="p-4 bg-rose-500/6 border border-rose-500/18 rounded-xl animate-scaleIn space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Delete this link permanently?
              </div>
              <p className="text-xs text-rose-300/70 leading-relaxed">
                This will delete <span className="font-semibold font-mono">/{url.shortCode}</span> and all its click data. This can't be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeletingConfirm(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer transition-all shadow-lg shadow-rose-600/20"
                  id={`confirm-del-${url.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveEdit} className="space-y-5 animate-fadeIn" id={`edit-form-${url.id}`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-emerald-400" />
              Edit link
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-200 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="form-section-label">Destination URL</div>
            <input
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-600 font-medium"
              placeholder="https://example.com/your-link"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="form-section-label">Custom alias</div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-zinc-600 text-sm font-semibold select-none">/</span>
                <input
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  className="w-full pl-6 pr-3 py-3 glass-input text-sm text-zinc-100 rounded-xl font-semibold focus:outline-none placeholder-zinc-600"
                  placeholder="my-link"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="form-section-label">Expires on</div>
              <input
                type="datetime-local"
                value={editExpiry}
                onChange={(e) => setEditExpiry(e.target.value)}
                className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="form-section-label flex items-center gap-1.5">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                Password
              </div>
              <div className="relative">
                <input
                  type={showEditPwd ? "text" : "password"}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 glass-input text-sm text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-600"
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPwd(!showEditPwd)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                >
                  {showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="form-section-label flex items-center gap-1.5">
                <Tag className="w-2.5 h-2.5 text-emerald-400" />
                Tags
              </div>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full px-4 py-3 glass-input text-sm text-zinc-100 rounded-xl focus:outline-none placeholder-zinc-600"
                placeholder="marketing, social"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-4">
            <button
              type="button"
              onClick={() => setEditIsActive(!editIsActive)}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] hover:border-emerald-500/15 transition select-none cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-zinc-200">Active</div>
                <div className="text-[10px] text-zinc-500">Enable redirects</div>
              </div>
              {editIsActive
                ? <ToggleRight className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                : <ToggleLeft className="w-7 h-7 text-zinc-600 group-hover:scale-110 transition-transform" />
              }
            </button>

            <button
              type="button"
              onClick={() => setEditIsPublic(!editIsPublic)}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] hover:border-emerald-500/15 transition select-none cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-zinc-200">Public</div>
                <div className="text-[10px] text-zinc-500">Show analytics</div>
              </div>
              {editIsPublic
                ? <ToggleRight className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                : <ToggleLeft className="w-7 h-7 text-zinc-600 group-hover:scale-110 transition-transform" />
              }
            </button>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2 justify-end border-t border-white/[0.05] pt-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-white/[0.04] rounded-xl cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-bold text-white btn-glow disabled:opacity-50 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
