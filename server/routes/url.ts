import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Url } from "../config/db.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";
import { generateShortCode, isValidUrl, normalizeUrl } from "../utils/helpers.js";

const RESERVED_ALIASES = new Set([
  "api", "dashboard", "create", "links", "analytics", "profile",
  "unlock", "login", "register", "404", "index", "assets", "dist", "favicon.ico"
]);

function validateCustomAlias(alias: string): string | null {
  const trimmed = alias.trim().replace(/\s+/g, "-");
  if (trimmed.length < 3) {
    return "Custom alias must be at least 3 characters long";
  }
  if (trimmed.length > 50) {
    return "Custom alias cannot exceed 50 characters";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return "Custom alias can only contain letters, numbers, hyphens, and underscores";
  }
  if (RESERVED_ALIASES.has(trimmed.toLowerCase())) {
    return "This alias is reserved and cannot be used";
  }
  return null;
}

function parseExpiryDate(val: any): { iso: string | null; error?: string } {
  if (!val || (typeof val !== "string" && !(val instanceof Date))) {
    return { iso: null };
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    return { iso: null, error: "Invalid expiration date format" };
  }
  if (d.getTime() <= Date.now()) {
    return { iso: null, error: "Expiration date must be in the future" };
  }
  return { iso: d.toISOString() };
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "linkcut_secret_jwt_key_2026_prod";

// Optional Auth middleware helper inline
function getOptionalUserId(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// POST /api/url (Create Short URL - Optional Auth)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      originalUrl,
      customAlias,
      expiresAt,
      password,
      tags,
      isPublic,
      isFavorite,
    } = req.body;

    if (!originalUrl) {
      res.status(400).json({ message: "Original URL is required" });
      return;
    }

    const normalizedOriginal = normalizeUrl(originalUrl);
    if (!isValidUrl(normalizedOriginal)) {
      res.status(400).json({ message: "Invalid URL format" });
      return;
    }

    const userId = getOptionalUserId(req);

    // Validate expiration date if provided
    let parsedExpiry: string | null = null;
    if (expiresAt) {
      const expiryResult = parseExpiryDate(expiresAt);
      if (expiryResult.error) {
        res.status(400).json({ message: expiryResult.error });
        return;
      }
      parsedExpiry = expiryResult.iso;
    }

    // If custom alias is provided, validate format and uniqueness
    let finalShortCode = "";
    const hasCustomAlias = Boolean(customAlias && customAlias.trim() !== "");

    if (hasCustomAlias) {
      const aliasError = validateCustomAlias(customAlias);
      if (aliasError) {
        res.status(400).json({ message: aliasError });
        return;
      }
      const trimmedAlias = customAlias.trim().replace(/\s+/g, "-");
      
      // Check if alias already in use
      const existing = await Url.findOne({
        $or: [{ shortCode: trimmedAlias }, { customAlias: trimmedAlias }]
      });
      if (existing) {
        res.status(400).json({ message: "Custom alias or short code already in use" });
        return;
      }
      finalShortCode = trimmedAlias;
    } else {
      // Generate a unique random shortCode
      let attempts = 0;
      while (attempts < 10) {
        const code = generateShortCode(6);
        const existing = await Url.findOne({
          $or: [{ shortCode: code }, { customAlias: code }]
        });
        if (!existing) {
          finalShortCode = code;
          break;
        }
        attempts++;
      }
      if (!finalShortCode) {
        res.status(500).json({ message: "Failed to generate short code. Try again." });
        return;
      }
    }

    // Password hashing for link protection
    let passwordHash: string | null = null;
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Create the record
    const urlDataToCreate: any = {
      userId: userId || null,
      originalUrl: normalizedOriginal,
      shortCode: finalShortCode,
      expiresAt: parsedExpiry,
      isActive: true,
      passwordHash,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim().toLowerCase()) : [],
      isPublic: isPublic ?? true,
      isFavorite: isFavorite ?? false,
    };

    if (hasCustomAlias) {
      urlDataToCreate.customAlias = finalShortCode;
    }

    const newUrl = await Url.create(urlDataToCreate);

    res.status(201).json(newUrl);
  } catch (error: any) {
    console.error("Create URL error:", error);
    res.status(500).json({ message: error?.message || "Server error creating short URL" });
  }
});

// GET /api/url (Get all URLs for authenticated user - Protected)
router.get("/", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string;
    const tag = req.query.tag as string;
    const favorite = req.query.favorite as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "createdAt_desc";

    // Build Mongoose query
    const query: any = { userId };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [
        { originalUrl: searchRegex },
        { shortCode: searchRegex },
        { tags: searchRegex }
      ];
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    // Determine sorting
    let sortObj: any = { createdAt: -1 };
    if (sort === "createdAt_desc") sortObj = { createdAt: -1 };
    if (sort === "createdAt_asc") sortObj = { createdAt: 1 };
    if (sort === "clicks_desc") sortObj = { clicks: -1 };
    if (sort === "clicks_asc") sortObj = { clicks: 1 };

    const total = await Url.countDocuments(query);
    const startIndex = (page - 1) * limit;

    const urls = await Url.find(query)
      .sort(sortObj)
      .skip(startIndex)
      .limit(limit);

    res.json({
      urls,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch URLs error:", error);
    res.status(500).json({ message: "Server error fetching URLs" });
  }
});

// GET /api/url/:id (Get details of specific URL - Protected)
router.get("/:id", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    const url = await Url.findById(id);
    if (!url) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    // Ensure user owns this link (prevent unauthorized access to anonymous links)
    if (!url.userId || url.userId.toString() !== userId) {
      res.status(403).json({ message: "Access denied. You do not own this URL." });
      return;
    }

    res.json(url);
  } catch (error) {
    console.error("Fetch URL detail error:", error);
    res.status(500).json({ message: "Server error fetching URL details" });
  }
});

// PUT /api/url/:id (Edit URL - Protected)
router.put("/:id", authenticateToken as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    const {
      originalUrl,
      customAlias,
      expiresAt,
      password,
      tags,
      isActive,
      isPublic,
      isFavorite,
    } = req.body;

    const url = await Url.findById(id);
    if (!url) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    if (!url.userId || url.userId.toString() !== userId) {
      res.status(403).json({ message: "Access denied. You do not own this URL." });
      return;
    }

    const updates: any = {};

    if (originalUrl) {
      const normalizedOriginal = normalizeUrl(originalUrl);
      if (!isValidUrl(normalizedOriginal)) {
        res.status(400).json({ message: "Invalid URL format" });
        return;
      }
      updates.originalUrl = normalizedOriginal;
    }

    if (customAlias !== undefined) {
      if (customAlias === null || customAlias.trim() === "") {
        updates.customAlias = null;
        // If the shortCode was identical to the customAlias being removed, regenerate a unique 6-char short code
        if (url.customAlias && url.shortCode === url.customAlias) {
          let attempts = 0;
          let newCode = "";
          while (attempts < 10) {
            const code = generateShortCode(6);
            const existing = await Url.findOne({
              $or: [{ shortCode: code }, { customAlias: code }],
              _id: { $ne: id }
            });
            if (!existing) {
              newCode = code;
              break;
            }
            attempts++;
          }
          if (newCode) {
            updates.shortCode = newCode;
          }
        }
      } else {
        const aliasError = validateCustomAlias(customAlias);
        if (aliasError) {
          res.status(400).json({ message: aliasError });
          return;
        }
        const trimmedAlias = customAlias.trim().replace(/\s+/g, "-");
        // Check uniqueness if changed
        if (trimmedAlias !== url.customAlias && trimmedAlias !== url.shortCode) {
          const existing = await Url.findOne({
            $or: [{ shortCode: trimmedAlias }, { customAlias: trimmedAlias }],
            _id: { $ne: id }
          });
          if (existing) {
            res.status(400).json({ message: "Custom alias or short code already in use" });
            return;
          }
        }
        updates.customAlias = trimmedAlias;
        updates.shortCode = trimmedAlias; // Align the short code with custom alias
      }
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === "") {
        updates.expiresAt = null;
      } else {
        const expiryResult = parseExpiryDate(expiresAt);
        if (expiryResult.error) {
          res.status(400).json({ message: expiryResult.error });
          return;
        }
        updates.expiresAt = expiryResult.iso;
      }
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    if (isPublic !== undefined) {
      updates.isPublic = Boolean(isPublic);
    }

    if (isFavorite !== undefined) {
      updates.isFavorite = Boolean(isFavorite);
    }

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim().toLowerCase()) : [];
    }

    if (password !== undefined) {
      if (password === null || password.trim() === "") {
        updates.passwordHash = null;
      } else {
        const salt = await bcrypt.genSalt(10);
        updates.passwordHash = await bcrypt.hash(password, salt);
      }
    }

    const updatedUrl = await Url.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedUrl);
  } catch (error) {
    console.error("Update URL error:", error);
    res.status(500).json({ message: "Server error updating URL" });
  }
});

// DELETE /api/url/:id (Delete URL - Protected)
router.delete("/:id", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    const url = await Url.findById(id);
    if (!url) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    if (!url.userId || url.userId.toString() !== userId) {
      res.status(403).json({ message: "Access denied. You do not own this URL." });
      return;
    }

    await Url.findByIdAndDelete(id);
    res.json({ message: "Shortened URL successfully deleted", id });
  } catch (error) {
    console.error("Delete URL error:", error);
    res.status(500).json({ message: "Server error deleting URL" });
  }
});

export default router;
