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

export const getShortDomain = (): string => {
  const envDomain = getEnvVar("VITE_SHORT_DOMAIN") || getEnvVar("VITE_APP_URL");
  if (envDomain && envDomain.trim() !== "" && !envDomain.includes("MY_APP_URL")) {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
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
 *   1. VITE_APP_URL or VITE_SHORT_DOMAIN env var (set in Vercel dashboard)
 *   2. window.location.origin (correct on any real deployment)
 *   3. Hardcoded fallback to snaplink.vercel.app
 */
export const getWorkingShortUrl = (shortCode?: string): string => {
  const code = shortCode || "";
  const envDomain = getEnvVar("VITE_APP_URL") || getEnvVar("VITE_SHORT_DOMAIN");

  // 1. Use configured env domain if it's a real, non-placeholder value
  if (envDomain && envDomain.trim() !== "" && !envDomain.includes("MY_APP_URL")) {
    const clean = envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${clean}/${code}`;
  }

  // 2. Use the current host (works perfectly on any Vercel / production deployment)
  if (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null") {
    return `${window.location.origin}/${code}`;
  }

  // 3. Hardcoded fallback
  return `https://snaplink.vercel.app/${code}`;
};

/**
 * Relative path for in-app navigation
 */
export const getRedirectUrl = (shortCode?: string): string => {
  return `/${shortCode || ""}`;
};
