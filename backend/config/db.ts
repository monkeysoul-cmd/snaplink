import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const RAW_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGODB_URI = RAW_URI || "mongodb://127.0.0.1:27017/snaplink";

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

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("MongoDB connected successfully");
      return m;
    }).catch(error => {
      // Redact potential connection string / credential details from logged message
      const safeMessage = error?.message ? String(error.message).replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, "mongodb://***:***@") : "Connection failed";
      console.error("MongoDB connection error:", safeMessage);
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
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      delete ret.passwordHash;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      delete ret.passwordHash;
      return ret;
    }
  }
});

export const User: mongoose.Model<any> = mongoose.models.User || mongoose.model('User', UserSchema);

const ClickAnalyticSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  ip: { type: String },
  browser: { type: String },
  device: { type: String },
  country: { type: String }
}, {
  toJSON: {
    transform: (_doc, ret: any) => {
      delete ret.ip; // Never expose raw visitor IP addresses in API responses
      return ret;
    }
  },
  toObject: {
    transform: (_doc, ret: any) => {
      delete ret.ip;
      return ret;
    }
  }
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
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      if (ret.passwordHash) {
        ret.passwordHash = "protected";
      }
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      if (ret.passwordHash) {
        ret.passwordHash = "protected";
      }
      return ret;
    }
  }
});

UrlSchema.index(
  { customAlias: 1 },
  { unique: true, partialFilterExpression: { customAlias: { $type: "string" } } }
);

UrlSchema.index({ userId: 1, createdAt: -1 });

export const Url: mongoose.Model<any> = mongoose.models.Url || mongoose.model('Url', UrlSchema);
