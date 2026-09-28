# 03 - Current Project Structure: LUCOUS

## 1. Top-Level Repository Layout

```
c:\Shiva\Lucous2509-main\
├── .gitignore               # Git ignore rules for node_modules, build artifacts, env files
├── AGENTS.md                # Agent instruction regarding Next.js 16 breaking changes
├── CLAUDE.md                # Pointer referencing AGENTS.md
├── components.json          # shadcn/ui configuration file (style: base-nova)
├── eslint.config.mjs        # Next.js flat ESLint 9 configuration
├── next.config.ts           # Next.js configuration stub
├── package-lock.json        # Frontend dependency lockfile
├── package.json             # Frontend package definition & scripts
├── postcss.config.mjs       # Tailwind CSS PostCSS plugin config
├── README.md                # Default Next.js boilerplate readme
├── tsconfig.json            # TypeScript configuration (paths: @/* -> ./src/*)
├── backend/                 # Node.js / Express 5 API Server & Prisma ORM
├── docs/                    # Architecture audit and developer handover documentation
├── public/                  # Public static assets & brand graphics
└── src/                     # Next.js App Router application source code
```

---

## 2. Frontend Directory Structure (`src/`)

```
src/
├── app/                                  # Next.js App Router root
│   ├── globals.css                       # Tailwind v4 import, CSS variables & color themes
│   ├── icon.svg                          # Browser favicon
│   ├── layout.tsx                        # Root HTML layout with fonts and Providers
│   ├── page.tsx                          # Public marketing landing page (14 sections)
│   ├── (dashboard)/                      # Route group for authenticated dashboards
│   │   ├── [role]/dashboard/page.tsx     # Dynamic role router (student/teacher/parent/admin)
│   │   └── student/                      # Student sub-views
│   │       ├── courses/page.tsx          # Student course catalog and enrollments
│   │       ├── games/page.tsx            # Learning games arcade and leaderboard
│   │       ├── learn/page.tsx            # Topic lesson study flow
│   │       ├── play/page.tsx             # Fast quiz game (5 Qs, instant feedback)
│   │       ├── practice/page.tsx         # Practice mode (8 Qs, batch submit)
│   │       ├── profile/page.tsx          # Student profile management
│   │       ├── results/page.tsx          # Attempt history & weak topic list
│   │       ├── retest/page.tsx           # Weak topic adaptive retest runner
│   │       ├── test/page.tsx             # Formal topic test (30 Qs, batch submit)
│   │       └── tutor/page.tsx            # AI tutor chat page
│   └── auth/                             # Authentication routes
│       ├── page.tsx                      # Role selection landing page
│       └── [role]/                       # Dynamic role authentication
│           ├── forgot-password/page.tsx  # OTP-based password reset
│           ├── login/page.tsx            # Role-specific login
│           └── signup/page.tsx           # Role-specific registration
│
├── components/                           # UI and domain components
│   ├── logo.tsx                          # Multicolor LUCOUS logo component
│   ├── providers.tsx                     # ThemeProvider, MotionConfig, Sonner Toaster
│   ├── admin/
│   │   └── admin-home.tsx                # Admin overview stats, user directory, courses
│   ├── auth/
│   │   ├── auth-layout.tsx               # Centered card layout for auth screens
│   │   ├── forgot-password-form.tsx      # Multi-step OTP send and reset form
│   │   ├── login-form.tsx                # Email/password login with remember me
│   │   ├── require-role.tsx              # Auth shell guard for teacher/parent/admin
│   │   ├── role-gate.tsx                 # [UNUSED STUB] Placeholder component
│   │   ├── role-selection.tsx            # 4-card role selector (Student/Parent/Teacher/Admin)
│   │   └── signup-form.tsx               # Role-specific signup form
│   ├── parent/
│   │   └── parent-home.tsx               # Child linking, progress overview, score history
│   ├── site/                             # Public marketing landing page components
│   │   ├── anim.tsx                      # Framer motion animation wrappers (Reveal, Counter)
│   │   ├── announcement-bar.tsx          # Top notification banner
│   │   ├── dialogs.tsx                   # Command-K search modal & dialog provider
│   │   ├── navbar.tsx                    # Header nav with scroll progress & mobile sheet
│   │   ├── section.tsx                   # Section layout containers and color tokens
│   │   ├── theme-toggle.tsx              # Light / dark theme toggle button
│   │   └── sections/                     # 14 distinct landing page sections
│   │       ├── ai-team.tsx               # AI assistant personas showcase
│   │       ├── cta.tsx                   # Final call-to-action banner
│   │       ├── faq.tsx                   # Accordion FAQ
│   │       ├── footer.tsx                # Footer with navigation and social links
│   │       ├── games.tsx                 # Game modes showcase
│   │       ├── gamification.tsx          # Badges, streaks, and leaderboard showcase
│   │       ├── hero.tsx                  # Hero banner with animated mock dashboard
│   │       ├── how-it-works.tsx          # 4-step learning flow
│   │       ├── pricing.tsx               # Pricing plans with monthly/yearly switch
│   │       ├── problem.tsx               # Educational problem statement
│   │       ├── schools.tsx               # Institutional school features
│   │       ├── skilltech.tsx             # Career & vocational tracks
│   │       ├── student-dashboard.tsx     # Student workspace preview
│   │       ├── teacher-dashboard.tsx     # Teacher workspace preview
│   │       └── testimonials.tsx          # User reviews & social proof
│   ├── student/                          # Student workspace components
│   │   ├── courses-view.tsx              # Course browser, Razorpay modal, my courses
│   │   ├── games-view.tsx                # Game runner, XP leaderboard, user stats
│   │   ├── learn-flow.tsx                # Lesson body display with "Mark as complete"
│   │   ├── profile-view.tsx              # Profile field editor
│   │   ├── quiz-runner.tsx               # Core interactive MCQ engine for all modes
│   │   ├── require-student.tsx           # Student auth shell header with sign out
│   │   ├── results-view.tsx              # Attempt stats & weak topic recommendations
│   │   ├── student-home.tsx              # Student dashboard root
│   │   ├── topic-picker.tsx              # 5-tier cascading picker (Board -> Topic)
│   │   └── tutor-view.tsx                # AI tutor conversational chat interface
│   ├── teacher/
│   │   └── teacher-home.tsx              # Courses CRUD, enrolled students, AI generator
│   └── ui/                               # Reusable shadcn/ui primitives
│       ├── accordion.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
│
└── lib/                                  # Shared frontend utilities and models
    ├── api.ts                            # HTTP client (apiFetch) & data interfaces
    ├── auth.ts                           # Role definitions, signup fields, session storage
    ├── data.ts                           # Static landing page data, game metadata, search index
    ├── use-session.ts                    # Client-side hydration-safe session hook
    └── utils.ts                          # cn helper export
```

---

## 3. Backend Directory Structure (`backend/`)

```
backend/
├── package.json                          # Backend dependencies (Express, Prisma, JWT, Bcrypt)
├── package-lock.json                     # Backend lockfile
├── server.js                             # Monolithic 1,834-line Express server
└── prisma/
    ├── schema.prisma                     # 13 MongoDB data models & relations
    ├── seed.js                           # Seed script: CBSE Class 10 Math & Science
    └── migrations/                       # Legacy SQL migration folders (from initial dev)
        ├── migration_lock.toml
        ├── 20260923073326_init/
        ├── 20260923133519_scalable_structure/
        └── 20260923134134_add_content_author/
```

---

## 4. Key File Sizes & Code Density

| Path | Lines | Bytes | Purpose |
| :--- | :---: | :---: | :--- |
| [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js) | 1,834 | 58,491 | **Entire backend REST API**, routes, middleware, and logic. |
| [`src/lib/data.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/data.ts) | 802 | 21,988 | Landing page copy, game definitions, search indexing. |
| [`src/components/teacher/teacher-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/teacher/teacher-home.tsx) | 524 | 18,835 | Teacher workspace (Courses, Students, AI MCQ generator). |
| [`src/components/student/quiz-runner.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/quiz-runner.tsx) | 434 | 13,617 | Interactive quiz engine for Play, Practice, Test, Retest. |
| [`backend/prisma/seed.js`](file:///c:/Shiva/Lucous2509-main/backend/prisma/seed.js) | 264 | 13,973 | CBSE curriculum seed data (Maths & Science). |
| [`src/components/student/games-view.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/games-view.tsx) | 394 | 12,574 | Arcade game runner, stats, and leaderboard UI. |
| [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma) | 312 | 10,936 | Prisma MongoDB schema for 13 entities. |
| [`src/components/parent/parent-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/parent/parent-home.tsx) | 318 | 10,916 | Parent workspace (link child, review stats). |
| [`src/components/student/student-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/student-home.tsx) | 300 | 10,865 | Student dashboard overview, weak topics, progress bar. |
| [`src/components/admin/admin-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx) | 320 | 10,470 | Admin console (platform metrics, users list, courses). |
