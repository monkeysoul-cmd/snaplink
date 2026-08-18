import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Link2,
  Search, Star, SlidersHorizontal, PlusCircle, X
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlItem } from "../types.js";
import { UrlCard } from "../components/UrlCard.js";
import { UrlListSkeleton } from "../components/Skeletons.js";
import { useEffect } from "react";

export const LinksPage: React.FC = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [favorite, setFavorite] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUrls, setTotalUrls] = useState<number>(0);

  const hasActiveFilters = search || tag || favorite || sort !== "createdAt_desc";

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const data = await api.url.list({
        search: search.trim() || undefined,
        tag: tag.trim() || undefined,
        favorite: favorite || undefined,
        sort, page, limit,
      });
      setUrls(data.urls);
      setTotalPages(data.pagination.pages);
      setTotalUrls(data.pagination.total);
    } catch (err: any) {
      toast.error("Couldn't load your links.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUrls(); }, [search, tag, favorite, sort, page]);

  const handleFilterChange = () => setPage(1);
  const handleClearFilters = () => {
    setSearch(""); setTag(""); setFavorite(false); setSort("createdAt_desc"); setPage(1);
    toast.success("Filters cleared!");
  };

  const sortOptions = [
    { value: "createdAt_desc", label: "Newest first" },
    { value: "createdAt_asc",  label: "Oldest first" },
    { value: "clicks_desc",    label: "Most clicked" },
    { value: "clicks_asc",     label: "Least clicked" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="links-page-title">
            Your links
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            All your shortened links in one place.
          </p>
        </div>
        <button
          onClick={() => { window.location.hash = "#/create"; }}
          className="px-4 py-2.5 btn-glow text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          New Link
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="premium-card p-4 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
            className="w-full pl-11 pr-10 py-3 glass-input text-sm text-zinc-100 rounded-xl font-medium placeholder-zinc-600 focus:outline-none"
            placeholder="Search links, aliases, or URLs..."
            id="url-search-input"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); handleFilterChange(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips + Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold uppercase tracking-wider shrink-0">
            <SlidersHorizontal className="w-3 h-3" />
            Filters:
          </div>

          {/* Favorites chip */}
          <button
            onClick={() => { setFavorite(!favorite); handleFilterChange(); }}
            className={`filter-chip ${favorite ? 'filter-chip-active' : ''}`}
            id="fav-filter-btn"
          >
            <Star className={`w-3 h-3 ${favorite ? 'fill-current' : ''}`} />
            Favorites
          </button>

          {/* Tag filter */}
          <input
            type="text"
            value={tag}
            onChange={(e) => { setTag(e.target.value); handleFilterChange(); }}
            className="px-3 py-1.5 glass-input text-[11px] text-zinc-200 rounded-full w-28 sm:w-32 font-semibold placeholder-zinc-600 focus:outline-none"
            placeholder="Tag filter..."
            id="url-tag-input"
          />

          {/* Sort select */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
              className="filter-chip pr-6 cursor-pointer focus:outline-none"
              id="url-sort-select"
              style={{ paddingRight: '1.5rem' }}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-900 text-zinc-100">{o.label}</option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="filter-chip filter-chip-active text-rose-400 border-rose-500/25 hover:border-rose-500/40"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <UrlListSkeleton />
      ) : urls.length === 0 ? (
        <div className="premium-card p-12 text-center space-y-5 max-w-lg mx-auto mt-4">
          <div className="empty-state-icon">
            <Link2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-zinc-200 font-display">No links found</h3>
            <p className="text-sm text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              {search || tag || favorite
                ? "No links match your filters. Try clearing them."
                : "You haven't shortened any links yet. Let's fix that!"}
            </p>
          </div>
          {!search && !tag && !favorite && (
            <button
              onClick={() => { window.location.hash = "#/create"; }}
              className="px-5 py-2.5 btn-glow text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Create your first link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Count row */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-zinc-500 font-semibold">
              Showing <span className="text-zinc-300 font-bold">{urls.length}</span> of <span className="text-zinc-300 font-bold">{totalUrls}</span> links
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4">
            {urls.map((item, i) => (
              <div
                key={item.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <UrlCard url={item} onUpdate={fetchUrls} onDelete={fetchUrls} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="page-btn"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page number buttons */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="page-btn"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
