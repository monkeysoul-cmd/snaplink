import React from "react";
import { BarChart3, LayoutDashboard, Link, PlusCircle, Settings, LogOut } from "lucide-react";
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
      emoji: "📋",
    },
    {
      label: "New Link",
      path: "#/create",
      icon: PlusCircle,
      emoji: "✂️",
    },
    {
      label: "My Links",
      path: "#/links",
      icon: Link,
      emoji: "🔗",
    },
    {
      label: "Analytics",
      path: "#/analytics",
      icon: BarChart3,
      emoji: "📊",
    },
    {
      label: "Settings",
      path: "#/profile",
      icon: Settings,
      emoji: "⚙️",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/[0.06] bg-white dark:bg-[#060612]/50 dark:backdrop-blur-sm h-[calc(100vh-4rem)] p-4 sticky top-16 justify-between select-none shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none">
        <div className="flex flex-col gap-1">
          <div className="px-3 mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer group ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/10 dark:from-emerald-600/15 to-teal-600/5 dark:to-teal-600/10 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/15"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent"
                }`}
                id={`sidebar-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className={`text-base transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.emoji}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-zinc-600 dark:text-zinc-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer border border-transparent hover:border-rose-500/15"
          id="sidebar-logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Log out</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#060612]/90 dark:backdrop-blur-2xl border-t border-black/5 dark:border-white/[0.06] z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)] dark:shadow-none">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              id={`mobile-nav-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className={`text-lg ${isActive ? "scale-110" : ""} transition-transform`}>{item.emoji}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
