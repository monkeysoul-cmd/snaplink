import express from "express";
import path from "path";
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

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic security headers and CORS (Development safe)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

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
