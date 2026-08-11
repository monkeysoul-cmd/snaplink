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
  const envDomain = getEnvVar("VITE_SHORT_DOMAIN");
  if (envDomain && envDomain.trim() !== "") {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return "snaplink.app";
};

/**
 * Returns clean branded display string starting with snaplink (e.g. "snaplink.app/jP5kdJ")
 */
export const getDisplayShortUrl = (shortCode?: string): string => {
  const code = shortCode || "";
  const domain = getShortDomain();
  return `${domain}/${code}`;
};

/**
 * Returns actual working live deployment URL always starting with snaplink.app
 * (or VITE_SHORT_DOMAIN / VITE_APP_URL if configured), e.g. "https://snaplink.app/jP5kdJ"
 * Never uses window.location.origin so local dev URLs never leak into shared links.
 */
export const getWorkingShortUrl = (shortCode?: string): string => {
  const code = shortCode || "";
  const envDomain = getEnvVar("VITE_SHORT_DOMAIN") || getEnvVar("VITE_APP_URL");

  // Use configured env domain if it's a real, non-placeholder value
  if (
    envDomain &&
    envDomain.trim() !== "" &&
    !envDomain.includes("MY_APP_URL")
  ) {
    const clean = envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${clean}/${code}`;
  }

  // Always fall back to the branded snaplink.app domain
  return `https://snaplink.app/${code}`;
};

/**
 * Relative path for in-app clicks
 */
export const getRedirectUrl = (shortCode?: string): string => {
  return `/${shortCode || ""}`;
};
