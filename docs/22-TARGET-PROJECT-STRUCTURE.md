# 22 - Target Project Structure & Restructuring Blueprint: LUCOUS

> **Document Status:** RESTRUCTURING ARCHITECTURE SPECIFICATION ONLY  
> **Phase:** Phase 2A — Project Structure Audit & Restructuring Design  
> **Rule Enforcement:** Zero source code files, schemas, configs, or routes have been moved, renamed, edited, or deleted. No dependencies have been installed. This document serves as the implementation blueprint for the future restructuring phase.

---

## 1. Executive Summary

The purpose of this audit is to transform the existing LUCOUS repository from a prototype with a **monolithic 1,834-line backend server** into a modular, production-ready codebase that:
1. Clearly isolates architectural concerns (routes, controllers, services, middleware, UI components).
2. Directly supports the **Phase 1 Target Workflow** (*Teacher ➔ Publish ➔ Unique Code ➔ Student Learning Loop*).
3. Resolves technical debt (hardcoded API URLs, numeric ID type mismatches, orphan stub files, missing npm scripts).
4. Enables effortless developer onboarding without forcing engineers to decipher thousands of lines of mixed Express logic.

---

## 2. Current Repository Tree (As-Is)

```
LUCOUS/ (c:\Shiva\Lucous2509-main\)
├── .gitignore                             # Git ignore rules
├── AGENTS.md                              # Next.js 16 breaking change rules
├── CLAUDE.md                              # Reference pointer
├── components.json                        # shadcn/ui configuration
├── eslint.config.mjs                      # ESLint 9 flat configuration
├── next.config.ts                         # Next.js config
├── package-lock.json                      # Frontend lockfile
├── package.json                           # Frontend dependencies & scripts
├── postcss.config.mjs                     # Tailwind CSS PostCSS plugin
├── README.md                              # Boilerplate Next.js readme
├── tsconfig.json                          # TypeScript configuration
│
├── backend/                               # Standalone Express backend
│   ├── package-lock.json                  # Backend lockfile
│   ├── package.json                       # Backend dependencies (missing start script, points to index.js)
│   ├── server.js                          # ⚠️ MONOLITH: 1,834 lines (All routes, logic, AI, payments)
│   └── prisma/
│       ├── schema.prisma                  # 18 MongoDB data models
│       ├── seed.js                        # CBSE Class 10 Math & Science seed script
│       └── migrations/                    # Legacy SQL migration folders from initial dev
│           ├── migration_lock.toml
│           ├── 20260923073326_init/
│           ├── 20260923133519_scalable_structure/
│           └── 20260923134134_add_content_author/
│
├── docs/                                  # Architectural audit & handover documentation
│   ├── 01-PROJECT-OVERVIEW.md to 21-TARGET-DATABASE-ARCHITECTURE.md
│   └── 22-TARGET-PROJECT-STRUCTURE.md     # (This document)
│
├── public/                                # Static assets
│   ├── brand/lucous-logo.png              # Primary logo asset
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg
│
└── src/                                   # Frontend Next.js application
    ├── app/                               # App Router
    │   ├── globals.css                    # Tailwind CSS v4 imports & color variables
    │   ├── icon.svg                       # Favicon
    │   ├── layout.tsx                     # Root layout (fonts, providers)
    │   ├── page.tsx                       # Public marketing landing page (14 sections)
    │   ├── (dashboard)/                   # Authenticated dashboard route group
    │   │   ├── [role]/dashboard/page.tsx  # Dynamic role dashboard router (student/teacher/parent/admin)
    │   │   └── student/                   # Student subpages
    │   │       ├── courses/page.tsx       # Course catalog & enrollment
    │   │       ├── games/page.tsx         # Arcade games & leaderboard
    │   │       ├── learn/page.tsx         # Topic lesson reading flow
    │   │       ├── play/page.tsx          # Fast quiz game (5 Qs, instant check)
    │   │       ├── practice/page.tsx      # Practice quiz (8 Qs, batch submit)
    │   │       ├── profile/page.tsx       # Student profile editor
    │   │       ├── results/page.tsx       # Historical scores & weak topics
    │   │       ├── retest/page.tsx        # Adaptive retest runner
    │   │       ├── test/page.tsx          # Topic test (30 Qs, batch submit)
    │   │       └── tutor/page.tsx         # AI tutor chat page
    │   └── auth/                          # Authentication routes
    │       ├── page.tsx                   # Role selection landing page
    │       └── [role]/                    # Dynamic role auth
    │           ├── forgot-password/page.tsx
    │           ├── login/page.tsx
    │           └── signup/page.tsx
    │
    ├── components/                        # UI Components
    │   ├── logo.tsx                       # Multicolor brand logo
    │   ├── providers.tsx                  # ThemeProvider, MotionConfig, Sonner Toaster
    │   ├── admin/admin-home.tsx           # Admin console (overview, users, courses)
    │   ├── auth/                          # Auth forms and shell guards
    │   │   ├── auth-layout.tsx            # Centered auth card container
    │   │   ├── forgot-password-form.tsx   # OTP password reset form
    │   │   ├── login-form.tsx             # Email/password login form
    │   │   ├── require-role.tsx           # Shell guard for teacher/parent/admin
    │   │   ├── role-gate.tsx              # ⚠️ DEAD STUB: Replaced by require-role.tsx
    │   │   ├── role-selection.tsx         # 4-card role selector
    │   │   └── signup-form.tsx            # Role-specific signup form
    │   ├── parent/parent-home.tsx         # Parent child linking & telemetry
    │   ├── teacher/teacher-home.tsx       # Teacher courses, students, AI MCQ generator
    │   ├── student/                       # Student workspace components
    │   │   ├── courses-view.tsx           # Course catalog & Razorpay modal
    │   │   ├── games-view.tsx             # Arcade runner & XP leaderboard
    │   │   ├── learn-flow.tsx             # Lesson reader with "Mark complete"
    │   │   ├── profile-view.tsx           # Profile editor
    │   │   ├── quiz-runner.tsx            # Multi-mode MCQ assessment engine
    │   │   ├── require-student.tsx        # Student shell header & sign-out guard
    │   │   ├── results-view.tsx           # Scores breakdown & weak topics list
    │   │   ├── student-home.tsx           # Student dashboard root
    │   │   ├── topic-picker.tsx           # 5-tier curriculum cascade picker
    │   │   └── tutor-view.tsx             # AI tutor chat interface
    │   ├── site/                          # Marketing landing page components
    │   │   ├── anim.tsx, announcement-bar.tsx, dialogs.tsx, navbar.tsx, section.tsx, theme-toggle.tsx
    │   │   └── sections/ (14 sections: hero, problem, how-it-works, games, ai-team, skilltech, etc.)
    │   └── ui/                            # 14 reusable shadcn/ui primitives
    │
    └── lib/                               # Utilities, types & helpers
        ├── api.ts                         # ⚠️ apiFetch client + hardcoded API_URL + types
        ├── auth.ts                        # Role definitions, signup field schemas, session storage
        ├── data.ts                        # Static landing page data, game metadata, search index
        ├── use-session.ts                 # React useSyncExternalStore hydration-safe hook
        └── utils.ts                       # Tailwind cn utility
```

---

## 3. Current Frontend Analysis

### Strengths:
1. **Clean Route Grouping:** `src/app/(dashboard)/` and `src/app/auth/` clearly separate authenticated areas from authentication forms.
2. **Modular Landing Page:** 14 isolated section components in [`src/components/site/sections/`](file:///c:/Shiva/Lucous2509-main/src/components/site/sections/) keep [`page.tsx`](file:///c:/Shiva/Lucous2509-main/src/app/page.tsx) under 50 lines.
3. **Robust Reusable Assessment Engine:** [`quiz-runner.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/quiz-runner.tsx) and [`topic-picker.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/topic-picker.tsx) handle all 4 quiz modes cleanly.

### Deficiencies:
1. **Hardcoded API URL Duplication:** `const API_URL = "http://localhost:5000/api"` is copy-pasted across 4 files:
   - [`src/lib/api.ts:3`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts#L3)
   - [`src/components/auth/login-form.tsx:18`](file:///c:/Shiva/Lucous2509-main/src/components/auth/login-form.tsx#L18)
   - [`src/components/auth/signup-form.tsx:21`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx#L21)
   - [`src/components/auth/forgot-password-form.tsx:16`](file:///c:/Shiva/Lucous2509-main/src/components/auth/forgot-password-form.tsx#L16)
2. **TypeScript ID Type Inconsistency:** Interfaces in [`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts) type `id` as `number`, while backend MongoDB uses `string`.
3. **Dead Stub Component:** [`src/components/auth/role-gate.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/role-gate.tsx) is completely unused.
4. **Missing Shared Educational Component Namespace:** Shared learning components (`quiz-runner`, `topic-picker`, `learn-flow`) currently reside inside `src/components/student/`, making future teacher module previewing awkward.

---

## 4. Current Backend Analysis

### Strengths:
1. **Feature Breadth:** Complete implementations for auth, curriculum, testing, scoring, AI chat, and payments already exist.
2. **Zero Incompatible Dependencies:** Express 5, Prisma 6, and modern Node native `fetch` are used consistently.

### Deficiencies:
1. **Extreme Monolithic Concentration:** [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js) contains **1,834 lines** covering 40+ endpoints, auth middleware, payment webhooks, database queries, and OpenAI clients in a single file.
2. **Lack of Separation of Concerns:** Database queries (`prisma.<model>`), HTTP routing, input validation, and business logic are intermingled inside route handler callbacks.
3. **Configuration & Script Deficiencies:**
   - `backend/package.json` specifies `"main": "index.js"` (a file that does not exist).
   - No `npm start` or `npm run dev` script exists.
   - `JWT_SECRET` defaults to an insecure fallback string.

---

## 5. `backend/server.js` Responsibility Map

Below is the line-by-line mapping of all 1,834 lines in [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js):

| Line Range | Domain / Responsibility | Current Functions & Routes | Target Destination Module |
| :--- | :--- | :--- | :--- |
| **1 – 56** | Server Bootstrap & Health | Express initialization, CORS, raw body verify, `GET /api/health` | `src/server.js`, `src/config/cors.js` |
| **57 – 130** | User Registration | `registerUser()`, `POST /api/auth/register/*` (student, teacher, parent) | `controllers/authController.js`, `routes/authRoutes.js` |
| **131 – 191** | User Login | `POST /api/auth/login`, bcrypt compare, JWT sign | `controllers/authController.js` |
| **192 – 253** | User Profile & Logout | `GET /api/auth/me`, `PATCH /api/auth/profile`, `POST /api/auth/logout` | `controllers/authController.js` |
| **254 – 414** | OTP & Password Reset | `issueOtp()`, `/api/auth/send-otp`, `/verify-otp`, `/forgot-password`, `/reset-password` | `services/otpService.js`, `controllers/authController.js` |
| **415 – 498** | Authentication Middleware | `authenticate`, `requireRole`, `requireStudent`, `requireTeacher` | `middleware/auth.js` |
| **499 – 593** | Curriculum Cascade Navigation | `GET /api/student/boards`, `/classes`, `/subjects`, `/chapters`, `/topics` | `controllers/curriculumController.js`, `routes/curriculumRoutes.js` |
| **594 – 683** | Student Content & Question Check | `GET /api/student/content`, `GET /api/student/questions`, `POST /api/student/check` | `controllers/studentController.js` |
| **684 – 758** | Assessment Attempts & Scoring | `POST /api/student/attempts` (Evaluates answers, calculates score %) | `controllers/studentController.js`, `services/scoringService.js` |
| **759 – 832** | Attempt History & Weak Topics | `GET /api/student/results`, `GET /api/student/weak-topics` (<60% calculation) | `controllers/studentController.js` |
| **833 – 872** | Lesson Progress Tracking | `POST /api/student/progress`, `GET /api/student/progress` | `controllers/studentController.js` |
| **873 – 983** | Teacher Materials & Content | `GET/POST /api/teacher/materials`, `GET/POST /api/teacher/content` | `controllers/teacherController.js`, `routes/teacherRoutes.js` |
| **984 – 1045** | Course Authoring & Updates | `POST /api/courses`, `PUT /api/courses/:id` | `controllers/courseController.js`, `routes/courseRoutes.js` |
| **1046 – 1118** | Teacher Course & Student Telemetry | `GET /api/teacher/courses`, `GET /api/teacher/students` | `controllers/teacherController.js` |
| **1119 – 1224** | Course Browsing & Enrollment | `GET /api/courses`, `GET /api/courses/:id`, `POST /api/enrollments`, `GET /my` | `controllers/courseController.js` |
| **1225 – 1290** | Admin Console Endpoints | `GET /api/admin/stats`, `GET /api/admin/users`, `GET /api/admin/courses` | `controllers/adminController.js`, `routes/adminRoutes.js` |
| **1291 – 1372** | Parent Portal Endpoints | `POST /api/parent/link`, `GET /api/parent/children`, `GET /child/:id/overview` | `controllers/parentController.js`, `routes/parentRoutes.js` |
| **1373 – 1488** | Games & Leaderboard | `GET /api/games`, `POST /api/games/submit`, `GET /leaderboard`, `GET /me` | `controllers/gameController.js`, `routes/gameRoutes.js` |
| **1489 – 1646** | AI Tutor & Question Generation | `callAi()`, `POST /api/ai/tutor`, `POST /api/ai/generate-content` | `services/aiService.js`, `controllers/aiController.js` |
| **1647 – 1834** | Razorpay Payments & Webhooks | `GET /config`, `POST /order`, `POST /verify`, `POST /webhook`, HMAC verification | `services/paymentService.js`, `controllers/paymentController.js` |

---

## 6. Target Frontend Structure

We avoid unnecessary abstractions. We maintain Next.js App Router conventions and group components strictly by domain responsibility:

```
src/
├── app/                                   # Next.js App Router (Preserved)
│   ├── (dashboard)/
│   │   ├── [role]/dashboard/page.tsx
│   │   ├── student/                       # Existing student pages
│   │   │   └── modules/[id]/page.tsx      # Target: Student module workspace (Phase 5)
│   │   └── teacher/                       # Target: Teacher module pages (Phase 4)
│   │       ├── modules/new/page.tsx
│   │       └── modules/[id]/page.tsx
│   ├── auth/                              # Preserved
│   ├── globals.css, layout.tsx, page.tsx
│
├── components/
│   ├── admin/admin-home.tsx               # Preserved
│   ├── auth/                              # Preserved (role-gate.tsx marked for deletion)
│   ├── parent/parent-home.tsx             # Preserved
│   ├── teacher/                           # Expanded for modules
│   │   ├── teacher-home.tsx               # Preserved
│   │   └── module-builder/                # Target: Module creation components (Phase 4)
│   ├── student/                           # Preserved
│   │   ├── enter-code-dialog.tsx          # Target: Unique code entry modal (Phase 5)
│   │   └── ... (existing student views)
│   ├── learning/                          # Shared educational components
│   │   ├── quiz-runner.tsx                # Reusable assessment engine
│   │   ├── topic-picker.tsx               # Reusable 5-tier curriculum cascade
│   │   └── learn-flow.tsx                 # Reusable reading lesson reader
│   ├── site/                              # Preserved marketing components
│   └── ui/                                # Preserved shadcn primitives
│
├── lib/
│   ├── api.ts                             # Centralized API client (NEXT_PUBLIC_API_URL)
│   ├── auth.ts                            # Session & role utilities
│   ├── data.ts                            # Static metadata & search index
│   ├── use-session.ts                     # React sync session hook
│   └── utils.ts                           # cn utility
│
└── types/                                 # Centralized TypeScript definitions
    └── api.ts                             # Synchronized MongoDB string ID contracts
```

---

## 7. Target Backend Structure

The target backend decomposes the 1,834-line monolith into focused, testable modules:

```
backend/
├── prisma/
│   ├── schema.prisma                      # Database models
│   └── seed.js                            # Seed script
│
├── src/
│   ├── server.js                          # Clean Express app configuration & server startup (<80 lines)
│   │
│   ├── config/
│   │   ├── env.js                         # Validated environment variables (JWT_SECRET, PORT, etc.)
│   │   └── prisma.js                      # Shared PrismaClient singleton instance
│   │
│   ├── middleware/
│   │   ├── auth.js                        # authenticate, requireRole, requireStudent, requireTeacher
│   │   └── errorHandler.js                # Global error catching & standard JSON error formatting
│   │
│   ├── routes/
│   │   ├── authRoutes.js                  # /api/auth/*
│   │   ├── curriculumRoutes.js            # /api/curriculum/* (boards, classes, subjects, topics)
│   │   ├── studentRoutes.js               # /api/student/* (attempts, results, progress)
│   │   ├── teacherRoutes.js               # /api/teacher/* (modules, materials, students)
│   │   ├── parentRoutes.js                # /api/parent/* (links, overview)
│   │   ├── adminRoutes.js                 # /api/admin/* (stats, users, approvals)
│   │   ├── courseRoutes.js                # /api/courses/*, /api/enrollments/*
│   │   ├── gameRoutes.js                  # /api/games/*
│   │   ├── aiRoutes.js                    # /api/ai/*
│   │   └── paymentRoutes.js               # /api/payments/*
│   │
│   ├── controllers/                       # Request parsing, Prisma execution, response formatting
│   │   ├── authController.js
│   │   ├── curriculumController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── parentController.js
│   │   ├── adminController.js
│   │   ├── courseController.js
│   │   ├── gameController.js
│   │   ├── aiController.js
│   │   └── paymentController.js
│   │
│   └── services/                          # External integrations & domain business logic
│       ├── aiService.js                   # OpenAI API client & prompt assembly
│       ├── paymentService.js              # Razorpay API client & HMAC-SHA256 verification
│       ├── scoringService.js              # MCQ attempt scoring & weak topic classification
│       └── otpService.js                  # OTP generation & verification
│
├── package.json                           # Updated with start & dev scripts
└── package-lock.json
```

---

## 8. `server.js` Decomposition Plan

### Resulting Target `backend/src/server.js` (< 80 Lines):

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const prisma = require("./config/prisma");
const errorHandler = require("./middleware/errorHandler");

// Import Route Handlers
const authRoutes = require("./routes/authRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const gameRoutes = require("./routes/gameRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.options("/*splat", cors());
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// Health Check
app.get("/api/health", async (_req, res) => {
  await prisma.$runCommandRaw({ ping: 1 });
  res.json({ success: true, message: "LUCOUS backend is running", database: "connected" });
});

// Route Mounting
app.use("/api/auth", authRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", courseRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`LUCOUS server running on http://localhost:${env.PORT}`);
});
```

---

## 9. API Client Architecture Plan

### Problem in Existing Code:
`http://localhost:5000/api` is duplicated in 4 distinct files.

### Target Architecture:
1. **Single Source of Truth ([`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts)):**
   ```typescript
   export const API_URL = 
     process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
   ```
2. **Environment Variable Configuration:**
   - Development (`.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
   - Staging / Production: `NEXT_PUBLIC_API_URL=https://api.lucous.app/api`
3. **Refactor Auth Forms:**
   - `login-form.tsx`, `signup-form.tsx`, and `forgot-password-form.tsx` remove local `const API_URL = ...` and import `API_URL` directly from `@/lib/api`.

---

## 10. Type & ID Consistency Plan

### Problem in Existing Code:
In [`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts), `id` is typed as `number` on `Board`, `Grade`, `Subject`, `Chapter`, `Topic`, `ContentItem`, `Question`, and `Attempt`, while MongoDB stores 24-character hexadecimal ObjectId strings.

### Target Type Definitions ([`src/types/api.ts`](file:///c:/Shiva/Lucous2509-main/src/types/api.ts)):
```typescript
export interface Board {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  boardId: string;
  gradeId: string;
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  _count?: { topics: number };
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  _count?: { questions: number; contents: number };
}

export interface ContentItem {
  id: string;
  topicId: string;
  title: string;
  body: string;
  order: number;
}

export interface Question {
  id: string;
  topicId?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface Attempt {
  id: string;
  userId: string;
  topicId: string;
  moduleId?: string | null;
  mode: "PLAY" | "PRACTICE" | "TEST" | "RETEST";
  correct: number;
  total: number;
  score: number;
  createdAt: string;
  topic?: { id: string; name: string; chapter?: { id: string; name: string } };
}
```

---

## 11. Authentication Structure Plan

To prevent security vulnerabilities identified in Phase 0:
1. **Centralized Auth Middleware (`backend/src/middleware/auth.js`):**
   - Validates Bearer token using `env.JWT_SECRET`.
   - Enforces role checks: `requireRole(role)`.
   - Injects `req.userId` and `req.role`.
2. **Teacher Approval Enforcement:**
   - In `backend/src/controllers/authController.js`:
     ```javascript
     if (user.role === "TEACHER" && user.approvalStatus !== "APPROVED") {
       return res.status(403).json({
         success: false,
         message: "Your teacher account is pending administrative approval."
       });
     }
     ```
3. **Session Secret Security:**
   - `backend/src/config/env.js` throws an error on boot if `NODE_ENV === "production"` and `JWT_SECRET` is unset or matches development defaults.

---

## 12. Role-Based Structure Alignment

```text
TEACHER WORKFLOW:
  Routes:      backend/src/routes/teacherRoutes.js
  Controller:  backend/src/controllers/teacherController.js
  Components:  src/components/teacher/

STUDENT WORKFLOW:
  Routes:      backend/src/routes/studentRoutes.js
  Controller:  backend/src/controllers/studentController.js
  Components:  src/components/student/ & src/components/learning/

PARENT WORKFLOW:
  Routes:      backend/src/routes/parentRoutes.js
  Controller:  backend/src/controllers/parentController.js
  Components:  src/components/parent/

ADMIN WORKFLOW:
  Routes:      backend/src/routes/adminRoutes.js
  Controller:  backend/src/controllers/adminController.js
  Components:  src/components/admin/
```

---

## 13. LearningModule Architectural Readiness

The target structure establishes clear locations for implementing the Phase 1 target workflow:

1. **Teacher Module Authoring:**
   - Route: `POST /api/teacher/modules` in `routes/teacherRoutes.js`.
   - Controller: `createModule`, `publishModule`, `unpublishModule` in `controllers/teacherController.js`.
   - Unique Code Generator: `generateUniqueCode()` helper in `services/codeService.js`.
2. **Student Code Redemption:**
   - Route: `POST /api/student/modules/join` in `routes/studentRoutes.js`.
   - Controller: `joinModuleByCode` in `controllers/studentController.js`.
3. **Student Learning Sequence:**
   - Step 1 (Lesson): Reuses `src/components/learning/learn-flow.tsx`.
   - Step 2 (Game): Reuses `src/components/student/games-view.tsx` (`GameRunner`).
   - Step 3 (Test): Reuses `src/components/learning/quiz-runner.tsx` (tagged with `moduleId`).

---

## 14. File-by-File Migration Plan

| # | Current Path | Target Path | Action | Reason | Dependency Risk |
| :-: | :--- | :--- | :---: | :--- | :---: |
| 1 | `backend/server.js` | `backend/src/server.js` | **MOVE & DECOMPOSE** | Split monolith into routes, controllers, and services. | Medium |
| 2 | *None (inside server.js)* | `backend/src/config/env.js` | **NEW** | Centralize and validate environment variables. | Low |
| 3 | *None (inside server.js)* | `backend/src/config/prisma.js` | **NEW** | Shared PrismaClient singleton instance. | Low |
| 4 | *None (inside server.js)* | `backend/src/middleware/auth.js` | **NEW** | Modular authentication and role verification. | Low |
| 5 | *None (inside server.js)* | `backend/src/middleware/errorHandler.js` | **NEW** | Standardized error response handling. | Low |
| 6 | *None (inside server.js)* | `backend/src/routes/*.js` (10 files) | **NEW** | Domain-specific REST route definitions. | Medium |
| 7 | *None (inside server.js)* | `backend/src/controllers/*.js` (10 files) | **NEW** | Request handlers and Prisma queries. | Medium |
| 8 | *None (inside server.js)* | `backend/src/services/*.js` (4 files) | **NEW** | External clients (OpenAI, Razorpay, OTP, Scoring). | Low |
| 9 | `backend/package.json` | `backend/package.json` | **MODIFY** | Fix `main: src/server.js`, add `start` and `dev` scripts. | Low |
| 10| `src/components/auth/role-gate.tsx`| *None* | **DELETE** | Unused stub replaced by `require-role.tsx`. | Zero |
| 11| `src/lib/api.ts` | `src/lib/api.ts` | **MODIFY** | Centralize `API_URL` with `NEXT_PUBLIC_API_URL`. | Low |
| 12| *None (types in api.ts)*| `src/types/api.ts` | **NEW** | Standardize MongoDB string ID TypeScript interfaces. | Low |
| 13| `src/components/student/quiz-runner.tsx`| `src/components/learning/quiz-runner.tsx` | **MOVE** | Shared educational assessment engine. | Low |
| 14| `src/components/student/topic-picker.tsx`| `src/components/learning/topic-picker.tsx` | **MOVE** | Shared 5-tier curriculum cascade picker. | Low |
| 15| `src/components/student/learn-flow.tsx` | `src/components/learning/learn-flow.tsx` | **MOVE** | Shared reading lesson component. | Low |
| 16| `backend/prisma/schema.prisma` | `backend/prisma/schema.prisma` | **KEEP** | Preserved in original location. | Zero |
| 17| `backend/prisma/seed.js` | `backend/prisma/seed.js` | **KEEP** | Preserved in original location. | Zero |

---

## 15. Import Dependency Risk Analysis

1. **Backend Internal Requires:**
   - Because `backend/` was previously a single file, all internal calls will now use relative paths (`const prisma = require("../config/prisma")`).
   - **Risk Mitigation:** Decompose controllers with verified exports before rewiring routes.
2. **Frontend Path Aliases (`@/*`):**
   - The TypeScript path alias `@/*` maps to `./src/*`.
   - Moving `quiz-runner.tsx` to `src/components/learning/quiz-runner.tsx` requires updating imports in `student/play/page.tsx`, `student/practice/page.tsx`, `student/test/page.tsx`, and `student/retest/page.tsx`.
   - **Risk Mitigation:** TypeScript compiler (`npx tsc --noEmit`) immediately flags any broken import paths.
3. **No Circular Dependencies:**
   - Unidirectional data flow: `Routes ➔ Controllers ➔ Services / Prisma`. Controllers never import Routes.

---

## 16. Git Safety & Small Commit Strategy

To guarantee zero regression and instant rollback capabilities, the restructuring must be executed across **5 distinct atomic commits**:

```text
Commit 1: Frontend API Client & Type Standardization
  - Centralize NEXT_PUBLIC_API_URL in src/lib/api.ts
  - Create src/types/api.ts with string ID interfaces
  - Remove local API_URL strings from auth forms
  - Safely delete src/components/auth/role-gate.tsx

Commit 2: Educational Component Namespace
  - Create src/components/learning/
  - Move quiz-runner.tsx, topic-picker.tsx, learn-flow.tsx
  - Update imports in student page routes
  - Verify frontend compiles cleanly (npm run build)

Commit 3: Backend Foundation & Configuration
  - Create backend/src/config/ (env.js, prisma.js)
  - Create backend/src/middleware/ (auth.js, errorHandler.js)
  - Create backend/src/services/ (aiService.js, paymentService.js, otpService.js)
  - Update backend/package.json scripts

Commit 4: Backend Routes & Controllers Decomposition
  - Create backend/src/controllers/ and backend/src/routes/
  - Decompose backend/server.js into backend/src/server.js (<80 lines)
  - Remove original legacy backend/server.js

Commit 5: Verification & End-to-End Sanity Check
  - Test health check, auth, curriculum, quiz attempts, and AI routes
  - Verify both development servers run without errors
```

---

## 17. Handover Directory Structure

When a new engineer joins the LUCOUS project, the directory layout communicates system boundaries immediately:

```text
WHERE DO I FIND...?
• Frontend Root & Pages:       src/app/
• Reusable UI Widgets:         src/components/ui/
• Marketing Landing Page:      src/components/site/
• Student Workspace:           src/components/student/
• Teacher Workspace:           src/components/teacher/
• Parent Portal:               src/components/parent/
• Admin Console:               src/components/admin/
• Shared Educational Engines:  src/components/learning/ (QuizRunner, TopicPicker)
• Frontend API & Session:      src/lib/api.ts & src/lib/auth.ts
• Backend Entrypoint:          backend/src/server.js
• Backend Routes & API:        backend/src/routes/
• Backend Business Logic:      backend/src/controllers/
• Third-Party APIs (AI/Pay):   backend/src/services/
• Database Models & Seed:      backend/prisma/
```

---

## 18. Final Proposed Repository Tree

```
LUCOUS/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
│
├── backend/
│   ├── package-lock.json
│   ├── package.json                       # "main": "src/server.js", scripts: start, dev
│   ├── prisma/
│   │   ├── schema.prisma                  # (Preserved)
│   │   └── seed.js                        # (Preserved)
│   └── src/
│       ├── server.js                      # Express app bootstrap (<80 lines)
│       ├── config/
│       │   ├── env.js
│       │   └── prisma.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── curriculumRoutes.js
│       │   ├── studentRoutes.js
│       │   ├── teacherRoutes.js
│       │   ├── parentRoutes.js
│       │   ├── adminRoutes.js
│       │   ├── courseRoutes.js
│       │   ├── gameRoutes.js
│       │   ├── aiRoutes.js
│       │   └── paymentRoutes.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── curriculumController.js
│       │   ├── studentController.js
│       │   ├── teacherController.js
│       │   ├── parentController.js
│       │   ├── adminController.js
│       │   ├── courseController.js
│       │   ├── gameController.js
│       │   ├── aiController.js
│       │   └── paymentController.js
│       └── services/
│           ├── aiService.js
│           ├── paymentService.js
│           ├── scoringService.js
│           └── otpService.js
│
├── docs/                                  # 22 architecture & audit documents
├── public/                                # Static assets
└── src/
    ├── app/                               # Next.js App Router
    ├── components/
    │   ├── admin/
    │   ├── auth/
    │   ├── parent/
    │   ├── teacher/
    │   ├── student/
    │   ├── learning/                      # quiz-runner, topic-picker, learn-flow
    │   ├── site/
    │   └── ui/
    ├── lib/
    └── types/
```

---

## 19. Categorized Restructuring Priorities

### MUST DO (Critical for maintainability & bug prevention):
1. Decompose `backend/server.js` into modular routes, controllers, and services.
2. Centralize `NEXT_PUBLIC_API_URL` in `src/lib/api.ts` and eliminate duplicated hardcoded strings.
3. Fix `backend/package.json` (`main: src/server.js` and add `start`/`dev` scripts).
4. Standardize MongoDB string ID types in `src/types/api.ts`.
5. Remove unused stub `src/components/auth/role-gate.tsx`.

### SHOULD DO (Strong architectural improvement):
1. Group shared educational components (`quiz-runner`, `topic-picker`, `learn-flow`) under `src/components/learning/`.
2. Introduce `backend/src/config/env.js` with fail-fast validation for `JWT_SECRET` in production.
3. Centralize error handling middleware in `backend/src/middleware/errorHandler.js`.

### OPTIONAL (Nice to have later):
1. Clean up legacy SQL migration directories in `backend/prisma/migrations/`.
2. Add rate limiting middleware (`express-rate-limit`) to auth routes.

### DO NOT DO NOW (Postpone until feature implementation):
1. Do not implement `LearningModule` code or routes yet (Phase 3/4).
2. Do not touch `backend/prisma/schema.prisma` yet (Phase 2).
3. Do not modify marketing landing page sections.

---

## 20. Recommended Restructuring Execution Order

```text
Step 1: Approve this Phase 2A Restructuring Blueprint.
Step 2: Commit 1 (Frontend API URL & Type Alignment).
Step 3: Commit 2 (Namespace Educational Components to src/components/learning/).
Step 4: Commit 3 (Backend Config, Middleware & Services Setup).
Step 5: Commit 4 (Backend Routes & Controllers Decomposition of server.js).
Step 6: Commit 5 (Sanity Verification of All Existing Endpoints).
Step 7: Proceed to Phase 2 (Apply Target Schema to Prisma & run db push).
Step 8: Proceed to Phase 3 (Implement LearningModule Backend APIs).
```
