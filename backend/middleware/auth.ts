import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const DEFAULT_DEV_SECRET = "linkcut_dev_secret_jwt_key_DO_NOT_USE_IN_PRODUCTION";
const ENV_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && (!ENV_SECRET || ENV_SECRET === DEFAULT_DEV_SECRET)) {
  console.warn("⚠️  SECURITY WARNING: Using default or missing JWT_SECRET in production. Set a strong, unique JWT_SECRET in environment variables.");
}

export const JWT_SECRET = ENV_SECRET || DEFAULT_DEV_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Authentication middleware
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired session token." });
  }
}
