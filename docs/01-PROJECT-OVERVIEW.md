# 01 - Project Overview: LUCOUS

## 1. Executive Summary

**LUCOUS** (*"Learn. Play. Test. Improve."*) is an AI-powered, gamified EdTech platform designed for primary, secondary, and senior secondary education (predominantly Indian curriculum standards like CBSE/ICSE Classes 8–12, alongside vocational and career skill tracks). 

The platform's goal is to turn academic studying into an engaging, progress-oriented experience through:
- Structured hierarchical curriculum browsing (**Board → Class/Grade → Subject → Chapter → Topic**)
- Game-based learning challenges with instant feedback and XP reward loops
- Adaptive testing with automatic detection of weak areas (topics scoring below 60%) and focused retests
- Dedicated user experiences for four key ecosystem roles: **Students**, **Teachers**, **Parents**, and **Administrators**
- AI tutoring and automated curriculum question generation
- Direct-to-consumer monetized educational courses via payment gateway integration

---

## 2. Current State vs. Marketing Claims

The public marketing pages ([`src/components/site/sections/`](file:///c:/Shiva/Lucous2509-main/src/components/site/sections/)) showcase an expansive vision including 8 specialized AI bot personas, comprehensive skill tech tracks, multiplayer games, and school district licensing. 

However, an audit of the actual application code reveals the true current state:
- **Core Educational Loop:** A functional data-driven curriculum hierarchy with lesson reading, interactive quiz runners (modes: Play, Practice, Test, Retest), and scoring persisted in MongoDB.
- **Role Isolation:** Basic separation between Student, Teacher, Parent, and Admin views exists via JWT token claims and client-side guards.
- **AI Capabilities:** An OpenAI API endpoint for a chat tutor and automated MCQ question generation.
- **Monetization:** A server-side Razorpay order and signature verification pipeline for course purchases.
- **Target Workflows:** Key stakeholder workflows—such as teacher verification approval by admins, unique assignment codes, custom lesson publishing workflows, and dynamic multiplayer games—are **either partially implemented or not yet built**.

---

## 3. Platform Roles & High-Level Scope

| Role | Intended Product Scope | Current Codebase Implementation |
| :--- | :--- | :--- |
| **Student** | Study lessons, play educational games, take tests, take adaptive retests, consult AI tutor, enroll in courses. | 🟢 **Substantially Functional.** Can browse seeded CBSE curriculum, complete lessons, run quizzes, view scores/weak topics, chat with AI, view leaderboard, and purchase courses. |
| **Teacher** | Create/manage courses, review student performance, generate AI content/quizzes, upload teaching materials, assign class codes. | 🟡 **Partially Implemented.** Can create and update basic courses, view enrolled students and their scores, and generate MCQs via AI. Cannot manage learning content or upload materials from the UI. Approval flow is absent. |
| **Parent** | Link one or more student accounts, monitor lessons completed, view test attempt history, inspect weak topic scores. | 🟢 **Functioning.** Can link student by email, view list of children, view total XP, completed lessons count, weak topics (<60%), and recent test scores. |
| **Admin** | Review & approve new teachers, manage all users, manage courses/lessons, oversee platform metrics and system health. | 🟡 **Read-Only / Basic.** Can view summary stats (counts of users, courses, attempts, etc.), filter user lists by role, and view courses. Cannot approve/reject teachers, edit/ban users, or manage curriculum from the UI. |

---

## 4. Technology Stack Summary

### Frontend Application
- **Framework:** Next.js 16.3.5 (App Router with async route parameters)
- **UI Library:** React 19.2.8, React DOM 19.2.8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `@import "tailwindcss"`), CSS variables for theming
- **Component Primitives:** shadcn/ui (Radix/Base-UI primitives, Sonner toast, Lucide React icons)
- **Animation:** Framer Motion 13.4.0
- **Client Session Management:** `localStorage` / `sessionStorage` tokens with React `useSyncExternalStore` hook

### Backend API Server
- **Runtime & Framework:** Node.js, Express.js 5.2.1
- **Database & ORM:** MongoDB accessed via Prisma ORM 6.19.3
- **Authentication:** Stateless JSON Web Tokens (`jsonwebtoken`), passwords hashed with `bcryptjs`
- **External Services:**
  - **OpenAI REST API:** Used for `/api/ai/tutor` and `/api/ai/generate-content`
  - **Razorpay REST API:** Used for `/api/payments/order` and `/api/payments/verify`

---

## 5. Summary Status of System Capabilities

| Feature Area | Current Implementation Status | Notes |
| :--- | :---: | :--- |
| Public Landing Page & Search | 🟢 IMPLEMENTED | Full marketing website with dialog search index and theme switcher. |
| Multi-Role Authentication | 🟢 IMPLEMENTED | Dedicated register/login for Student, Teacher, Parent, Admin with JWT issuance. |
| Password Reset / OTP | 🟡 PARTIALLY IMPLEMENTED | Logic exists; OTP returned in JSON/console in non-prod. No real SMTP configured. |
| Curriculum Hierarchy Engine | 🟢 IMPLEMENTED | 5-level cascade: Board → Grade → Subject → Chapter → Topic. |
| Student Quiz & Test Engine | 🟢 IMPLEMENTED | Instant feedback (Play), batch testing (Practice, Test, Retest), history & weak topic tagging. |
| Student AI Tutor | 🟢 IMPLEMENTED | Conversational memory persisted to MongoDB `AiMessage` collection via OpenAI. |
| Games & Leaderboard | 🟡 PARTIALLY IMPLEMENTED | Solo quiz-based game runner and XP leaderboard. Multiplayer/custom game creation not built. |
| Course Catalog & Enrollment | 🟢 IMPLEMENTED | Free enrollment and Razorpay order creation for paid courses. |
| Teacher Course Management | 🟢 IMPLEMENTED | Course creation and metadata editing; price stored in paise. |
| Teacher AI MCQ Generator | 🟢 IMPLEMENTED | Prompts OpenAI for MCQs and can save directly to a chosen `Topic`. |
| Teacher Content/Material Upload | 🔴 NOT IMPLEMENTED IN UI | Backend routes exist (`/api/teacher/materials`, `/api/teacher/content`), but no UI in dashboard. |
| Teacher Verification / Approval | 🔴 NOT IMPLEMENTED | Teachers can log in immediately upon registration. Admin has no review/approval action. |
| Unique Code / Class Invite | 🔴 NOT IMPLEMENTED | Neither backend data models nor UI exist for teacher-generated class codes. |
| Parent Progress Dashboard | 🟢 IMPLEMENTED | Links child by email, displays overview cards, weak topics, and score logs. |
| Admin Platform Management | 🟡 PARTIALLY IMPLEMENTED | Read-only stats and user listing. No mutation capabilities (approve, ban, modify). |
