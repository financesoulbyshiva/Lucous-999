# 19 - Developer Handover & Operations Guide: LUCOUS

## 1. Project Purpose & High-Level Summary

**LUCOUS** is an AI-augmented gamified EdTech platform delivering structured Indian curriculum study (CBSE/ICSE Classes 8–12), arcade learning games, adaptive MCQ tests, parent monitoring, and teacher course commerce. 

This repository is organized as a decoupled Next.js 16 frontend and an Express.js 5 backend using Prisma ORM with MongoDB.

---

## 2. Technical Stack Quick Reference

| Component | Technology | Version | Location |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js App Router | `16.3.5` | Root (`src/`) |
| **UI Library** | React | `19.2.8` | Root (`src/`) |
| **Styling** | Tailwind CSS v4 + PostCSS | `^4` | [`src/app/globals.css`](file:///c:/Shiva/Lucous2509-main/src/app/globals.css) |
| **Icons & UI Primitives** | Lucide React, shadcn/ui | `^1.47.0`, `^4.21.0` | [`src/components/ui/`](file:///c:/Shiva/Lucous2509-main/src/components/ui/) |
| **Backend Framework** | Express.js | `5.2.1` | [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js) |
| **Database & ORM** | MongoDB via Prisma ORM | `6.19.3` | [`backend/prisma/`](file:///c:/Shiva/Lucous2509-main/backend/prisma/) |
| **Auth** | Stateless JWT + bcryptjs | `9.0.3` / `3.0.3` | [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js) |
| **AI Integration** | OpenAI REST API (`gpt-4o-mini`) | Direct HTTP Fetch | [`backend/server.js:1490`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1490) |
| **Payment Gateway** | Razorpay REST API + Checkout.js | Direct HTTP Fetch | [`backend/server.js:1648`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1648) |

---

## 3. Local Development Setup Guide

### Step 1: Clone & Prerequisites
- Ensure Node.js (v18.17+ or v20+) and a running MongoDB instance (local or MongoDB Atlas connection string) are available.

### Step 2: Configure Environment Variables
Create `.env` in the `backend/` directory:
```bash
# backend/.env
PORT=5000
NODE_ENV=development
JWT_SECRET=lucous-local-development-secret-key-32chars
MONGODB_URI=mongodb://localhost:27017/lucous

# Optional Integrations
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-4o-mini

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

Create `.env.local` in the project root:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Install Backend Dependencies & Seed Database
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
```
*Expected Output:*
```
Seed complete: { boards: 1, grades: 1, subjects: 2, chapters: 4, topics: 8, contents: 8, questions: 32 }
```

### Step 4: Install Frontend Dependencies
```bash
# From root directory
npm install
```

### Step 5: Start Development Servers
**Terminal 1 (Backend API):**
```bash
cd backend
node server.js
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
# From root directory
npm run dev
# Frontend running at http://localhost:3000
```

---

## 4. Default Seeded Accounts & Curriculum

The seed script ([`backend/prisma/seed.js`](file:///c:/Shiva/Lucous2509-main/backend/prisma/seed.js)) populates:
- **Board:** `CBSE`
- **Grade:** `Class 10`
- **Subjects:**
  - `Mathematics`: Chapters "Real Numbers", "Quadratic Equations"
  - `Science`: Chapters "Chemical Reactions and Equations", "Light – Reflection and Refraction"
- **Topics & Questions:** 8 topics, each seeded with reading lessons and 4 multiple-choice questions.

*Note on User Accounts:* The seed script currently populates curriculum rows only. Create users by registering through [`/auth`](file:///c:/Shiva/Lucous2509-main/src/app/auth/page.tsx).

---

## 5. Architectural Directory Tour

### Frontend (`src/`)
- [`src/app/page.tsx`](file:///c:/Shiva/Lucous2509-main/src/app/page.tsx): Main marketing page with 14 sections.
- [`src/app/(dashboard)/[role]/dashboard/page.tsx`](file:///c:/Shiva/Lucous2509-main/src/app/%28dashboard%29/%5Brole%5D/dashboard/page.tsx): Dynamic router dispatching to role workspaces.
- [`src/components/student/`](file:///c:/Shiva/Lucous2509-main/src/components/student/): Student workspace views (`student-home`, `learn-flow`, `quiz-runner`, `topic-picker`, `results-view`, `courses-view`, `games-view`, `tutor-view`).
- [`src/components/teacher/teacher-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/teacher/teacher-home.tsx): Teacher dashboard with Courses, Students, AI generator, and Profile.
- [`src/components/parent/parent-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/parent/parent-home.tsx): Parent dashboard with Child linking and academic overview.
- [`src/components/admin/admin-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx): Admin console with platform stats, users list, and courses.
- [`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts): Central HTTP fetch client (`apiFetch`) and data interfaces.
- [`src/lib/auth.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/auth.ts): Role configuration, signup field schemas, and session storage.

### Backend (`backend/`)
- [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js): Monolithic Express 5 server containing all routes and logic.
- [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma): MongoDB Prisma schema with 18 models.
- [`backend/prisma/seed.js`](file:///c:/Shiva/Lucous2509-main/backend/prisma/seed.js): Curriculum seed script.

---

## 6. Critical Implementation Gotchas for Developers

1. **Prisma MongoDB String IDs vs. Frontend Number IDs:**
   - In `backend/prisma/schema.prisma`, all primary keys are MongoDB ObjectIds (`String`).
   - In `src/lib/api.ts`, several models still type `id` as `number`. When making API modifications, ensure IDs are treated as `string`.
2. **Hardcoded API URL:**
   - `http://localhost:5000/api` is currently hardcoded in [`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts), [`src/components/auth/login-form.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/login-form.tsx), [`src/components/auth/signup-form.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx), and [`src/components/auth/forgot-password-form.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/forgot-password-form.tsx).
   - Centralize this to `process.env.NEXT_PUBLIC_API_URL` during the next development phase.
3. **Teacher Course Pricing Unit:**
   - Database stores price in **paise** (`50000` = ₹500.00). Ensure any form adjustments convert between Rupees and paise accurately.
4. **Backend Script Missing:**
   - `backend/package.json` lacks a `start` script. Run with `node server.js` or add `"start": "node server.js"` to `package.json`.

---

## 7. Recommended Next Phase Implementation Priorities

### Priority 1: Architectural Cleanliness & Parity
- Centralize `NEXT_PUBLIC_API_URL`.
- Standardize all entity ID types to `string` in `src/lib/api.ts`.
- Add `start` and `dev` scripts to `backend/package.json`.
- Safely remove unused stub [`src/components/auth/role-gate.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/role-gate.tsx).

### Priority 2: Teacher Verification & Approval Flow
- Add `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`) to the `User` model.
- Restrict teacher login to `APPROVED` accounts.
- Provide approval/rejection action buttons in the Admin dashboard.

### Priority 3: Classroom Unique Code & Assignment System
- Introduce a `ClassCode` / `LessonBundle` model.
- Allow teachers to generate shareable codes.
- Allow students to enter codes to unlock teacher-assigned learning bundles.

### Priority 4: Teacher Content Authoring UI
- Add UI tabs in `TeacherHome` to connect to existing backend routes `/api/teacher/materials` and `/api/teacher/content`.
- Enable publishing, unpublishing, and editing of lessons.
