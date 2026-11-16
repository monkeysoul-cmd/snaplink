import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Url } from "../config/db.js";
import { parseUserAgent, anonymizeIp, isValidUrl } from "../utils/helpers.js";
import { verifyLimiter } from "../middleware/rateLimiter.js";

const MAX_ANALYTICS_RECORDS = 500;

const FRONTEND_ROUTES = new Set([
  "dashboard",
  "create",
  "links",
  "analytics",
  "profile",
  "login",
  "register",
  "unlock",
  "404",
  "settings"
]);

const router = Router();

// Helper to look up URL by shortCode or customAlias with fast indexed lookup then regex fallback
async function findUrlByCode(code: string) {
  const cleanCode = code.trim();
  if (!cleanCode || cleanCode.length > 100) return null;

  // 1. Fast indexed exact match
  let url = await Url.findOne({
    $or: [{ shortCode: cleanCode }, { customAlias: cleanCode }]
  });

  // 2. Case-insensitive fallback
  if (!url) {
    const escapedCode = cleanCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    url = await Url.findOne({
      $or: [
        { shortCode: new RegExp(`^${escapedCode}$`, "i") },
        { customAlias: new RegExp(`^${escapedCode}$`, "i") }
      ]
    });
  }

  return url;
}

// POST /api/url/:shortCode/verify
// Verifies the password of a protected link and records atomic click analytics if successful.
router.post("/api/url/:shortCode/verify", verifyLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    const url = await findUrlByCode(shortCode);
    if (!url) {
      res.status(404).json({ message: "Short URL not found" });
      return;
    }

    if (!url.isActive) {
      res.status(400).json({ message: "This link has been deactivated and cannot be accessed." });
      return;
    }

    if (url.expiresAt && new Date(url.expiresAt).getTime() < Date.now()) {
      res.status(400).json({ message: "This link has expired and is no longer accessible." });
      return;
    }

    if (!url.passwordHash) {
      res.status(400).json({ message: "This URL is not password-protected" });
      return;
    }

    const isMatch = await bcrypt.compare(password, url.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }

    if (!isValidUrl(url.originalUrl)) {
      res.status(400).json({ message: "The destination URL is invalid or unsafe." });
      return;
    }

    // Capture User-Agent analytics
    const userAgent = req.headers["user-agent"] || "";
    const forwarded = req.headers["x-forwarded-for"];
    const rawIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const clientCountry = (req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || "") as string;
    const { browser, device, country } = parseUserAgent(userAgent, clientCountry);
    const safeIp = anonymizeIp(rawIp);

    // Atomic update to avoid race conditions and lost clicks
    await Url.updateOne(
      { _id: url._id },
      {
        $inc: { clicks: 1 },
        $push: {
          clickAnalytics: {
            $each: [{
              timestamp: new Date().toISOString(),
              ip: safeIp,
              browser,
              device,
              country,
            }],
            $slice: -MAX_ANALYTICS_RECORDS
          }
        }
      }
    );

    res.json({ originalUrl: url.originalUrl });
  } catch (error) {
    console.error("Verify URL password error:", error);
    res.status(500).json({ message: "Server error during password verification" });
  }
});

// GET /:shortCode
// Main redirect handler. Checks expiry, password protection, active status, logs analytics, and redirects.
router.get("/:shortCode", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let shortCode = req.params.shortCode;

    // Check if passed in query from Vercel rewrite (?shortCode=:shortCode)
    if (req.query.shortCode && typeof req.query.shortCode === "string" && req.query.shortCode.trim() !== "") {
      shortCode = req.query.shortCode.trim();
    }

    // Fallback: extract short code from originalUrl if shortCode is index.ts / index.js / api
    if ((!shortCode || shortCode === "index.ts" || shortCode === "index.js" || shortCode === "api") && req.originalUrl) {
      const rawPath = req.originalUrl.split("?")[0];
      const parts = rawPath.split("/").filter(Boolean);
      if (parts.length > 0 && parts[0] !== "api") {
        shortCode = parts[0];
      }
    }

    // Skip for asset routes, api requests, or internal Vite paths so next middlewares can handle them
    if (
      !shortCode ||
      shortCode === "api" ||
      shortCode === "index.ts" ||
      shortCode === "index.js" ||
      shortCode.startsWith("@") || 
      shortCode.startsWith("src") ||
      shortCode.startsWith("node_modules") ||
      shortCode.includes(".") || 
      shortCode === "favicon.ico" ||
      shortCode.length > 100
    ) {
      return next();
    }

    const cleanCode = shortCode.trim();

    // Fast-path for client-side frontend routes: forward to hash path instead of searching DB or 404ing
    if (FRONTEND_ROUTES.has(cleanCode.toLowerCase())) {
      res.redirect(`/#/${cleanCode}`);
      return;
    }

    const url = await findUrlByCode(cleanCode);

    if (!url) {
      // Redirect to frontend's 404 handler
      res.redirect("/#/404");
      return;
    }

    // 1. Check if link is active
    if (!url.isActive) {
      res.redirect("/?error=inactive");
      return;
    }

    // 2. Check if link has expired
    if (url.expiresAt) {
      const isExpired = new Date(url.expiresAt).getTime() < Date.now();
      if (isExpired) {
        res.redirect("/?error=expired");
        return;
      }
    }

    // 3. Check if link is password protected
    if (url.passwordHash) {
      // Redirect to frontend unlock screen
      res.redirect(`/#/unlock/${url.shortCode}`);
      return;
    }

    // 4. Validate original destination URL scheme against XSS
    if (!isValidUrl(url.originalUrl)) {
      res.redirect("/#/404");
      return;
    }

    // 5. Capture User-Agent analytics
    const userAgent = req.headers["user-agent"] || "";
    const forwarded = req.headers["x-forwarded-for"];
    const rawIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const clientCountry = (req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || "") as string;
    const { browser, device, country } = parseUserAgent(userAgent, clientCountry);
    const safeIp = anonymizeIp(rawIp);

    // Atomic update to avoid race conditions and lost clicks
    await Url.updateOne(
      { _id: url._id },
      {
        $inc: { clicks: 1 },
        $push: {
          clickAnalytics: {
            $each: [{
              timestamp: new Date().toISOString(),
              ip: safeIp,
              browser,
              device,
              country,
            }],
            $slice: -MAX_ANALYTICS_RECORDS
          }
        }
      }
    );

    // 6. Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirection error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
