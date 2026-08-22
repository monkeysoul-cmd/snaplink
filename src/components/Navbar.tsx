import React, { useState, useEffect, useRef } from "react";
import { LogIn, LogOut, UserPlus, Menu, X, LayoutDashboard, Scissors, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { ThemeToggle } from "./ThemeToggle.js";

interface NavbarProps {
  isPrivatePath?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isPrivatePath = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll-aware: add shadow & denser glass on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileOpen]);

  // Close mobile menu on hash change (navigation)
  useEffect(() => {
    const handler = () => setMobileOpen(false);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setMobileOpen(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  const currentHash = window.location.hash || "#/";

  const navLinks = isAuthenticated
    ? [
        { label: "Dashboard", path: "#/dashboard", icon: LayoutDashboard },
        { label: "Links", path: "#/links", icon: Scissors },
        { label: "Analytics", path: "#/analytics", icon: Zap },
      ]
    : [];

  return (
    <>
      <header
        className={`navbar-root w-full ${scrolled ? "navbar-scrolled" : ""} ${isPrivatePath ? "md:ml-64 md:w-[calc(100%-16rem)]" : ""}`}
        ref={menuRef}
      >
        {/* Animated top accent line */}
        <div className="navbar-accent-line" />

        <div className="navbar-inner">


          {/* Spacer to balance flex layout on desktop since logo is in Sidebar */}
          <div className="flex-1 hidden md:block"></div>

          {/* ── Desktop nav links (authenticated) ── */}
          {navLinks.length > 0 && (
            <nav className="navbar-links-desktop hidden md:flex flex-row items-center gap-1 shrink-0" aria-label="Main navigation">
              {navLinks.map(({ label, path, icon: Icon }) => {
                const active = currentHash.startsWith(path);
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigate(path)}
                    className={`navbar-link ${active ? "navbar-link-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                    <span className={`navbar-link-indicator ${active ? "navbar-link-indicator-active" : ""}`} />
                  </button>
                );
              })}
            </nav>
          )}

          {/* ── Right actions ── */}
          <div className="navbar-actions flex-1 justify-end">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <button
                onClick={() => handleNavigate("#/profile")}
                className="navbar-avatar-btn group ml-4 md:ml-6"
                title={user.name}
                id="nav-profile"
                aria-label="Your profile"
              >
                <div className="navbar-avatar">
                  {getInitials(user.name)}
                  <span className="navbar-avatar-ring" />
                </div>
                <span className="navbar-username">{user.name}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate("#/login")}
                  className="navbar-ghost-btn"
                  id="nav-login-btn"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Log in</span>
                </button>
                <button
                  onClick={() => handleNavigate("#/register")}
                  className="navbar-cta-btn"
                  id="nav-register-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign up</span>
                </button>
              </>
            )}

            {/* ── Hamburger (mobile) ── */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="navbar-hamburger"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className={`navbar-hamburger-icon ${mobileOpen ? "navbar-hamburger-open" : ""}`}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        <div className={`navbar-mobile-drawer ${mobileOpen ? "navbar-mobile-drawer-open" : ""}`}>
          <div className="navbar-mobile-inner">
            {/* Nav links */}
            {navLinks.length > 0 ? (
              <nav className="navbar-mobile-links" aria-label="Mobile navigation">
                {navLinks.map(({ label, path, icon: Icon }, i) => {
                  const active = currentHash.startsWith(path);
                  return (
                    <button
                      key={path}
                      onClick={() => handleNavigate(path)}
                      className={`navbar-mobile-link ${active ? "navbar-mobile-link-active" : ""}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <div className="navbar-mobile-links">
                <button
                  onClick={() => handleNavigate("#/")}
                  className="navbar-mobile-link"
                >
                  Home
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="navbar-mobile-divider" />

            {/* Auth actions */}
            {isAuthenticated && user ? (
              <div className="navbar-mobile-auth-row">
                <button
                  onClick={() => handleNavigate("#/profile")}
                  className="navbar-mobile-profile-btn"
                >
                  <div className="navbar-avatar text-xs">{getInitials(user.name)}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500">View profile</p>
                  </div>
                </button>

              </div>
            ) : (
              <div className="navbar-mobile-auth-row gap-2">
                <button
                  onClick={() => handleNavigate("#/login")}
                  className="navbar-ghost-btn flex-1 justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Log in
                </button>
                <button
                  onClick={() => handleNavigate("#/register")}
                  className="navbar-cta-btn flex-1 justify-center"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign up free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="navbar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
};
