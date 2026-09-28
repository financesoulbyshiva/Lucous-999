# 08 - Current Admin Flow Audit: LUCOUS

## 1. Trace of the Current Admin Flow

```mermaid
sequenceDiagram
    autonumber
    actor A as Administrator
    participant UI as Admin Console (Next.js)
    participant API as Express API (:5000)
    participant DB as MongoDB (Prisma)

    Note over A,UI: 1. Authentication (No Public Signup)
    A->>UI: Navigates to /auth/admin/login
    A->>UI: Enters Admin Email & Password
    UI->>API: POST /api/auth/login
    API-->>UI: Returns JWT (role: "ADMIN")
    UI->>UI: Navigates to /admin/dashboard

    Note over A,UI: 2. Admin Console Panels
    alt Tab: Overview (Analytics)
        UI->>API: GET /api/admin/stats
        API->>DB: Aggregates counts (Users, Students, Teachers, Parents, Admins, Courses, Enrollments, Attempts, Questions)
        API-->>UI: Returns 9 platform metric totals
        UI->>UI: Displays metric stat cards
    else Tab: Users (Read-Only Directory)
        A->>UI: Selects role filter (All, STUDENT, TEACHER, PARENT, ADMIN)
        UI->>API: GET /api/admin/users?role=...
        API->>DB: prisma.user.findMany(where: role, take: 200)
        API-->>UI: Returns user list (id, name, email, role, isVerified)
        UI->>UI: Displays users list with role & verified badges
    else Tab: Courses (Read-Only Catalogue)
        UI->>API: GET /api/admin/courses
        API->>DB: prisma.course.findMany(include: teacher)
        API-->>UI: Returns all courses with author & enrollment counts
        UI->>UI: Displays courses directory
    else Tab: Profile
        UI->>API: GET /api/auth/me & PATCH /api/auth/profile
    end
```

---

## 2. Requirement vs. Implementation Matrix

| Stakeholder Target Requirement | Current Codebase Implementation | Status | Evidence / File Path |
| :--- | :--- | :---: | :--- |
| **Admin Login** | Login form available. Signup is disabled by design (`allowsSignup: false`). Admin accounts must be pre-seeded in database. | 🟢 IMPLEMENTED | [`src/lib/auth.ts:55`](file:///c:/Shiva/Lucous2509-main/src/lib/auth.ts#L55)<br>[`src/components/auth/login-form.tsx:24`](file:///c:/Shiva/Lucous2509-main/src/components/auth/login-form.tsx#L24) |
| **Admin Dashboard** | Console view with 4 tabs: Overview, Users, Courses, Profile. Protected by `RequireRole("admin")`. | 🟢 IMPLEMENTED | [`src/components/admin/admin-home.tsx:34`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx#L34)<br>[`src/components/auth/require-role.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/require-role.tsx) |
| **Platform Analytics** | `GET /api/admin/stats` calculates 9 live metric counts from MongoDB using `prisma.<model>.count()`. | 🟢 IMPLEMENTED | [`src/components/admin/admin-home.tsx:73-123`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx#L73)<br>[`backend/server.js:1230-1252`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1230) |
| **Review Teacher Accounts** | Admin can filter the user list by `TEACHER` and see name, email, and verification status. No detailed review modal or submitted documents. | 🟡 PARTIALLY IMPLEMENTED | [`src/components/admin/admin-home.tsx:125-192`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx#L125)<br>[`backend/server.js:1254`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1254) |
| **Approve / Reject Teachers** | No approval/rejection endpoints exist in backend. No action buttons exist in the admin users list. | 🔴 NOT IMPLEMENTED | Audited across `backend/server.js` and `admin-home.tsx`. |
| **Manage Users (Edit/Ban/Delete)** | User list is completely read-only. No user edit, delete, password reset, or ban functions exist. | 🔴 NOT IMPLEMENTED | [`src/components/admin/admin-home.tsx:176-188`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx#L176) |
| **Manage Courses & Lessons** | Admin can view all platform courses (`GET /api/admin/courses`). Backend allows Admin to update course via `PUT /api/courses/:id`. No course delete/unpublish or lesson editing in UI. | 🟡 PARTIALLY IMPLEMENTED | [`src/components/admin/admin-home.tsx:194-247`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx#L194)<br>[`backend/server.js:1023`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1023) |
