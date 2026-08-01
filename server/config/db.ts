import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://<db_username>:<db_password>@cluster0.ntqhehl.mongodb.net/?appName=Cluster0";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    }).catch(error => {
      console.error("MongoDB connection error:", error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const User = mongoose.model('User', UserSchema);

const ClickAnalyticSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  ip: { type: String },
  browser: { type: String },
  device: { type: String },
  country: { type: String }
});

const UrlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String, default: undefined },
  clicks: { type: Number, default: 0 },
  clickAnalytics: [ClickAnalyticSchema],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  passwordHash: { type: String, default: null }, // Hashed password for protection
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UrlSchema.index(
  { customAlias: 1 },
  { unique: true, partialFilterExpression: { customAlias: { $type: "string" } } }
);

export const Url = mongoose.model('Url', UrlSchema);
