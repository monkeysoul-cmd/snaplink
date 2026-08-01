import express from "express";
import { connectDB } from "../server/config/db.js";
import authRouter from "../server/routes/auth.js";
import urlRouter from "../server/routes/url.js";
import analyticsRouter from "../server/routes/analytics.js";
import redirectRouter from "../server/routes/redirect.js";

const app = express();

// Remove un-awaited global connectDB call that causes serverless drops

// Middleware for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wait for DB connection BEFORE handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection error in middleware:", error);
    res.status(500).json({ message: "Database connection failed. Please check MongoDB IP whitelist and credentials." });
  }
});

// Basic security headers and CORS (Development safe)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Mount API Routers
app.use("/api/auth", authRouter);
app.use("/api/url", urlRouter);
app.use("/api/analytics", analyticsRouter);

// Mount the Redirection router
app.use("/", redirectRouter);

export default app;
