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

// Simple URL validation regex
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
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

// Simple parser for User-Agent to extract browser, device, and OS
export function parseUserAgent(userAgentString: string = "") {
  const ua = userAgentString.toLowerCase();
  
  // Browser detection
  let browser = "Other";
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("chrome") && !ua.includes("chromium")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edge") || ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";
  
  // Device detection
  let device = "Desktop";
  if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) {
    device = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    device = "Tablet";
  }

  // Country simulation (mocked from request or randomized for demo diversity)
  const countries = ["United States", "India", "United Kingdom", "Germany", "Canada", "Australia", "France", "Japan", "Singapore", "Brazil"];
  const country = countries[Math.floor(Math.random() * countries.length)];

  return { browser, device, country };
}
