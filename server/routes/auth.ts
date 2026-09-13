import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../config/db.js";
import { generateToken, authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ message: "Please provide a valid email address" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in our DB
    const user = await User.create({
      name,
      email: trimmedEmail,
      passwordHash,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me (Protected)
router.get("/me", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !mongoose.isValidObjectId(req.user.id)) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
});

export default router;
