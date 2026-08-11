# LinkCut URL Shortener (Production-Ready Full-Stack Web App)

A highly optimized, feature-rich, full-stack URL shortener web application with JWT authentication, custom alias branding, calendar link expirations, password protection, downloadable QR codes, and granular device/browser click analytics.

## Tech Stack
- **Frontend:** React (v19) + Vite + Tailwind CSS (v4) + Lucide Icons + Motion
- **Backend:** Node.js + Express.js + ES Modules (TypeScript type-stripping)
- **Database:** Fully compliant MongoDB/Mongoose models (includes a seamless auto-persisting Local JSON fallback DB for zero-configuration preview out of the box).
- **Authentication:** Signed JSON Web Tokens (JWT) + Hashed bcryptjs passwords.

---

## Complete Project Folder Structure
```text
/
├── .env.example              # Template for server environments & secrets
├── package.json              # App scripts and dependency manifests
├── tsconfig.json             # TypeScript compiler rules
├── vite.config.ts            # Vite asset Bundler configurations
├── server.ts                 # Master full-stack Express + Vite server entrypoint
│
├── server/                   # Backend API Server Modules
│   ├── config/
│   │   └── db.ts             # Local JSON DB engine & production Mongoose templates
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication validator
│   ├── routes/
│   │   ├── auth.ts           # /api/auth/ register, login, and session profile endpoints
│   │   ├── url.ts            # /api/url/ link creation, listings, edits, and deletions
│   │   ├── analytics.ts      # /api/analytics/ click telemetry aggregates
│   │   └── redirect.ts       # /:shortCode Redirection and password verify engines
│   └── utils/
│       └── helpers.ts        # Base62 code generators & User-Agent parser engines
│
└── src/                      # Frontend Single-Page Application (SPA)
    ├── main.tsx              # React mounting entry point
    ├── App.tsx               # Master App layout shell & hash-state router
    ├── index.css             # Global Tailwind stylesheets
    ├── types.ts              # Client TypeScript models & interfaces
    │
    ├── components/           # Reusable UI Components
    │   ├── Navbar.tsx        # Sticky header branding and avatar dropdowns
    │   ├── Sidebar.tsx       # Desktop side-menu and mobile bottom navigations
    │   ├── ThemeToggle.tsx   # Light / dark mode responsive switch
    │   ├── UrlCard.tsx       # Actionable card (editing, deletions, favorite toggles)
    │   ├── UrlQrCode.tsx     # Scan QR image copy & PNG download drawers
    │   └── Skeletons.tsx     # Animated pulse placeholder sheets
    │
    ├── context/              # React Context Providers
    │   ├── AuthContext.tsx   # Session loggers, logouts, & token caches
    │   └── ToastContext.tsx  # Animated slide-in notification systems
    └── services/
        └── api.ts            # Axios-like unified fetch client proxier
```

---

## Database Schemas (MongoDB Reference)

### 1. User Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 2. URL Schema
```javascript
const ClickAnalyticSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  browser: { type: String },
  device: { type: String },
  country: { type: String }
});

const UrlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String, default: null, unique: true, sparse: true },
  clicks: { type: Number, default: 0 },
  clickAnalytics: [ClickAnalyticSchema],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  password: { type: String, default: null }, // Bcrypt Hashed
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false }
});
```

---

## Backend REST APIs

### Auth Enpoints
- `POST /api/auth/register` - Register a new user. Expects `{ name, email, password }`.
- `POST /api/auth/login` - Login to account. Expects `{ email, password }`. Returns JWT token.
- `GET /api/auth/me` - Fetch details of active user session. (Requires Bearer token).

### URL Shortener Endpoints
- `POST /api/url` - Shorten a link. (Optional authentication). Expects `{ originalUrl, customAlias?, expiresAt?, password?, tags?, isPublic?, isFavorite? }`.
- `GET /api/url` - Fetch list of user's URLs with search/tags filters. (Requires Bearer token).
- `GET /api/url/:id` - Fetch details of a single shortened URL. (Requires Bearer token).
- `PUT /api/url/:id` - Edit a shortened URL parameters. (Requires Bearer token).
- `DELETE /api/url/:id` - Delete a shortened URL record. (Requires Bearer token).

### Redirection & Unlock Endpoints
- `GET /:shortCode` - Redirection endpoint. Logs analytics, redirects to destination.
- `POST /api/url/:shortCode/verify` - Validate password key for locked links.

### Analytics Endpoints
- `GET /api/analytics` - Aggregate user total counts, browser charts, and weekly click timelines. (Requires Bearer token).

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
# MongoDB Atlas connection string
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/linkcut"

# JWT signing secret (keep this private and strong)
JWT_SECRET="your-private-production-jwt-string"

# Public Vercel deployment URL — used by the frontend to build working short links
# Set this to your actual Vercel project URL (e.g. after renaming project to "snaplink")
VITE_APP_URL="https://snaplink.vercel.app"
```

> **Note:** `VITE_APP_URL` is the most important variable for production. Without it, copied short links
> will use `window.location.origin` which still works on Vercel but won't if the domain ever changes.

---

## Installation & Local Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Boot the dev server:**
   ```bash
   npm run dev
   ```

3. **Open application:**
   Direct your browser to `http://localhost:3000` to interact with the full-stack system.

---

## Deployment (Vercel)

1. Push your code to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. **Rename the Vercel project to `snaplink`** (Settings → General → Project Name) so your URL becomes `snaplink.vercel.app`.
4. Add these **Environment Variables** in Vercel dashboard (Settings → Environment Variables):

   | Key | Value |
   |---|---|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret string |
   | `VITE_APP_URL` | `https://snaplink.vercel.app` |

5. Redeploy — all short links will now be `snaplink.vercel.app/abc123` and redirect correctly.


---

## Installation & Local Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Boot the dev server:**
   ```bash
   npm run dev
   ```

3. **Open application:**
   Direct your browser to `http://localhost:3000` to interact with the full-stack system.

---

## Deployment Steps

### Frontend Deployment (Vercel)
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in root folder.
3. Configure the `VITE_` variables if exposing public configurations.

### Backend Deployment (Render)
1. Create a "Web Service" on Render.
2. Link your GitHub repository.
3. Configure Build Command: `npm install && npm run build`
4. Configure Start Command: `npm run start`
5. Input your Environment Secrets: `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
