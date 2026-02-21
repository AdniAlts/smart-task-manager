# 🏗️ Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Client)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  React 19 + Vite + TailwindCSS 4                           │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │Dashboard │  │  Tasks   │  │ Settings │  │   Auth   │  │    │
│  │  │  Page    │  │   Page   │  │   Page   │  │   Page   │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  │                                                              │    │
│  │  Components:                                                 │    │
│  │  • TaskCard  • Charts  • MagicInput  • Modals              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│                      Deployed on: Vercel                             │
└───────────────────────────┬───────────────────────────────────────┘
                            │ HTTPS/REST API
                            │ (axios)
┌───────────────────────────▼───────────────────────────────────────┐
│                     BACKEND (Serverless API)                        │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Vercel Serverless Functions                    │    │
│  │                                                              │    │
│  │  /api/index.js                                              │    │
│  │  ├─ /api/auth/register                                      │    │
│  │  ├─ /api/auth/login                                         │    │
│  │  ├─ /api/tasks (GET/POST/PUT/DELETE)                       │    │
│  │  ├─ /api/tasks/magic ──────┐                               │    │
│  │  └─ /api/dashboard          │                               │    │
│  │                              │                               │    │
│  │  /api/telegram-webhook.js   │                               │    │
│  │  (handles Telegram updates) │                               │    │
│  │                              │                               │    │
│  │  /api/cron-notifications.js │                               │    │
│  │  (scheduled task checks)    │                               │    │
│  └──────────────────────────────┼───────────────────────────────┘    │
│                                 │                                     │
│                      Deployed on: Vercel                             │
└─────────────┬───────────────────┼─────────────┬─────────────────────┘
              │                   │             │
              │                   │             │
    ┌─────────▼─────────┐  ┌─────▼──────┐  ┌──▼────────────┐
    │   MySQL Database  │  │ Gemini AI  │  │  Telegram API │
    │                   │  │            │  │               │
    │  Tables:          │  │ Model:     │  │  Webhook:     │
    │  • users          │  │ gemini-    │  │  /api/        │
    │  • tasks          │  │ 2.5-flash  │  │  telegram-    │
    │                   │  │            │  │  webhook      │
    │  Hosted on:       │  │ API Key    │  │               │
    │  PlanetScale /    │  │ required   │  │  Bot Token    │
    │  Railway / Aiven  │  │            │  │  required     │
    └───────────────────┘  └────────────┘  └───────────────┘
              │
              │
    ┌─────────▼─────────┐
    │  Email Service    │
    │  (Nodemailer)     │
    │                   │
    │  SMTP:            │
    │  Gmail / Outlook  │
    │  / SendGrid       │
    └───────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       CRON JOB SCHEDULER                              │
│                                                                       │
│  Option 1: Vercel Cron (Pro)      Option 2: GitHub Actions (Free)   │
│  ┌──────────────────────┐         ┌──────────────────────────┐     │
│  │  Runs every hour     │         │  Workflow triggers       │     │
│  │  ↓                   │         │  hourly via cron         │     │
│  │  /api/cron-          │         │  ↓                       │     │
│  │  notifications       │         │  curl POST to endpoint   │     │
│  └──────────────────────┘         └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Registration/Login Flow

```
┌────────┐       ┌────────┐       ┌──────────┐       ┌──────────┐
│ User   │──1───▶│Frontend│──2───▶│  API     │──3───▶│ Database │
│ Browser│       │ Form   │       │ /auth    │       │ (users)  │
└────────┘       └────────┘       └──────────┘       └──────────┘
     │                │                 │                   │
     │                │                 │◀──4. User data───│
     │                │◀─5. JWT Token──│
     │◀──6. Redirect─│
     │   to Dashboard│
```

**Steps:**
1. User submits email/password
2. Frontend sends POST to `/api/auth/login` or `/api/auth/register`
3. Backend validates and queries database
4. Database returns user data
5. Backend generates JWT token
6. Frontend stores token and redirects

---

### 2. AI-Powered Task Creation Flow (Magic Input)

```
┌────────┐       ┌────────────┐       ┌─────────┐       ┌──────────┐
│ User   │──1───▶│ Magic      │──2───▶│  API    │──3───▶│ Gemini   │
│ Types  │       │ Input Modal│       │ /tasks/ │       │   AI     │
│ Text   │       │            │       │ magic   │       │          │
└────────┘       └────────────┘       └─────────┘       └──────────┘
                        │                  │                   │
                        │                  │◀──4. Structured──│
                        │                  │    task JSON     │
                        │                  │                   │
                        │                  ▼                   │
                        │            ┌──────────┐              │
                        │            │ Database │              │
                        │            │ (tasks)  │              │
                        │            └──────────┘              │
                        │                  │                   │
                        │◀─5. Created task─│                   │
                        │    with AI data  │                   │
```

**Input Example:**
```
"Submit research paper tomorrow at 2pm, high priority"
```

**Gemini AI Processing:**
- Extracts: title, description, deadline, priority
- Understands context: "tomorrow", "2pm"
- Determines priority: "high" → "do_first"

**Output:**
```json
{
  "title": "Submit research paper",
  "description": "Complete and submit the research paper",
  "deadline": "2024-02-21 14:00:00",
  "priority_level": "do_first"
}
```

---

### 3. Notification System Flow

```
┌──────────────┐       ┌──────────────┐       ┌──────────┐
│ Cron Trigger │──1───▶│ /api/cron-   │──2───▶│ Database │
│ (Hourly)     │       │ notifications│       │ (tasks)  │
└──────────────┘       └──────────────┘       └──────────┘
                              │                     │
                              │◀─3. Tasks with─────│
                              │    upcoming        │
                              │    deadlines       │
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │   Telegram   │    │    Email     │
            │     Bot      │    │   Service    │
            └──────────────┘    └──────────────┘
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ User's       │    │ User's       │
            │ Telegram     │    │ Email Inbox  │
            └──────────────┘    └──────────────┘
```

**Trigger Options:**
1. **Vercel Cron** (Pro plan): Automatic hourly trigger
2. **GitHub Actions** (Free): Workflow runs hourly
3. **External Cron** (Free): cron-job.org hits endpoint

**Notification Criteria:**
- Task deadline within next 24 hours
- Task status not "done"
- User has email or Telegram configured

---

### 4. Telegram Integration Flow

#### A. User Onboarding
```
┌────────┐       ┌──────────┐       ┌─────────────┐
│ User   │──1───▶│ Telegram │──2───▶│ /api/       │
│ sends  │       │   Bot    │       │ telegram-   │
│ /start │       │          │       │ webhook     │
└────────┘       └──────────┘       └─────────────┘
     │                                      │
     │◀──────3. Welcome message────────────│
     │   "Your Chat ID: 123456789"          │
     │                                      │
     ▼                                      │
┌────────┐                                  │
│ User   │──4. Adds Chat ID to─────────────┘
│ copies │    TaskMind Settings
│ Chat ID│
└────────┘
```

#### B. Receiving Notifications
```
┌─────────────┐       ┌──────────┐       ┌────────┐
│ Cron Job    │──1───▶│ Telegram │──2───▶│ User's │
│ triggers    │       │   API    │       │ Phone  │
│ notification│       │          │       │        │
└─────────────┘       └──────────┘       └────────┘
```

---

## Technology Stack Details

### Frontend Stack
```
React 19 (UI Library)
  └── Vite 7 (Build Tool)
       └── TailwindCSS 4 (Styling)
            └── Recharts (Charts)
                 └── Lucide Icons (Icons)
                      └── React Router 7 (Routing)
                           └── Axios (HTTP Client)
```

### Backend Stack
```
Node.js 18+ (Runtime)
  └── Express 5 (Web Framework)
       └── MySQL2 (Database Driver)
            ├── JWT (Authentication)
            ├── Bcrypt (Password Hashing)
            ├── Google Generative AI (Gemini)
            ├── Nodemailer (Email)
            ├── Telegram Bot API (Notifications)
            └── CORS (Security)
```

---

## Deployment Architecture

### Railway (Previous - Traditional Server)
```
┌──────────────────────────────────────┐
│         Railway Container            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Node.js Server (24/7)         │ │
│  │  ├── Express App               │ │
│  │  ├── Telegram Bot (Polling)    │ │
│  │  └── Node-Cron (Background)    │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  MySQL Database                │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Characteristics:**
- Always running (even when idle)
- Single container
- Traditional server model
- Cost: ~$5-10/month

---

### Vercel (Current - Serverless)
```
┌──────────────────────────────────────┐
│        Vercel Edge Network           │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Serverless Functions          │ │
│  │  (Spin up on request)          │ │
│  │                                │ │
│  │  /api/index.js                 │ │
│  │  /api/telegram-webhook.js      │ │
│  │  /api/cron-notifications.js    │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│    External Database (PlanetScale)   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  MySQL Database                │ │
│  │  (Managed Service)             │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│       GitHub Actions / Vercel Cron   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Scheduled Triggers            │ │
│  │  (Hourly cron jobs)            │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Characteristics:**
- Functions only run when needed
- Scales automatically
- Distributed globally
- Cost: Free tier available (serverless billing)

---

## Security Architecture

```
┌────────────────────────────────────────────────────┐
│                  Security Layers                    │
├────────────────────────────────────────────────────┤
│                                                     │
│  1. HTTPS/TLS Encryption (Transport Layer)         │
│     └── All traffic encrypted                      │
│                                                     │
│  2. JWT Authentication (Application Layer)         │
│     ├── Token-based auth                           │
│     ├── Expiration: 7 days                         │
│     └── Secret key protected                       │
│                                                     │
│  3. Password Security (Data Layer)                 │
│     ├── Bcrypt hashing (10 rounds)                │
│     └── Never stored in plaintext                  │
│                                                     │
│  4. Database Security                              │
│     ├── Connection over SSL                        │
│     ├── Environment variable protection            │
│     └── Prepared statements (SQL injection proof)  │
│                                                     │
│  5. API Security                                   │
│     ├── CORS policy                                │
│     ├── Rate limiting (Vercel automatic)           │
│     └── Input validation                           │
│                                                     │
│  6. Cron Security                                  │
│     └── CRON_SECRET authentication required        │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

### Frontend
- **Code splitting**: Dynamic imports for routes
- **Lazy loading**: Components loaded on demand
- **Image optimization**: Optimized assets
- **Caching**: Browser caching for static assets

### Backend
- **Connection pooling**: Database connection reuse
- **Prepared statements**: Query optimization
- **Serverless scaling**: Auto-scale on demand
- **Edge network**: Global CDN distribution

---

This architecture provides:
✅ High scalability
✅ Low cost (free tier possible)
✅ Global availability
✅ Automatic HTTPS
✅ Easy deployment
✅ Zero server maintenance
