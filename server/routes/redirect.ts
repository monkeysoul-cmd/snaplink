import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Url } from "../config/db.js";
import { parseUserAgent } from "../utils/helpers.js";

const router = Router();

// POST /api/url/:shortCode/verify-password
// Verifies the password of a protected link and records click analytics if successful.
router.post("/api/url/:shortCode/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    const url = await Url.findOne({ shortCode });
    if (!url) {
      res.status(404).json({ message: "Short URL not found" });
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

    // Capture User-Agent analytics
    const userAgent = req.headers["user-agent"] || "";
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const { browser, device, country } = parseUserAgent(userAgent);

    // Record click
    url.clicks += 1;
    url.clickAnalytics.push({
      timestamp: new Date().toISOString(),
      ip,
      browser,
      device,
      country,
    });
    await url.save();

    res.json({ originalUrl: url.originalUrl });
  } catch (error) {
    console.error("Verify URL password error:", error);
    res.status(500).json({ message: "Server error during password verification" });
  }
});

// GET /:shortCode
// Main redirect handler. Checks expiry, password protection, active status, logs analytics, and redirects.
router.get("/:shortCode", async (req: Request, res: Response, next: import("express").NextFunction) => {
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
      shortCode === "favicon.ico"
    ) {
      return next();
    }

    // Look up by shortCode OR customAlias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }]
    });

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

    // 4. Capture User-Agent analytics
    const userAgent = req.headers["user-agent"] || "";
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const { browser, device, country } = parseUserAgent(userAgent);

    // Record click
    url.clicks += 1;
    url.clickAnalytics.push({
      timestamp: new Date().toISOString(),
      ip,
      browser,
      device,
      country,
    });
    await url.save();

    // 5. Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirection error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
