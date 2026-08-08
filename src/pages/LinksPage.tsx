import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, ChevronRight, Link, 
  Search, Star
} from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { UrlItem } from "../types.js";
import { UrlCard } from "../components/UrlCard.js";
import { UrlListSkeleton } from "../components/Skeletons.js";

export const LinksPage: React.FC = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [favorite, setFavorite] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUrls, setTotalUrls] = useState<number>(0);

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const data = await api.url.list({
        search: search.trim() || undefined,
        tag: tag.trim() || undefined,
        favorite: favorite || undefined,
        sort,
        page,
        limit,
      });
      setUrls(data.urls);
      setTotalPages(data.pagination.pages);
      setTotalUrls(data.pagination.total);
    } catch (err: any) {
      console.error(err);
      toast.error("Couldn't load your links.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [search, tag, favorite, sort, page]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setTag("");
    setFavorite(false);
    setSort("createdAt_desc");
    setPage(1);
    toast.success("Filters cleared!");
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 lg:p-8 text-zinc-100 transition-colors min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display" id="links-page-title">
          Your links
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          All your shortened links in one place. Search, filter, and manage them.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm text-zinc-100 rounded-xl font-medium placeholder-zinc-600 focus:outline-none"
            placeholder="Search your links..."
            id="url-search-input"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              handleFilterChange();
            }}
            className="px-3.5 py-2.5 glass-input text-xs text-zinc-100 rounded-xl max-w-[120px] font-semibold placeholder-zinc-600 focus:outline-none"
            placeholder="Filter by tag"
            id="url-tag-input"
          />

          <button
            onClick={() => {
              setFavorite(!favorite);
              handleFilterChange();
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              favorite
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "glass-input text-zinc-400 hover:text-zinc-200 hover:border-violet-500/20"
            }`}
            id="fav-filter-btn"
          >
            <Star className={`w-3.5 h-3.5 ${favorite ? "fill-current text-amber-400" : ""}`} />
            Favorites
          </button>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              handleFilterChange();
            }}
            className="appearance-none px-4 py-2.5 glass-input rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
            id="url-sort-select"
          >
            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="clicks_desc">Most clicked</option>
            <option value="clicks_asc">Least clicked</option>
          </select>

          {(search || tag || favorite || sort !== "createdAt_desc") && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-zinc-500 hover:text-rose-400 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Links */}
      {isLoading ? (
        <UrlListSkeleton />
      ) : urls.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-6">
          <div className="text-4xl">🔗</div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-200 font-display">No links found</h3>
            <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              {search || tag || favorite
                ? "No links match your filters. Try clearing them."
                : "You haven't shortened any links yet. Let's fix that!"}
            </p>
          </div>
          <button
            onClick={() => {
              window.location.hash = "#/create";
            }}
            className="px-4 py-2 btn-gradient text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-violet-600/15 cursor-pointer"
          >
            <span className="relative z-10">Create your first link</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-xs text-zinc-500 font-bold px-1 uppercase tracking-wider">
            Showing {urls.length} of {totalUrls} links
          </div>

          <div className="grid grid-cols-1 gap-4">
            {urls.map((item) => (
              <UrlCard key={item.id} url={item} onUpdate={fetchUrls} onDelete={fetchUrls} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 select-none">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 glass-card rounded-xl hover:border-violet-500/20 disabled:opacity-40 transition cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-300" />
              </button>

              <span className="text-xs font-semibold text-zinc-500">
                Page <span className="font-bold text-zinc-200">{page}</span> of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 glass-card rounded-xl hover:border-violet-500/20 disabled:opacity-40 transition cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
