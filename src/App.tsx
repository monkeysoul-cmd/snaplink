import React, { useEffect, useState, Suspense } from "react";
import { Link2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";

// Route Loaders for Code Splitting & Preloading
export const routeLoaders = {
  landing: () => import("./pages/LandingPage.js").then((m) => ({ default: m.LandingPage })),
  login: () => import("./pages/LoginPage.js").then((m) => ({ default: m.LoginPage })),
  register: () => import("./pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage })),
  dashboard: () => import("./pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage })),
  create: () => import("./pages/CreateUrlPage.js").then((m) => ({ default: m.CreateUrlPage })),
  links: () => import("./pages/LinksPage.js").then((m) => ({ default: m.LinksPage })),
  analytics: () => import("./pages/AnalyticsPage.js").then((m) => ({ default: m.AnalyticsPage })),
  profile: () => import("./pages/ProfilePage.js").then((m) => ({ default: m.ProfilePage })),
  unlock: () => import("./pages/UnlockPage.js").then((m) => ({ default: m.UnlockPage })),
  notFound: () => import("./pages/NotFoundPage.js").then((m) => ({ default: m.NotFoundPage })),
};

// Lazy loaded page components
const LandingPage = React.lazy(routeLoaders.landing);
const LoginPage = React.lazy(routeLoaders.login);
const RegisterPage = React.lazy(routeLoaders.register);
const DashboardPage = React.lazy(routeLoaders.dashboard);
const CreateUrlPage = React.lazy(routeLoaders.create);
const LinksPage = React.lazy(routeLoaders.links);
const AnalyticsPage = React.lazy(routeLoaders.analytics);
const ProfilePage = React.lazy(routeLoaders.profile);
const UnlockPage = React.lazy(routeLoaders.unlock);
const NotFoundPage = React.lazy(routeLoaders.notFound);

// Preload route on hover / intent
export const preloadRoute = (path: string) => {
  if (path.includes("dashboard")) routeLoaders.dashboard();
  else if (path.includes("create")) routeLoaders.create();
  else if (path.includes("links")) routeLoaders.links();
  else if (path.includes("analytics")) routeLoaders.analytics();
  else if (path.includes("profile")) routeLoaders.profile();
  else if (path.includes("login")) routeLoaders.login();
  else if (path.includes("register")) routeLoaders.register();
};

const PageFallback: React.FC = () => (
  <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn">
    <div className="h-8 w-44 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-xl animate-pulse" />
    <div className="h-44 rounded-2xl bg-zinc-100/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 animate-pulse" />
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash && hash !== "#" && hash !== "#/") return hash;
    const pathname = window.location.pathname;
    if (pathname && pathname !== "/") {
      return `#${pathname}`;
    }
    return "#/";
  });

  // Sync hash changes to local path state and handle direct pathname entries
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || "#/");
    };

    if ((!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") && window.location.pathname !== "/") {
      const knownPrefixes = ["/dashboard", "/create", "/links", "/analytics", "/profile", "/login", "/register", "/unlock", "/404"];
      if (knownPrefixes.some((p) => window.location.pathname.startsWith(p))) {
        window.location.hash = `#${window.location.pathname}`;
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Preload primary logged-in routes in the background during idle time
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        routeLoaders.dashboard();
        routeLoaders.links();
        routeLoaders.create();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Global power user keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      );

      if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!isAuthenticated) return;

      const key = e.key.toLowerCase();
      if (key === "c" || key === "n") {
        e.preventDefault();
        window.location.hash = "#/create";
      } else if (key === "d") {
        e.preventDefault();
        window.location.hash = "#/dashboard";
      } else if (key === "l") {
        e.preventDefault();
        window.location.hash = "#/links";
      } else if (key === "a") {
        e.preventDefault();
        window.location.hash = "#/analytics";
      } else if (key === "p") {
        e.preventDefault();
        window.location.hash = "#/profile";
      } else if (e.key === "/") {
        e.preventDefault();
        window.location.hash = "#/links";
        setTimeout(() => {
          document.getElementById("url-search-input")?.focus();
        }, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  // Global loading state on app mount/session validation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060612] flex flex-col items-center justify-center gap-4 text-zinc-600 dark:text-zinc-400 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
          <Link2 className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Loading SnapLink...</span>
      </div>
    );
  }

  // Parse path and route variables, stripping query strings and trailing slashes
  const cleanPath = (currentPath.split("?")[0] || "#/").replace(/\/+$/, "");
  let viewPath = cleanPath === "" || cleanPath === "#" ? "#/" : cleanPath;

  if (viewPath.startsWith("#/unlock")) {
    viewPath = "#/unlock";
  }

  // Determine if path is part of private dashboard area
  const privatePaths = ["#/dashboard", "#/create", "#/links", "#/analytics", "#/profile"];
  const isPrivatePath = privatePaths.includes(viewPath);

  // Authenticated Route Protection
  if (isPrivatePath && !isAuthenticated) {
    window.location.hash = "#/login";
    return null;
  }

  // Also redirect logged-in users away from auth pages
  if (isAuthenticated && (viewPath === "#/login" || viewPath === "#/register")) {
    window.location.hash = "#/dashboard";
    return null;
  }

  // Router matching logic
  const renderPage = () => {
    switch (viewPath) {
      case "#/":
        return <LandingPage />;
      case "#/login":
        return <LoginPage />;
      case "#/register":
        return <RegisterPage />;
      case "#/dashboard":
        return <DashboardPage />;
      case "#/create":
        return <CreateUrlPage />;
      case "#/links":
        return <LinksPage />;
      case "#/analytics":
        return <AnalyticsPage />;
      case "#/profile":
        return <ProfilePage />;
      case "#/unlock":
        return <UnlockPage />;
      case "#/404":
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060612] text-zinc-900 dark:text-zinc-100 transition-colors flex flex-col font-sans relative">
      <Navbar isPrivatePath={isPrivatePath} currentPath={currentPath} />

      {/* Main Container Layout */}
      {isPrivatePath ? (
        // Dashboard Shell layout (Fixed Sidebar + Scrolling Main Content)
        <div className="flex-1 w-full min-w-0 md:pl-64 flex flex-col pb-16 md:pb-0">
          <Sidebar currentPath={currentPath} />
          <main className="flex-1 w-full max-w-7xl mx-auto min-w-0">
            <Suspense fallback={<PageFallback />}>
              {renderPage()}
            </Suspense>
          </main>
        </div>
      ) : (
        // Guest pages layout (Home, login, unlock, register)
        <main className="flex-1 min-w-0">
          <Suspense fallback={<PageFallback />}>
            {renderPage()}
          </Suspense>
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
