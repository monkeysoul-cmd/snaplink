/**
 * Short URL helper functions for SnapLink.
 * Safe env reader prevents module-level crashes across all browsers & runtime environments.
 */

const getEnvVar = (key: string): string => {
  try {
    const meta = import.meta as any;
    if (meta && meta.env) {
      const val = meta.env[key];
      if (typeof val === "string") return val;
    }
  } catch {
    // Fail gracefully
  }
  return "";
};

const isLocalHost = (hostname?: string): boolean => {
  if (!hostname) return false;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local") ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
};

export const getShortDomain = (): string => {
  // If running locally, prioritize local host
  if (typeof window !== "undefined" && isLocalHost(window.location?.hostname)) {
    return window.location.host;
  }

  const envDomain = getEnvVar("VITE_SHORT_DOMAIN") || getEnvVar("VITE_APP_URL");
  if (envDomain && envDomain.trim() !== "" && !envDomain.includes("MY_APP_URL")) {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.host && window.location.host !== "null") {
    return window.location.host;
  }

  return "snaplink.vercel.app";
};

/**
 * Returns clean branded display string (e.g. "snaplink.vercel.app/jP5kdJ")
 */
export const getDisplayShortUrl = (shortCode?: string): string => {
  const code = shortCode || "";
  const domain = getShortDomain();
  return `${domain}/${code}`;
};

/**
 * Returns actual working live URL (e.g. "https://snaplink.vercel.app/jP5kdJ")
 * Priority:
 *   1. local network / localhost (ensures local dev links route to local server)
 *   2. VITE_APP_URL or VITE_SHORT_DOMAIN env var (set in Vercel dashboard)
 *   3. window.location.origin (correct on any real deployment)
 *   4. Hardcoded fallback to snaplink.vercel.app
 */
export const getWorkingShortUrl = (shortCode?: string): string => {
  const code = shortCode || "";

  // 1. If running locally, prioritize local server origin
  if (typeof window !== "undefined" && isLocalHost(window.location?.hostname)) {
    return `${window.location.origin}/${code}`;
  }

  const envDomain = getEnvVar("VITE_APP_URL") || getEnvVar("VITE_SHORT_DOMAIN");

  // 2. Use configured env domain if it's a real, non-placeholder value
  if (envDomain && envDomain.trim() !== "" && !envDomain.includes("MY_APP_URL")) {
    const clean = envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${clean}/${code}`;
  }

  // 3. Use the current host (works perfectly on any Vercel / production deployment)
  if (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null") {
    return `${window.location.origin}/${code}`;
  }

  // 4. Hardcoded fallback
  return `https://snaplink.vercel.app/${code}`;
};

/**
 * Relative path for in-app navigation
 */
export const getRedirectUrl = (shortCode?: string): string => {
  return `/${shortCode || ""}`;
};
