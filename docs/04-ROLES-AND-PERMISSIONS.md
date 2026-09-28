# 04 - Roles and Permissions Audit: LUCOUS

## 1. Role Definitions & Case Mismatch

The platform defines four user roles across two different naming conventions:
- **Frontend ([`src/lib/auth.ts`](file:///c:/Shiva/Lucous2509-main/src/lib/auth.ts#L9)):** Lowercase strings: `"student"`, `"parent"`, `"teacher"`, `"admin"`.
- **Backend ([`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L58)):** Uppercase strings: `"STUDENT"`, `"PARENT"`, `"TEACHER"`, `"ADMIN"`.
- **Mapping:** Handled manually in [`src/components/auth/login-form.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/login-form.tsx#L20):
  ```typescript
  const ROLE_MAP: Record<AuthRole, string> = {
    student: "STUDENT",
    parent: "PARENT",
    teacher: "TEACHER",
    admin: "ADMIN",
  };
  ```

---

## 2. Authentication & JWT Payload

1. **Password Encryption:** Passwords are hashed with `bcryptjs.hash(password, 10)` during registration ([`backend/server.js:90`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L90)).
2. **JWT Issuance:** On successful login ([`backend/server.js:163`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L163)):
   ```javascript
   const token = jwt.sign(
     { userId: user.id, role: user.role },
     JWT_SECRET,
     { expiresIn: "7d" }
   );
   ```
3. **Payload Structure:**
   - `userId`: MongoDB ObjectId string
   - `role`: `"STUDENT"` | `"PARENT"` | `"TEACHER"` | `"ADMIN"`
   - `iat`, `exp`: 7-day expiration timestamp

---

## 3. Backend Authorization Enforcement

### Middleware Implementations ([`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L416-L457))

```javascript
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    authenticate(req, res, () => {
      if (req.role !== role) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      next();
    });
  };
}

const requireStudent = requireRole("STUDENT");
const requireTeacher = requireRole("TEACHER");
```

### Route Protection Summary

| Endpoint Category | Backend Guard | Enforcement Level |
| :--- | :--- | :--- |
| Public / Landing Page / Health | None | Publicly accessible. |
| Auth (`/login`, `/register/*`, `/send-otp`, `/reset-password`) | None | Publicly accessible. |
| Student Endpoints (`/api/student/*`) | `requireStudent` | Strict: Must be `"STUDENT"`. |
| Teacher Materials & Content (`/api/teacher/*`) | `requireTeacher` | Strict: Must be `"TEACHER"`. |
| Course Management (`POST /api/courses`) | `requireRole("TEACHER")` | Strict: Must be `"TEACHER"`. |
| Course Edit (`PUT /api/courses/:id`) | `authenticate` | Must be Course owner or `"ADMIN"`. |
| Admin Endpoints (`/api/admin/*`) | `requireRole("ADMIN")` | Strict: Must be `"ADMIN"`. |
| Parent Endpoints (`/api/parent/*`) | `requireRole("PARENT")` | Strict: Must be `"PARENT"`. |
| AI Tutor (`/api/ai/tutor`) | `authenticate` | Any authenticated user. |
| AI Question Generator (`/api/ai/generate-content`) | `requireRole("TEACHER")` | Strict: Must be `"TEACHER"`. |
| Payments (`/api/payments/order`, `/verify`) | `authenticate` | Any authenticated user. |

---

## 4. Frontend Route Guards

### Student Shell: `RequireStudent` ([`src/components/student/require-student.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/student/require-student.tsx))
- Wraps every student subpage (`/student/dashboard`, `/student/learn`, `/student/games`, etc.).
- Inspects client session via `getSession()`:
  ```typescript
  React.useEffect(() => {
    const current = getSession();
    if (!current || current.role !== "student") {
      router.replace("/auth");
    }
  }, [router]);
  ```
- Renders `Checking session…` fallback until storage is read.

### Role Shell: `RequireRole` ([`src/components/auth/require-role.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/auth/require-role.tsx))
- Wraps `/teacher/dashboard`, `/parent/dashboard`, `/admin/dashboard`.
- Enforces `current.role === role`; otherwise calls `router.replace("/auth")`.

---

## 5. Audit: Teacher Approval Workflow (Target vs. Current)

> **STAKEHOLDER REQUIREMENT:**
> Teacher Signup ➔ Pending Admin Approval ➔ Admin Reviews Teacher ➔ If Accepted ➔ Teacher Can Login.

### Codebase Verification Result: 🔴 NOT IMPLEMENTED

#### Evidence from the Code:
1. **No Approval State in Database:**
   - In [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma#L14-L44), the `User` model has only:
     ```prisma
     role String @default("STUDENT")
     isVerified Boolean @default(false)
     ```
   - There is **no field** for `approvalStatus`, `approvedBy`, `status`, or `rejectionReason`.
2. **Registration Creates Immediate Active Teacher:**
   - In [`backend/server.js:128`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L128), `POST /api/auth/register/teacher` sets `role: "TEACHER"` and creates the record immediately.
3. **Login Does Not Check Approval Status:**
   - In [`backend/server.js:132-191`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L132), the login handler verifies email and password match. It does **not** check `isVerified`, nor does it check any approval condition. Any newly registered teacher can log in immediately.
4. **Admin Has No Review or Approval Endpoint:**
   - In [`backend/server.js:1254-1274`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1254), `GET /api/admin/users` only lists users. There are **zero** endpoints for `POST /api/admin/teachers/:id/approve` or `reject`.
5. **No Frontend UI for Approval State:**
   - In [`src/components/auth/signup-form.tsx:88`](file:///c:/Shiva/Lucous2509-main/src/components/auth/signup-form.tsx#L88), after successful registration, it directly navigates to `/auth/${role}/login`. There is no "Pending Approval" screen.
   - In [`src/components/admin/admin-home.tsx`](file:///c:/Shiva/Lucous2509-main/src/components/admin/admin-home.tsx), the users panel renders a read-only list with no action buttons.
