/**
 * Short URL helper functions for SnapLink.
 * Displays clean short domain (e.g. snaplink.app/shortCode or custom domain set via VITE_SHORT_DOMAIN).
 */

export const getShortDomain = (): string => {
  const envDomain = (import.meta as any).env?.VITE_SHORT_DOMAIN || (import.meta as any).env?.VITE_APP_URL;
  if (envDomain && typeof envDomain === "string" && envDomain.trim() !== "") {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.host) {
    return window.location.host;
  }
  return "url-shortner-lilac-seven.vercel.app";
};

export const getDisplayShortUrl = (shortCode: string): string => {
  const envDomain = (import.meta as any).env?.VITE_SHORT_DOMAIN;
  if (envDomain && typeof envDomain === "string" && envDomain.trim() !== "") {
    const cleanDomain = envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${cleanDomain}/${shortCode}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/${shortCode}`;
  }
  return `https://url-shortner-lilac-seven.vercel.app/${shortCode}`;
};

export const getRedirectUrl = (shortCode: string): string => {
  return `/${shortCode}`;
};
