/**
 * Helper utilities for generating short codes, validating URLs, and parsing browser/device info.
 */

// Generate a random Base62 short code of length 6
export function generateShortCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const FORBIDDEN_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::",
  "169.254.169.254", // Cloud instance metadata (AWS, GCP, Azure, DigitalOcean)
  "metadata.google.internal",
  "instance-data",
]);

// URL validation that blocks private networks, localhost, and cloud metadata
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    
    // Check forbidden hostnames
    if (FORBIDDEN_HOSTS.has(hostname)) {
      return false;
    }
    
    // Disallow internal domain extensions
    if (hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname.endsWith(".lan")) {
      return false;
    }

    // Disallow RFC1918 private IPv4 ranges (10.x, 127.x, 169.254.x, 192.168.x, 172.16-31.x)
    if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return false;
    }

    // Ensure hostname is a valid dot-separated domain
    if (!hostname.includes(".")) {
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

// Clean and normalize URLs (add http if missing)
export function normalizeUrl(url: string): string {
  let cleaned = url.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  US: "United States",
  IN: "India",
  GB: "United Kingdom",
  DE: "Germany",
  CA: "Canada",
  AU: "Australia",
  FR: "France",
  JP: "Japan",
  SG: "Singapore",
  BR: "Brazil",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  SE: "Sweden",
  CH: "Switzerland",
  MX: "Mexico",
  ZA: "South Africa",
  AE: "United Arab Emirates",
  KR: "South Korea",
  NZ: "New Zealand",
};

// Parser for User-Agent to extract browser, device, and country
export function parseUserAgent(userAgentString: string = "", clientCountryHeader?: string) {
  const ua = userAgentString.toLowerCase();
  
  // Browser detection (check specialized Chromium engines before generic Chrome)
  let browser = "Other";
  if (ua.includes("edge") || ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";
  else if (ua.includes("firefox") || ua.includes("fxios")) browser = "Firefox";
  else if (ua.includes("chrome") || ua.includes("crios")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";
  
  // Device detection (properly distinguish tablet from mobile)
  let device = "Desktop";
  if (ua.includes("ipad") || ua.includes("tablet") || (ua.includes("android") && !ua.includes("mobi"))) {
    device = "Tablet";
  } else if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) {
    device = "Mobile";
  }

  // Country detection: prioritize real reverse-proxy country headers (Vercel, Cloudflare)
  let country: string;
  if (clientCountryHeader && typeof clientCountryHeader === "string") {
    const code = clientCountryHeader.trim().toUpperCase();
    country = COUNTRY_CODE_MAP[code] || code;
  } else {
    // Fallback simulation for local dev/testing
    const fallbackCountries = ["United States", "India", "United Kingdom", "Germany", "Canada", "Australia", "France", "Japan", "Singapore", "Brazil"];
    country = fallbackCountries[Math.floor(Math.random() * fallbackCountries.length)];
  }

  return { browser, device, country };
}
