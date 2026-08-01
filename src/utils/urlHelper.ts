/**
 * Short URL helper functions for SnapLink.
 * Displays clean short domain (e.g. snaplink.app/shortCode or custom domain set via VITE_SHORT_DOMAIN).
 */

export const getShortDomain = (): string => {
  const envDomain = (import.meta as any).env?.VITE_SHORT_DOMAIN;
  if (envDomain && typeof envDomain === "string" && envDomain.trim() !== "") {
    return envDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return "snaplink.app";
};

export const getDisplayShortUrl = (shortCode: string): string => {
  const domain = getShortDomain();
  return `https://${domain}/${shortCode}`;
};

export const getRedirectUrl = (shortCode: string): string => {
  return `/${shortCode}`;
};
