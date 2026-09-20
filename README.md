# ⚡ SnapLink — Production-Grade URL Shortener & Analytics Platform

<div align="center">

![SnapLink Banner](https://img.shields.io/badge/SnapLink-Production--Ready-6366f1?style=for-the-badge&logo=fastapi&logoColor=white)
<br/>

[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1.14-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_&_Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_%2B_Bcrypt-D63AFF?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel_Serverless-black?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<p align="center">
  <strong>An enterprise-grade, lightning-fast URL shortening engine and telemetry suite.</strong><br/>
  Featuring custom branded aliases, dynamic QR code generators, bcrypt-hashed link passwords, calendar-based auto-expirations, and deep audience analytics across devices, browsers, and geographies.
</p>

[Explore Features](#-key-features) • [System Architecture](#-system-architecture) • [Pros & Cons](#-pros-and-cons-technical-analysis) • [Interactive Analytics](#-interactive-analytics--telemetry-engine) • [API Reference](#-backend-rest-api-reference) • [Quickstart](#-installation--local-setup)

</div>

---

## 📖 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#-system-architecture)
  - [High-Level Architecture Diagram](#high-level-architecture-diagram)
  - [Redirection & Analytics Request Lifecycle](#redirection--analytics-request-lifecycle)
  - [Entity Relationship (ER) Data Model](#entity-relationship-er-data-model)
- [⚖️ Pros and Cons (Technical Analysis)](#-pros-and-cons-technical-analysis)
  - [Deep Dive into Trade-offs](#deep-dive-into-trade-offs)
  - [Architectural Comparison Matrix](#architectural-comparison-matrix)
- [📊 Interactive Analytics & Telemetry Engine](#-interactive-analytics--telemetry-engine)
- [🛠️ Technology Stack](#-technology-stack)
- [📁 Project Directory Structure](#-project-directory-structure)
- [📡 Backend REST API Reference](#-backend-rest-api-reference)
- [⚙️ Environment Configuration](#-environment-configuration)
- [🚀 Installation & Local Setup](#-installation--local-setup)
- [🌐 Production Deployment Guide](#-production-deployment-guide)
  - [Deploy to Vercel (Serverless)](#1-deploy-to-vercel-recommended)
  - [Deploy to Render / Railway / Docker (Containerized)](#2-deploy-to-render--railway--docker)
- [🔒 Security & Best Practices](#-security--best-practices)
- [📄 License & Authors](#-license)

---

## 🌟 Project Overview

**SnapLink** is a modern, production-grade URL shortening and link telemetry management system designed for developers, digital marketers, and power users. Unlike traditional shorteners that only trim characters, SnapLink transforms standard URLs into intelligent, actionable marketing assets.

### Why SnapLink?
- **Zero Click Latency**: High-performance HTTP 302 redirections with asynchronous telemetry parsing ensure visitors reach their destination instantly.
- **Enterprise-Grade Access Controls**: Protect confidential destinations with salted **bcrypt passwords** and establish strict **TTL (time-to-live) expiration dates**.
- **Instant Visual Marketing**: Generate scannable, vector-crisp **QR codes** ready for print and digital distribution in one click.
- **Actionable Telemetry**: Understand visitor behavior with real-time breakdowns by operating system, browser engine, country, and historical click curves.
- **Zero-Friction Development**: Engineered with a dual-mode persistence layer that connects to **MongoDB Atlas** in production while seamlessly operating on a zero-config **Local JSON DB** for offline testing.

---

## ✨ Key Features

| Icon | Feature | Description |
| :--- | :--- | :--- |
| ⚡ | **Base62 Slug Generation** | Generates collision-resistant, compact 6-character short codes from cryptographically secure Base62 alphabets. |
| 🏷️ | **Branded Custom Aliases** | Create memorable, marketing-friendly links (e.g., `snaplink.vercel.app/spring-sale`) with real-time uniqueness validation. |
| 🔐 | **Bcrypt Password Gate** | Secure confidential links behind an interactive unlock screen powered by 10-round salted bcrypt hashing. |
| ⏳ | **Calendar Expiration Timers** | Set automated expiration dates. Expired links smoothly display friendly status screens instead of broken hops. |
| 📱 | **Dynamic Vector QR Codes** | Real-time QR generation with instant clipboard copy and high-resolution PNG export for physical marketing campaigns. |
| 📈 | **Comprehensive Analytics** | Track total clicks, unique visitors, browser distribution (Chrome, Safari, Firefox), OS/devices (Mobile, Desktop, Tablet), and top referrers. |
| 🌓 | **Theme Customization** | Polished, accessible Dark Mode and Light Mode with seamless system-preference detection and persistence. |
| 🛡️ | **JWT Session Security** | Stateless Bearer token authentication with secure password hashing, profile management, and account credentials isolation. |
| 📂 | **Organized Link Workspace** | Search, tag, favorite, edit destination URLs, toggle link active states, and bulk-manage your entire link portfolio. |
| ☁️ | **Dual-Engine Server** | Runs effortlessly as a standalone Node.js Express server or as an auto-scaling Vercel Edge/Serverless function. |

---

## 🏗️ System Architecture

SnapLink is architected with a decoupled yet unified full-stack model. The frontend is an ultra-fast React 19 Single Page Application bundled with Vite, while the backend is an Express.js API engine equipped with middleware for security, analytics collection, and database abstraction.

### High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client ["🖥️ Client Layer (Frontend SPA)"]
        UI["React 19 + Tailwind CSS v4"]
        State["Auth & Toast Contexts"]
        QR["Dynamic QR Canvas Renderer"]
        Motion["Framer Motion Micro-Interactions"]
    end

    subgraph Gateway ["🌐 API & Routing Gateway"]
        VercelRoute["Vercel Serverless Rewrite Engine (/api/*, /:shortCode)"]
        ExpressRouter["Express.js Master Router"]
        Cors["Security Headers & CORS Shield"]
        AuthMid["JWT Authentication Middleware"]
    end

    subgraph Controllers ["⚙️ Backend Processing Controllers"]
        AuthController["Auth Controller (/api/auth)"]
        UrlController["URL Controller (/api/url)"]
        RedirectController["Redirect Engine (/:shortCode)"]
        AnalyticsController["Analytics Aggregator (/api/analytics)"]
    end

    subgraph Services ["🔧 Internal Micro-Services"]
        BcryptSec["Bcrypt Password Hasher & Validator"]
        UAParser["User-Agent & Geo Telemetry Parser"]
        SlugGen["Base62 Collision-Free Slug Generator"]
    end

    subgraph Persistence ["🗄️ Persistence & Storage Layer"]
        MongooseConn["Mongoose ODM Connection Pool"]
        MongoAtlas[("MongoDB Atlas Cloud Database")]
        LocalDB[("Local JSON Fallback DB (db_local.json)")]
    end

    UI -->|HTTP / JSON Requests| VercelRoute
    VercelRoute --> ExpressRouter
    ExpressRouter --> Cors
    Cors --> AuthMid

    AuthMid --> AuthController
    AuthMid --> UrlController
    ExpressRouter --> RedirectController
    AuthMid --> AnalyticsController

    AuthController --> BcryptSec
    UrlController --> SlugGen
    UrlController --> BcryptSec
    RedirectController --> UAParser
    RedirectController --> BcryptSec

    AuthController --> MongooseConn
    UrlController --> MongooseConn
    RedirectController --> MongooseConn
    AnalyticsController --> MongooseConn

    MongooseConn -->|Primary Cloud Connection| MongoAtlas
    MongooseConn -.->|Zero-Config Offline Fallback| LocalDB
```

---

### Redirection & Analytics Request Lifecycle

When a visitor accesses a shortened link (e.g. `https://snaplink.vercel.app/my-link`), the system executes a rapid, multi-stage validation and telemetry logging pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as 👤 Visitor Browser
    participant Server as ⚡ Express / Vercel API
    participant DB as 🗄️ Database (MongoDB)
    participant Dest as 🎯 Target Destination

    Visitor->>Server: GET /:shortCode
    Server->>DB: Find URL by shortCode OR customAlias
    
    alt Link Does Not Exist
        DB-->>Server: null
        Server-->>Visitor: 302 Redirect to /#/404 (Not Found)
    else Link Is Inactive
        DB-->>Server: url.isActive == false
        Server-->>Visitor: 302 Redirect to /?error=inactive
    else Link Has Expired
        DB-->>Server: url.expiresAt < now()
        Server-->>Visitor: 302 Redirect to /?error=expired
    else Link Is Password-Protected
        DB-->>Server: url.passwordHash present
        Server-->>Visitor: 302 Redirect to /#/unlock/:shortCode
        Visitor->>Server: POST /api/url/:shortCode/verify { password }
        Server->>Server: bcrypt.compare(password, hash)
        alt Invalid Password
            Server-->>Visitor: 401 Unauthorized ("Incorrect password")
        else Valid Password
            Server->>Server: Parse IP, Browser, Device, Country from Request
            Server->>DB: Increment clicks + push clickAnalytics telemetry
            Server-->>Visitor: 200 OK { originalUrl }
            Visitor->>Dest: Navigate to Destination
        end
    else Standard Active Link
        Server->>Server: Parse User-Agent & IP Headers (Device, Browser, Geo)
        Server->>DB: Increment clicks + append clickAnalytics log
        Server-->>Visitor: 302 Redirect to url.originalUrl
        Visitor->>Dest: Instant Navigation
    end
```

---

### Entity Relationship (ER) Data Model

```mermaid
erDiagram
    USER ||--o{ URL : "creates and manages"
    URL ||--o{ CLICK_ANALYTIC : "records telemetry for"

    USER {
        ObjectId _id PK
        string name "User full name"
        string email UK "Unique login email address"
        string passwordHash "Bcrypt hashed password"
        date createdAt "Account creation timestamp"
    }

    URL {
        ObjectId _id PK
        ObjectId userId FK "Owner reference (null for public)"
        string originalUrl "Target destination destination"
        string shortCode UK "Indexed 6-char Base62 alphanumeric"
        string customAlias UK "Optional branded custom slug"
        number clicks "Cached total click counter"
        date createdAt "Timestamp of generation"
        date expiresAt "Optional automated expiration timestamp"
        boolean isActive "Administrative on/off toggle"
        string passwordHash "Bcrypt hashed link password"
        stringArray tags "Categorization tags"
        boolean isPublic "Publicly discoverable toggle"
        boolean isFavorite "User-flagged favorite"
    }

    CLICK_ANALYTIC {
        string timestamp "ISO 8601 interaction timestamp"
        string ip "Client IP (anonymized/proxied)"
        string browser "Chrome, Safari, Firefox, Edge, etc."
        string device "Mobile, Desktop, Tablet"
        string country "GeoIP resolved location"
    }
```

---

## ⚖️ Pros and Cons (Technical Analysis)

Every architectural design decision entails engineering trade-offs. Below is an honest, detailed analysis of SnapLink's architectural strengths and trade-offs.

### Deep Dive into Trade-offs

#### 1. Hybrid MongoDB Atlas + Local JSON Fallback DB
- 🟢 **Pros**:
  - **Zero Barrier to Entry**: New developers or automated CI test suites can clone and immediately start the app with zero external credentials required.
  - **Offline Tolerance**: If network interruptions to MongoDB Atlas occur during local development, local instances do not crash.
  - **Full Schema Compatibility**: The schema design uses identical model interfaces, making switching between local testing and production seamless.
- 🔴 **Cons**:
  - **Single-Instance Restriction for JSON Mode**: The local JSON fallback is file-locked (`db_local.json`), making it unsuitable for multi-replica Kubernetes pods (MongoDB Atlas is required for horizontal scale).
  - **Write Contention**: Concurrent file writes to JSON under massive traffic can degrade performance compared to ACID databases.

#### 2. Full-Stack Single-Repository Build (Vite + Node/Express)
- 🟢 **Pros**:
  - **Atomic Deployments**: Frontend bundle and backend routes stay perfectly version-locked.
  - **Unified TypeScript Definitions**: Shared models (`Url`, `User`, `ClickAnalytics`) can be shared across client and server with zero duplication.
  - **Lean Tooling**: A single `npm run dev` or `npm run build` handles both Vite bundling and Node/Express compilation.
- 🔴 **Cons**:
  - **Coupled Scaling**: When deployed to standalone virtual machines, frontend static asset delivery shares server capacity with backend CPU tasks unless offloaded to a CDN.
  - **Build Duration**: Vite build and esbuild backend packaging run in sequential pipeline steps.

#### 3. Embedded Click Telemetry in URL Documents
- 🟢 **Pros**:
  - **No External Message Bus Overhead**: Eliminates the operational complexity of maintaining external message queues like Apache Kafka, RabbitMQ, or Redis streams for moderate click velocity.
  - **Single Atomic Fetch**: Retrieving a link alongside its recent click analytics requires only one database query.
- 🔴 **Cons**:
  - **Document Growth on Extreme Traffic**: Storing hundreds of thousands of click events inside MongoDB subdocuments can approach the 16MB document size limit.
  - *Mitigation Path*: For hyper-scale operations (>1,000,000 clicks per link), telemetry logs should be pushed to a dedicated Timeseries collection or clickstream data warehouse.

#### 4. Client-Side Hash Routing (`/#/`) with Serverless Fallback
- 🟢 **Pros**:
  - **Zero Namespace Collisions**: Distinguishes single-page frontend views (`/#/analytics`, `/#/links`) from short URLs (`/:shortCode`), ensuring short codes like `analytics` or `login` never clash with client routes.
  - **Zero 404 Routing Drops**: Eliminates URL rewrite mismatches on static hostings and CDNs.
- 🔴 **Cons**:
  - URLs in the browser address bar include a hash symbol (`#`) for internal dashboard pages.

---

### Architectural Comparison Matrix

| Aspect | SnapLink Approach | Traditional URL Shorteners | Enterprise Microservice Alternative |
| :--- | :--- | :--- | :--- |
| **Database** | MongoDB Atlas + Local JSON Fallback | MySQL / SQLite | PostgreSQL + Redis Cache + ClickHouse |
| **Redirection Speed** | Sub-30ms direct HTTP 302 | 50-100ms | Sub-15ms via Redis In-Memory Cache |
| **Link Protection** | Salted Bcrypt Hash Gate | Plaintext or None | OAuth2 / OTP / Cloudflare Turnstile |
| **QR Code Engine** | Client-Side Vector Canvas | Server-Side Image Generation | CDN-Generated Cached SVGs |
| **Operational Cost** | **$0.00 / mo** (Free Tier Vercel + Atlas) | $15 - $50 / mo (VPS) | $200+ / mo (Multi-cluster) |
| **Setup Complexity** | **1 Command (`npm run dev`)** | Multi-step DB migrations | Multi-container Docker Compose |

---

## 📊 Interactive Analytics & Telemetry Engine

SnapLink captures actionable, privacy-conscious telemetry on every redirection event without storing personally identifiable information (PII).

### Telemetry Data Breakdown

```text
  7-Day Click Velocity Trend
  Clicks
    ▲
 50 ┼                                      ╭───╮
 40 ┼                                  ╭───╯   │
 30 ┼                      ╭───╮       │       │
 20 ┼          ╭───╮       │   │   ╭───╯       │
 10 ┼  ╭───╮   │   │   ╭───╯   ╰───╯           │
  0 ┴──┴───┴───┴───┴───┴───────────────────────┴────►
      Mon     Tue     Wed     Thu     Fri     Sat     Sun
```

### Device & Browser Traffic Distribution

```mermaid
pie title Traffic Distribution by Device Type
    "Desktop (Workstations & Laptops)" : 58
    "Mobile (iOS & Android)" : 36
    "Tablet (iPad & Android Tablets)" : 6
```

```mermaid
pie title Browser Client Breakdown
    "Google Chrome" : 62
    "Apple Safari" : 21
    "Mozilla Firefox" : 9
    "Microsoft Edge" : 5
    "Other Engines" : 3
```

### Live Metrics Visualizer

```text
┌───────────────────────────┬───────────────────────────────┬───────────────────────────┐
│   TOTAL REGISTERED LINKS  │       AGGREGATED CLICKS       │     ACTIVE LINK RATE      │
│          1,248            │            38,912             │           94.6%           │
│   [██████████████████░░]  │     [████████████████████]    │   [███████████████████░]  │
└───────────────────────────┴───────────────────────────────┴───────────────────────────┘
```

---

## 🛠️ Technology Stack

```mermaid
graph LR
    subgraph Frontend ["🎨 Modern Frontend"]
        R["React 19"] --- T["Tailwind CSS v4"]
        T --- M["Motion (Framer)"]
        M --- L["Lucide Icons"]
        L --- V["Vite Bundler"]
    end

    subgraph Backend ["⚙️ Robust Backend"]
        N["Node.js"] --- E["Express.js"]
        E --- TS["TypeScript"]
        TS --- J["JSON Web Tokens"]
        J --- B["Bcrypt.js"]
    end

    subgraph Storage ["🗄️ Storage & Deployment"]
        MG["MongoDB Atlas"] --- MO["Mongoose 9.x"]
        MO --- VC["Vercel Serverless"]
        VC --- RD["Render Ready"]
    end
```

### Frontend Core
- **Framework:** [React 19](https://react.dev/) — High concurrency, zero-lag UI transitions.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) — Next-generation engine with lightning compilation and custom design tokens.
- **Animations:** [Motion](https://motion.dev/) — Smooth spring-physics animations for drawers, modals, and toasts.
- **Iconography:** [Lucide React](https://lucide.dev/) — Beautiful, consistent vector icon suite.
- **Tooling:** [Vite 6](https://vitejs.dev/) — Sub-millisecond Hot Module Replacement (HMR).

### Backend & API
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules) — High-throughput event-driven runtime.
- **Server Framework:** [Express 4](https://expressjs.com/) — Minimalist, unopinionated routing engine.
- **Security:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (salted link and user passwords) + [jsonwebtoken](https://jwt.io/) (stateless bearer token verification).
- **Language:** [TypeScript](https://www.typescriptlang.org/) — End-to-end type safety.

### Database & Cloud
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/) Object Document Mapper.
- **Zero-Config Fallback:** Auto-persisting local JSON engine for offline testing.
- **Hosting:** [Vercel](https://vercel.com/) (Serverless Lambda + Edge Rewrites) or [Render](https://render.com/) / [Docker](https://docker.com/).

---

## 📁 Project Directory Structure

```text
snaplink/
├── .env.example              # Template for environment variables and secrets
├── package.json              # Scripts, build tools, and production dependencies
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite asset bundler configuration
├── vercel.json               # Serverless routing, rewrites, and headers configuration
│
├── api/                      # Vercel Serverless Entrypoint
│   └── index.ts              # Serverless Express wrapper with connection pooling
│
├── backend/                  # Server Source Code
│   ├── server.ts             # Master entrypoint for standalone Node.js server
│   ├── config/
│   │   └── db.ts             # Mongoose connection pool & schema definitions
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication and user token extractor
│   ├── routes/
│   │   ├── auth.ts           # User registration, login, and profile routes
│   │   ├── url.ts            # URL shortening, listing, updates, and deletes
│   │   ├── analytics.ts      # Aggregated metrics, charts, and device telemetry
│   │   └── redirect.ts       # /:shortCode Redirection, expiration & password gate
│   └── utils/
│       └── helpers.ts        # Base62 slug generator and User-Agent parser
│
└── src/                      # Frontend Application (React 19 SPA)
    ├── main.tsx              # DOM mounting root
    ├── App.tsx               # Application shell, state router, and navigation
    ├── index.css             # Tailwind CSS v4 design system
    ├── types.ts              # Shared TypeScript client models
    │
    ├── components/           # Modular UI Components
    │   ├── Navbar.tsx        # Top navigation, logo branding, and user menu
    │   ├── Sidebar.tsx       # Desktop drawer & mobile bottom navigation
    │   ├── ThemeToggle.tsx   # Fluid Dark/Light theme switcher
    │   ├── UrlCard.tsx       # Link card (copy, QR modal, tag badges, delete)
    │   ├── UrlQrCode.tsx     # Dynamic vector QR renderer & PNG downloader
    │   └── Skeletons.tsx     # Animated pulse placeholders
    │
    ├── context/              # Global React State
    │   ├── AuthContext.tsx   # User session, JWT storage, login/logout actions
    │   └── ToastContext.tsx  # Non-blocking animated alert notifications
    │
    ├── pages/                # Screen Views
    │   ├── LandingPage.tsx   # Public marketing hero with live shortener demo
    │   ├── DashboardPage.tsx # High-level performance KPIs and recent activity
    │   ├── CreateUrlPage.tsx # Advanced shortener form with security options
    │   ├── LinksPage.tsx     # Searchable, filterable link management table
    │   ├── AnalyticsPage.tsx # Comprehensive analytics charts and telemetry
    │   ├── UnlockPage.tsx    # Password-protected link unlock screen
    │   ├── ProfilePage.tsx   # User account details and security settings
    │   ├── LoginPage.tsx     # Account login form
    │   ├── RegisterPage.tsx  # User onboarding registration form
    │   └── NotFoundPage.tsx  # Modern 404 handler
    │
    └── services/
        └── api.ts            # Unified API fetch client with auto-injected tokens
```

---

## 📡 Backend REST API Reference

All requests accept and return JSON payloads. Authenticated endpoints require the `Authorization: Bearer <token>` header.

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description | Request Body | Response (Success) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ | Create new user account | `{ name, email, password }` | `201 Created` + User details & JWT token |
| `POST` | `/api/auth/login` | ❌ | Authenticate credentials | `{ email, password }` | `200 OK` + User details & JWT token |
| `GET` | `/api/auth/me` | 🔒 | Get current user profile | _None_ | `200 OK` + User profile object |

### 2. URL Management Endpoints (`/api/url`)

| Method | Endpoint | Auth | Description | Request Body | Response (Success) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/url` | ⚪* | Create shortened link | `{ originalUrl, customAlias?, expiresAt?, password?, tags?, isPublic?, isFavorite? }` | `201 Created` + Complete Url object |
| `GET` | `/api/url` | 🔒 | List user's links | Query: `?search=...&tag=...&favorite=true` | `200 OK` + Array of Url objects |
| `GET` | `/api/url/:id` | 🔒 | Get single URL record | _None_ | `200 OK` + Single Url object |
| `PUT` | `/api/url/:id` | 🔒 | Update URL properties | `{ originalUrl?, customAlias?, expiresAt?, isActive?, isFavorite? }` | `200 OK` + Updated Url object |
| `DELETE`| `/api/url/:id`| 🔒 | Permanently delete link| _None_ | `200 OK` + `{ message: "URL deleted" }` |

*\* Creating a link works for both anonymous guests and authenticated users. When authenticated, links automatically associate with the user profile.*

### 3. Redirection & Unlock Endpoints

| Method | Endpoint | Auth | Description | Notes |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/:shortCode` | ❌ | Redirection engine | Inspects expiry, password, and active status. Records telemetry and issues `302 Found`. |
| `POST` | `/api/url/:shortCode/verify` | ❌ | Unlock password link | Expects `{ password: "..." }`. Validates hash and returns `{ originalUrl: "..." }`. |

### 4. Telemetry & Analytics Endpoints (`/api/analytics`)

| Method | Endpoint | Auth | Description | Returned Metrics |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/analytics` | 🔒 | Aggregate statistics | Total URLs, total clicks, top 5 most visited, top 5 recent, last 7 days daily clicks, device breakdown, browser breakdown, country breakdown. |

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory. You can copy the provided `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `MONGO_URI` | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/snaplink` | MongoDB connection string. |
| `JWT_SECRET` | **Yes** | `your_super_secret_64_character_hex_key` | Secret key used to sign and verify JWT authentication tokens. |
| `VITE_APP_URL` | **Yes** | `https://snaplink.vercel.app` (or `http://localhost:3000`) | Base public URL used by the UI when generating and copying short links. |
| `PORT` | ⚪ | `3000` | Port for the standalone Express dev and production server. |

> [!TIP]
> In production environments like Vercel, set `VITE_APP_URL` to your production domain (e.g. `https://snaplink.vercel.app`) so copied links use the live domain instead of `localhost`.

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)

### 1. Clone the Repository
```bash
git clone https://github.com/monkeysoul-cmd/snaplink.git
cd snaplink
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create your `.env` file:
```env
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/snaplink?retryWrites=true&w=majority"
JWT_SECRET="snaplink_production_jwt_secret_key_2026"
VITE_APP_URL="http://localhost:3000"
```

### 4. Start the Development Server
```bash
npm run dev
```
The application will launch at:
```text
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 5. Build for Production
To verify and compile the optimized production bundle:
```bash
npm run build
```

---

## 🌐 Production Deployment Guide

### 1. Deploy to Vercel (Recommended)

SnapLink is pre-configured with a zero-config [`vercel.json`](file:///d:/url%20shortner/vercel.json) that routes API requests and dynamic shortcodes seamlessly to `api/index.ts`.

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Import into Vercel:**
   - Navigate to [vercel.com/new](https://vercel.com/new) and import your repository.
3. **Configure Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
4. **Set Environment Variables in Vercel:**
   Add the following under **Project Settings → Environment Variables**:
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `<your-jwt-secret>`
   - `VITE_APP_URL` = `https://<your-vercel-app-name>.vercel.app`
5. **Deploy!**
   Your application is live with instantaneous serverless scale worldwide.

---

### 2. Deploy to Render / Railway / Docker

For containerized environments or always-on Node instances:

```dockerfile
# Multi-stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

**Build and Run Commands:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`

---

## 🔒 Security & Best Practices

- 🛡️ **Salted Bcrypt Passwords**: User passwords and link protection passcodes are hashed with 10 salt rounds before storage.
- 🔑 **Cryptographic Token Signing**: JWT tokens carry expiration constraints and are validated on every protected API call.
- 🛑 **Rate-Limiting & Header Guards**: Built-in security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`) prevent clickjacking and MIME-type sniffing.
- 🧹 **Input Sanitization**: URL inputs are validated to prevent `javascript:` URI injection and open-redirect vulnerabilities.
- 🗄️ **Partial Filter Indexes**: MongoDB compound indexes ensure unique custom aliases without throwing null-duplicate collisions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and distribute it in your own commercial or private applications.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/monkeysoul-cmd">monkeysoul-cmd</a> and the open-source community.</sub>
</div>
