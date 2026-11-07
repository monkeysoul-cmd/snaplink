import React from "react";
import { BarChart3, LayoutDashboard, Link2, PlusCircle, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";

interface SidebarProps {
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const { logout } = useAuth();

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  const navItems = [
    {
      label: "Overview",
      path: "#/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Link",
      path: "#/create",
      icon: PlusCircle,
    },
    {
      label: "My Links",
      path: "#/links",
      icon: Link2,
    },
    {
      label: "Analytics",
      path: "#/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      path: "#/profile",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar — Fixed to viewport left */}
      <aside
        className="hidden md:flex flex-col w-64 fixed top-0 left-0 bottom-0 z-30 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#0c0d12]/75 backdrop-blur-2xl p-4 justify-between select-none shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none overflow-y-auto"
      >
        <div className="flex flex-col gap-1">
          {/* ── Logo ── */}
          <button
            onClick={() => handleNavigate("#/")}
            className="flex items-center gap-2.5 px-3 py-2 mb-6 mt-1 rounded-xl text-left cursor-pointer group transition-opacity hover:opacity-80"
            id="sidebar-logo"
            aria-label="Go home"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-white">
              SnapLink
            </span>
          </button>

          <div className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Navigation
          </div>

          <nav className="flex flex-col gap-1" aria-label="Sidebar navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-zinc-900/5 dark:bg-white/[0.08] text-zinc-900 dark:text-white shadow-xs border border-zinc-900/10 dark:border-white/10 backdrop-blur-md"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent"
                  }`}
                  id={`sidebar-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent"
          id="sidebar-logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log out</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-[#0c0d12]/85 backdrop-blur-2xl border-t border-black/[0.06] dark:border-white/[0.08] z-40 flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] dark:shadow-none"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))', paddingTop: '0.5rem', minHeight: '3.75rem' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "text-zinc-900 dark:text-white font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              id={`mobile-nav-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
              <span className="text-[11px] leading-none">{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />}
            </button>
          );
        })}
      </nav>
    </>
  );
};
