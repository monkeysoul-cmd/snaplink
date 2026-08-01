import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Url } from "../config/db.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";
import { generateShortCode, isValidUrl, normalizeUrl } from "../utils/helpers.js";

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

    // If custom alias is provided, validate uniqueness
    let finalShortCode = "";
    const hasCustomAlias = Boolean(customAlias && customAlias.trim() !== "");

    if (hasCustomAlias) {
      const trimmedAlias = customAlias.trim().replace(/\s+/g, "-");
      if (trimmedAlias.length < 3) {
        res.status(400).json({ message: "Custom alias must be at least 3 characters long" });
        return;
      }
      
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
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
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
      const searchRegex = new RegExp(search, 'i');
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

    const url = await Url.findById(id);
    if (!url) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    // Ensure user owns this link
    if (url.userId && url.userId.toString() !== userId) {
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

    if (url.userId && url.userId.toString() !== userId) {
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
      } else {
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
      updates.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;
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

    const url = await Url.findById(id);
    if (!url) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    if (url.userId && url.userId.toString() !== userId) {
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
