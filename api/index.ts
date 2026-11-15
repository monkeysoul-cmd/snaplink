import express from "express";
import helmet from "helmet";
import { connectDB } from "../backend/config/db.js";
import authRouter from "../backend/routes/auth.js";
import urlRouter from "../backend/routes/url.js";
import analyticsRouter from "../backend/routes/analytics.js";
import redirectRouter from "../backend/routes/redirect.js";

const app = express();

app.set("trust proxy", 1);

// Security headers using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://api.qrserver.com"],
        connectSrc: ["'self'", "https://api.qrserver.com"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Middleware for body parsing with size limits
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

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

// Mount API Routers
app.use("/api/auth", authRouter);
app.use("/api/url", urlRouter);
app.use("/api/analytics", analyticsRouter);

// Mount the Redirection router
app.use("/", redirectRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled serverless error:", err);
  if (res.headersSent) return;
  const isApi = req.path.startsWith("/api/");
  const status = err.status || err.statusCode || 500;
  if (isApi) {
    res.status(status).json({
      message: process.env.NODE_ENV === "production" ? "Internal server error" : (err.message || "Internal server error")
    });
  } else {
    res.status(status).send("Internal Server Error");
  }
});

export default app;
