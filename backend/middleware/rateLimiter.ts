import rateLimit from "express-rate-limit";

// Auth rate limiter (login / register) - 15 minutes, 20 requests per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password verification limiter - 15 minutes, 30 requests per IP
export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many unlock attempts. Please wait before retrying." },
  standardHeaders: true,
  legacyHeaders: false,
});

// URL creation rate limiter - 1 minute, 45 requests per IP
export const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 45,
  message: { message: "Too many links created in a short time. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

