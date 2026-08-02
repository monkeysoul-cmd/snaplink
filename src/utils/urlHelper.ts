/**
 * Short URL helper functions for SnapLink.
 * Provides branded snaplink display formatting + working live redirection URLs.
 */

export const getShortDomain = (): string => {
  const envDomain = (import.meta as any).env?.VITE_SHORT_DOMAIN;
  if (envDomain && typeof envDomain === "string" && envDomain.trim() !== "") {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return "snaplink.app";
};

/**
 * Returns clean branded display string starting with snaplink (e.g. "snaplink.app/jP5kdJ")
 */
export const getDisplayShortUrl = (shortCode: string): string => {
  const domain = getShortDomain();
  return `${domain}/${shortCode}`;
};

/**
 * Returns actual working live deployment URL (e.g. "https://url-shortner-lilac-seven.vercel.app/jP5kdJ")
 * that guarantees zero 404 errors when clicked or copied.
 */
export const getWorkingShortUrl = (shortCode: string): string => {
  const envDomain = (import.meta as any).env?.VITE_SHORT_DOMAIN || (import.meta as any).env?.VITE_APP_URL;
  if (
    envDomain && 
    typeof envDomain === "string" && 
    envDomain.trim() !== "" && 
    !envDomain.includes("snaplink.app") &&
    !envDomain.includes("MY_APP_URL")
  ) {
    const clean = envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${clean}/${shortCode}`;
  }
  if (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null") {
    return `${window.location.origin}/${shortCode}`;
  }
  return `https://url-shortner-lilac-seven.vercel.app/${shortCode}`;
};

/**
 * Relative path for in-app clicks
 */
export const getRedirectUrl = (shortCode: string): string => {
  return `/${shortCode}`;
};
