import React, { useEffect, useRef } from "react";
import { BarChart3, LayoutDashboard, Link, PlusCircle, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";

interface SidebarProps {
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  // Staggered entrance for nav items
  useEffect(() => {
    const items = sidebarRef.current?.querySelectorAll(".nav-item");
    items?.forEach((el, i) => {
      const item = el as HTMLElement;
      item.style.opacity = "0";
      item.style.transform = "translateX(-14px)";
      setTimeout(() => {
        item.style.transition = "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      }, 80 + i * 60);
    });
  }, []);

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
      <aside ref={sidebarRef} className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/[0.06] bg-white dark:bg-[#060612]/50 dark:backdrop-blur-sm h-[calc(100vh-4rem)] p-4 sticky top-16 justify-between select-none shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none">
        <div className="flex flex-col gap-1">
          <div className="px-3 mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Menu
          </div>

          {navItems.map((item, idx) => {
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{ transitionDelay: `${idx * 20}ms` }}
                className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer group relative ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/10 dark:from-emerald-600/15 to-teal-600/5 dark:to-teal-600/10 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/20 dark:border-emerald-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent hover:border-white/[0.04] hover:scale-[1.02] hover:shadow-sm"
                }`}
                id={`sidebar-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Active shimmer sweep */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-0 opacity-0 animate-[shimmer-slide_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-emerald-400/[0.06] to-transparent" />
                  </span>
                )}

                <span className={`text-base transition-all duration-300 ${isActive ? "scale-125 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "group-hover:scale-110 group-hover:rotate-6"}`}>
                  {item.emoji}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Logout */}
        <button
          onClick={logout}
          className="nav-item flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-zinc-600 dark:text-zinc-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer border border-transparent hover:border-rose-500/15 hover:scale-[1.02] group"
          id="sidebar-logout"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
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
                  ? "text-emerald-600 dark:text-emerald-400 scale-110"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:scale-105"
              }`}
              id={`mobile-nav-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className={`text-lg ${isActive ? "drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] scale-125" : ""} transition-all duration-300`}>{item.emoji}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />}
            </button>
          );
        })}
      </nav>
    </>
  );
};
