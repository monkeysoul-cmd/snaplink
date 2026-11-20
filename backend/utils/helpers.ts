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

// Parse dotted decimal, octal, hex, or integer IPv4 into a standard 32-bit unsigned number
function parseIpv4ToNumber(hostname: string): number | null {
  const parts = hostname.split(".");
  if (parts.length < 1 || parts.length > 4) return null;
  const numbers: number[] = [];
  for (const part of parts) {
    let num: number;
    if (/^0x[0-9a-f]+$/i.test(part)) {
      num = parseInt(part, 16);
    } else if (/^0[0-7]+$/.test(part)) {
      num = parseInt(part, 8);
    } else if (/^\d+$/.test(part)) {
      num = parseInt(part, 10);
    } else {
      return null;
    }
    if (isNaN(num) || num < 0) return null;
    numbers.push(num);
  }

  let ip = 0;
  if (numbers.length === 1) {
    if (numbers[0] > 0xffffffff) return null;
    ip = numbers[0];
  } else if (numbers.length === 2) {
    if (numbers[0] > 0xff || numbers[1] > 0xffffff) return null;
    ip = ((numbers[0] << 24) | numbers[1]) >>> 0;
  } else if (numbers.length === 3) {
    if (numbers[0] > 0xff || numbers[1] > 0xff || numbers[2] > 0xffff) return null;
    ip = ((numbers[0] << 24) | (numbers[1] << 16) | numbers[2]) >>> 0;
  } else if (numbers.length === 4) {
    if (numbers.some(n => n > 0xff)) return null;
    ip = ((numbers[0] << 24) | (numbers[1] << 16) | (numbers[2] << 8) | numbers[3]) >>> 0;
  }
  return ip >>> 0;
}

function isPrivateIpv4(ip: number): boolean {
  // 0.0.0.0/8 (Current network)
  if (ip <= 0x00ffffff) return true;
  // 10.0.0.0/8 (Private)
  if (ip >= 0x0a000000 && ip <= 0x0affffff) return true;
  // 100.64.0.0/10 (CGNAT / Shared Address Space)
  if (ip >= 0x64400000 && ip <= 0x647fffff) return true;
  // 127.0.0.0/8 (Loopback)
  if (ip >= 0x7f000000 && ip <= 0x7fffffff) return true;
  // 169.254.0.0/16 (Link-Local / Cloud Instance Metadata)
  if (ip >= 0xa9fe0000 && ip <= 0xa9feffff) return true;
  // 172.16.0.0/12 (Private)
  if (ip >= 0xac100000 && ip <= 0xac1fffff) return true;
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (ip >= 0xc0000000 && ip <= 0xc00000ff) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (ip >= 0xc0000200 && ip <= 0xc00002ff) return true;
  // 192.168.0.0/16 (Private)
  if (ip >= 0xc0a80000 && ip <= 0xc0a8ffff) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (ip >= 0xc6120000 && ip <= 0xc613ffff) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (ip >= 0xc6336400 && ip <= 0xc63364ff) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (ip >= 0xcb007100 && ip <= 0xcb0071ff) return true;
  // 224.0.0.0/4 (Multicast)
  if (ip >= 0xe0000000 && ip <= 0xefffffff) return true;
  // 240.0.0.0/4 (Reserved / Future Use)
  if (ip >= 0xf0000000 && ip <= 0xffffffff) return true;
  // 255.255.255.255 (Broadcast)
  if (ip === 0xffffffff) return true;

  return false;
}

// URL validation that blocks SSRF, private networks, localhost, DNS rebinding, and cloud metadata
export function isValidUrl(url: string): boolean {
  try {
    // Reject control characters, newlines, and null bytes to prevent header injection
    if (/[\x00-\x1F\x7F]/.test(url)) {
      return false;
    }

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
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".localdomain")
    ) {
      return false;
    }

    // Disallow public wildcard DNS rebinding domains that resolve to 127.0.0.1 / private IPs
    if (/(\.|\b)(nip\.io|sslip\.io|localtest\.me|vcap\.me|lvh\.me|traefik\.me|lacolhost\.com)$/i.test(hostname)) {
      return false;
    }

    // Check if hostname is an IPv4 address in any encoding (decimal, octal, hex, multi-part)
    const ipv4Num = parseIpv4ToNumber(hostname);
    if (ipv4Num !== null) {
      if (isPrivateIpv4(ipv4Num)) {
        return false;
      }
    }

    // IPv6 literal checks (e.g. [::1], [fe80:...], [fc00:...], [fd00:...], [::ffff:...])
    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      const ipv6 = hostname.slice(1, -1).toLowerCase();
      if (
        ipv6 === "::1" ||
        ipv6 === "::" ||
        ipv6.startsWith("fe80:") ||
        ipv6.startsWith("fc") ||
        ipv6.startsWith("fd")
      ) {
        return false;
      }

      // Check IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
      if (ipv6.startsWith("::ffff:") || ipv6.startsWith("0:0:0:0:0:ffff:")) {
        const mappedPart = ipv6.replace(/^.*ffff:/, "");
        const mappedIp = parseIpv4ToNumber(mappedPart);
        if (mappedIp !== null && isPrivateIpv4(mappedIp)) {
          return false;
        }
      }
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
