import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";

// Page Imports
import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { CreateUrlPage } from "./pages/CreateUrlPage.js";
import { LinksPage } from "./pages/LinksPage.js";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { UnlockPage } from "./pages/UnlockPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.hash || "#/");

  // Sync hash changes to local path state
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || "#/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Global loading state on app mount/session validation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#020d0a] flex flex-col items-center justify-center gap-4 text-zinc-600 dark:text-zinc-400 transition-colors relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <span className="text-5xl animate-pulse-soft">✂️</span>
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400">Loading...</span>
      </div>
    );
  }

  // Parse path and route variables (e.g. #/unlock/code)
  let viewPath = currentPath;
  if (currentPath.startsWith("#/unlock/")) {
    viewPath = "#/unlock";
  }

  // Determine if path is part of private dashboard area
  const privatePaths = ["#/dashboard", "#/create", "#/links", "#/analytics", "#/profile"];
  const isPrivatePath = privatePaths.includes(viewPath);

  // Authenticated Route Protection
  if (isPrivatePath && !isAuthenticated) {
    // Force redirect to login page
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
    <div className="min-h-screen bg-[#060612] text-zinc-100 transition-colors flex flex-col font-sans relative">
      <Navbar />

      {/* Main Container Layout */}
      {isPrivatePath ? (
        // Dashboard Shell layout (Sidebar + main layout)
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto pb-16 md:pb-0">
          <Sidebar currentPath={currentPath} />
          <main className="flex-1 min-w-0">
            {renderPage()}
          </main>
        </div>
      ) : (
        // Guest pages layout (Home, login, unlock, register)
        <main className="flex-1">
          {renderPage()}
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
