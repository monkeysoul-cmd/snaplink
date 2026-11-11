import express from "express";
import path from "path";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import urlRouter from "./routes/url.js";
import analyticsRouter from "./routes/analytics.js";
import redirectRouter from "./routes/redirect.js";

async function startServer() {
  await connectDB();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Trust first proxy for correct IP handling behind reverse proxies (Vercel, Cloudflare)
  app.set("trust proxy", 1);

  // Security headers using Helmet with CSP configured for Vite dev and production assets
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https://api.qrserver.com"],
          connectSrc: ["'self'", "https://api.qrserver.com", "ws:", "wss:"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Middleware for body parsing
  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));

  // Mount API Routers first so they take precedence over asset routing
  app.use("/api/auth", authRouter);
  app.use("/api/url", urlRouter);
  app.use("/api/analytics", analyticsRouter);
  
  // Mount the Redirection and Verify router (includes GET /:shortCode and POST /api/url/:shortCode/verify)
  app.use("/", redirectRouter);

  // Vite middleware setup for assets and HTML serving
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static compiled assets
    app.use(express.static(distPath));
    
    // Fallback any unhandled non-API paths to client-side index.html router
    app.get("*", (req, res, next) => {
      // Exclude API paths from index.html fallback
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to configured port and host 0.0.0.0 (required for Cloud Run / Docker routing)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(`  SnapLink URL Shortener server is live on port ${PORT}`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
});
