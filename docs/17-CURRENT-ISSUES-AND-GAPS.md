# 17 - Current Issues and Architectural Gaps: LUCOUS

This document presents a comprehensive gap analysis contrasting the **CURRENT IMPLEMENTATION** against the **STAKEHOLDER TARGET REQUIREMENTS**.

---

## 1. Teacher Approval Gaps

### Gap 1.1: Missing Teacher Verification & Approval State
- **Current Behavior:** Teacher signs up, record is immediately created with `role: "TEACHER"`, and teacher can log in immediately.
- **Required Behavior:** Teacher signup enters a `PENDING_APPROVAL` status. Admin must inspect credentials and approve or reject. Only approved teachers can log in.
- **Affected Files:**
  - [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma#L14) (`User` model lacks `status` / `approvalStatus`)
  - [`backend/server.js:128`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L128) (`POST /api/auth/register/teacher`)
  - [`backend/server.js:143`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L143) (`POST /api/auth/login`)
  - [`src/components/auth/signup-form.tsx:88`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx#L88)
- **Risk / Impact:** High. Any unvetted individual can create teacher accounts and publish content or solicit students.
- **Recommended Direction:** Add `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`) to `User`. Restrict login with `if (user.role === 'TEACHER' && user.approvalStatus !== 'APPROVED') return res.status(403)`. Add approval actions to Admin Console.

---

## 2. Unique-Code Gaps

### Gap 2.1: Missing Class / Lesson Unique Assignment Code
- **Current Behavior:** Content is browsed globally through the curriculum tree. Courses are enrolled either freely or via payment. There is no concept of a class invitation or assignment code.
- **Required Behavior:** Teachers publish lessons/games/tests and generate a **Unique Code**. Students enter this code on their dashboard to access that assigned bundle.
- **Affected Files:**
  - `backend/prisma/schema.prisma` (Requires an `Assignment` / `ClassCode` / `LessonBundle` model)
  - `backend/server.js` (Requires routes for code generation and code redemption)
  - `src/components/teacher/teacher-home.tsx` (Requires code generation UI)
  - `src/components/student/student-home.tsx` (Requires code entry modal/input)
- **Risk / Impact:** High. Core teacher-led classroom workflow cannot function.
- **Recommended Direction:** Create a `LessonBundle` or `Classroom` model with an indexed `uniqueCode` field. Provide teacher action to "Generate Code" and student input to "Redeem Code".

---

## 3. Publishing-State Gaps

### Gap 3.1: Missing Publish / Unpublish Lifecycle in UI
- **Current Behavior:**
  - `Course` model has no status or published flag at all.
  - `LearningContent` and `Question` have `status: "PUBLISHED"`, but there is zero UI in `teacher-home.tsx` to toggle between Draft, Published, or Unpublished.
- **Required Behavior:** Teachers can draft, preview, publish, unpublish, and archive their learning materials, games, and quizzes.
- **Affected Files:**
  - [`backend/prisma/schema.prisma:204`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma#L204) (`Course` model)
  - [`backend/server.js:986`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L986) (`/api/courses`)
  - [`src/components/teacher/teacher-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/teacher/teacher-home.tsx)
- **Risk / Impact:** Medium. Incomplete or experimental courses and lessons become immediately visible or cannot be taken down.
- **Recommended Direction:** Add `status String @default("DRAFT")` to `Course`. Add publish/unpublish action buttons in the teacher course card.

---

## 4. Workflow Gaps

### Gap 4.1: Teacher Lesson & Materials Management Missing from UI
- **Current Behavior:** Backend has `/api/teacher/materials` and `/api/teacher/content`, but `TeacherHome` has no tabs or UI for creating lessons or uploading syllabus files.
- **Required Behavior:** Teacher dashboard must support "Create AI Lesson", "Upload Materials", and "Manage Lessons".
- **Affected Files:**
  - [`src/components/teacher/teacher-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/teacher/teacher-home.tsx)
- **Risk / Impact:** High. Teachers are restricted to creating course metadata and generating MCQs, but cannot author reading lessons.
- **Recommended Direction:** Add a "Lessons & Content" tab in `TeacherHome` connecting to existing backend routes `/api/teacher/content` and `/api/teacher/materials`.

---

## 5. Database & Type Mismatch Gaps

### Gap 5.1: Prisma MongoDB String IDs vs. Frontend TypeScript Number IDs
- **Current Behavior:** In [`src/lib/api.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts), `Board`, `Grade`, `Subject`, `Chapter`, `Topic`, `ContentItem`, `Question`, and `Attempt` types have `id: number`. In Prisma MongoDB, they are 24-char hex strings.
- **Required Behavior:** Exact type parity between backend database output and frontend TypeScript interfaces.
- **Affected Files:**
  - [`src/lib/api.ts:58-136`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts#L58)
  - [`src/components/student/learn-flow.tsx:19`](file:///c:/Shiva/Lucous2509-main/src/components/student/learn-flow.tsx#L19) (`completedIds: number[]`)
- **Risk / Impact:** High. Causes type assertions, compiler warnings, and subtle lookup bugs when indexing objects or Sets by ID.
- **Recommended Direction:** Update all entity `id` types in `src/lib/api.ts` to `string`.

---

## 6. Authentication & Authorization Gaps

### Gap 6.1: Hardcoded Insecure JWT Secret
- **Current Behavior:** Server falls back to `"lucous-development-secret"` if `JWT_SECRET` is unset.
- **Required Behavior:** Mandatory validation on server boot throwing an error if `JWT_SECRET` is not configured in production.
- **Affected Files:**
  - [`backend/server.js:13`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L13)
- **Risk / Impact:** Critical. Predictable secret allows forging administrator tokens.
- **Recommended Direction:** Remove fallback in production and enforce a high-entropy secret check.

---

## 7. Deployment & Environment Gaps

### Gap 7.1: Hardcoded API Base URL in Frontend
- **Current Behavior:** `http://localhost:5000/api` is hardcoded across multiple frontend files.
- **Required Behavior:** Centralized `API_URL` reading `process.env.NEXT_PUBLIC_API_URL`.
- **Affected Files:**
  - [`src/lib/api.ts:3`](file:///c:/Shiva/Lucous2509-main/src/lib/api.ts#L3)
  - [`src/components/auth/login-form.tsx:18`](file:///c:/Shiva/Lucous2509-main/src/components/auth/login-form.tsx#L18)
  - [`src/components/auth/signup-form.tsx:21`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx#L21)
  - [`src/components/auth/forgot-password-form.tsx:16`](file:///c:/Shiva/Lucous2509-main/src/components/auth/forgot-password-form.tsx#L16)
- **Risk / Impact:** High. Cannot deploy to staging or production without manual file modifications.
- **Recommended Direction:** Replace hardcoded strings with a single exported constant in `src/lib/api.ts`.

### Gap 7.2: Backend `package.json` Missing Start Script & Wrong Main File
- **Current Behavior:** `backend/package.json` specifies `"main": "index.js"` and has no `start` script.
- **Required Behavior:** `"main": "server.js"` with `"scripts": { "start": "node server.js", "dev": "node --watch server.js" }`.
- **Affected Files:**
  - [`backend/package.json:5`](file:///c:/Shiva/Lucous2509-main/backend/package.json#L5)
- **Risk / Impact:** Medium. Deployment platforms (Heroku, Render, AWS) failing to find `index.js` or start script.
- **Recommended Direction:** Update `backend/package.json` scripts.

---

## 8. Frontend / UI Navigation Gaps

### Gap 8.1: Incomplete Student Workspace Shell Header
- **Current Behavior:** The student shell header ([`src/components/student/require-student.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/require-student.tsx)) contains only the logo and a Sign out button.
- **Required Behavior:** Fast switcher navigation or breadcrumbs allowing students to navigate between Learn, Play, Practice, Courses, Games, and AI Tutor without clicking back to `/student/dashboard`.
- **Affected Files:**
  - [`src/components/student/require-student.tsx:40-69`](file:///c:/Shiva/Lucous2509-main/src/components/student/require-student.tsx#L40)
- **Risk / Impact:** Medium. Causes unnecessary back-and-forth clicks and navigation friction.
- **Recommended Direction:** Introduce a secondary tab bar or breadcrumbs in `RequireStudent`.

### Gap 8.2: Orphaned Component `role-gate.tsx`
- **Current Behavior:** [`src/components/auth/role-gate.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/role-gate.tsx) is completely unused.
- **Recommended Direction:** Safely remove file during cleanup phase.

---

## 9. Learning Loop & Gamification Gaps

### Gap 9.1: XP Not Awarded for Standard Quizzes / Tests
- **Current Behavior:** Taking Practice, Tests, or Retests logs an `Attempt` but awards 0 XP to `User.xp`. Only the Games module awards XP.
- **Required Behavior:** Standard curriculum assessments should reward proportional XP to incentivize core academic study.
- **Affected Files:**
  - [`backend/server.js:685`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L685) (`POST /api/student/attempts`)
- **Risk / Impact:** Medium. Discourages standard curriculum study in favor of arcade play.
- **Recommended Direction:** Add `User.xp` increment calculation inside `POST /api/student/attempts`.

---

## 10. Parent Tracking Gaps

### Gap 10.1: Connection Code Not Processed
- **Current Behavior:** Parent signup form displays "Student connection code", but submission drops the field and linking requires typing the student's email.
- **Required Behavior:** Either support linking directly via student connection code or align form copy to state "Student Email".
- **Affected Files:**
  - [`src/lib/auth.ts:135`](file:///c:/Shiva/Lucous2509-main/src/lib/auth.ts#L135)
  - [`src/components/auth/signup-form.tsx:73`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx#L73)
- **Risk / Impact:** Low. Confuses parents during registration.
- **Recommended Direction:** Wire up connection code lookup or replace field with "Child's Registered Email".
