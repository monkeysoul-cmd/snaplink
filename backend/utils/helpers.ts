/**
 * Helper utilities for generating short codes, validating URLs, anonymizing IPs, and parsing browser/device info.
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

// URL validation that blocks SSRF, private networks, localhost, and cloud metadata
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Normalize hostname: lowercase and strip trailing dots (e.g. "localhost." -> "localhost")
    const hostname = parsed.hostname.toLowerCase().replace(/\.+$/, "");

    // Check forbidden hostnames
    if (FORBIDDEN_HOSTS.has(hostname)) {
      return false;
    }

    // Disallow internal domain extensions
    if (
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home.arpa") ||
      hostname.endsWith(".localhost")
    ) {
      return false;
    }

    // IPv6 literal checks (e.g. [::1], [fe80:...], [fc00:...], [fd00:...], [::ffff:...])
    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      const ipv6 = hostname.slice(1, -1).toLowerCase();
      if (
        ipv6 === "::1" ||
        ipv6 === "::" ||
        ipv6.startsWith("fe80:") ||
        ipv6.startsWith("fc") ||
        ipv6.startsWith("fd") ||
        ipv6.startsWith("::ffff:") ||
        ipv6.startsWith("0:0:0:0:0:ffff:")
      ) {
        return false;
      }
    }

    // Disallow private, loopback, link-local, carrier-grade NAT, and reserved IPv4 ranges:
    // 0.0.0.0/8 (Current network)
    // 10.0.0.0/8 (RFC 1918 Private)
    // 100.64.0.0/10 (RFC 6598 Shared Address Space / CGNAT)
    // 127.0.0.0/8 (RFC 1122 Loopback)
    // 169.254.0.0/16 (RFC 3927 Link-Local / Cloud Metadata)
    // 172.16.0.0/12 (RFC 1918 Private)
    // 192.0.0.0/24 (RFC 6890 IETF Protocol Assignments)
    // 192.0.2.0/24 (RFC 5737 TEST-NET-1)
    // 192.168.0.0/16 (RFC 1918 Private)
    // 198.18.0.0/15 (RFC 2544 Benchmarking)
    // 198.51.100.0/24 (RFC 5737 TEST-NET-2)
    // 203.0.113.0/24 (RFC 5737 TEST-NET-3)
    // 224.0.0.0/4 (RFC 5771 Multicast)
    // 240.0.0.0/4 (RFC 1112 Reserved / Future use)
    // 255.255.255.255 (Broadcast)
    if (
      /^(0\.|10\.|127\.|169\.254\.|192\.168\.|192\.0\.|198\.51\.100\.|203\.0\.113\.|255\.255\.255\.255)/.test(hostname) ||
      /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^198\.(1[8-9])\./.test(hostname) ||
      /^(22[4-9]|23[0-9]|24[0-9]|25[0-5])\./.test(hostname)
    ) {
      return false;
    }

    // Ensure hostname is a valid dot-separated domain (or bracketed valid public IPv6)
    if (!hostname.includes(".") && !hostname.startsWith("[")) {
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

// Clean and normalize URLs (add https if missing scheme)
export function normalizeUrl(url: string): string {
  let cleaned = url.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

// Anonymize IP address for GDPR / privacy compliance (zero out last octet for IPv4, prefix-only for IPv6)
export function anonymizeIp(ip: string): string {
  if (!ip) return "0.0.0.0";
  const trimmed = ip.trim();
  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    return parts.slice(0, 3).join(":") + "::";
  }
  return "0.0.0.0";
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
  let country = "Unknown";
  if (clientCountryHeader && typeof clientCountryHeader === "string") {
    const code = clientCountryHeader.trim().toUpperCase();
    country = COUNTRY_CODE_MAP[code] || (code.length === 2 ? code : "Unknown");
  } else if (process.env.NODE_ENV !== "production") {
    country = "Local";
  }

  return { browser, device, country };
}
