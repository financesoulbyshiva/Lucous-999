# 11 - API Inventory: LUCOUS Backend

This document catalogs every API route implemented in [`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js).

---

## 1. System & Health

### `GET /api/health`
- **Auth:** None (Public) | **Role:** None
- **Purpose:** System heartbeat and MongoDB connection ping (`prisma.$runCommandRaw({ ping: 1 })`).
- **Response:** `{ success: true, message: "LUCOUS backend is running", database: "connected" }`
- **Location:** Line 38

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Auth:** None | **Role:** Body-specified (`STUDENT` | `PARENT` | `TEACHER` | `ADMIN`)
- **Body:** `{ name, email, password, role, phone?, grade?, board?, school?, subject? }`
- **Models:** `User`
- **Location:** Line 126

### `POST /api/auth/register/student`
- **Auth:** None | **Role:** Forced to `STUDENT`
- **Body:** `{ name, email, password, grade?, board? }`
- **Location:** Line 127

### `POST /api/auth/register/teacher`
- **Auth:** None | **Role:** Forced to `TEACHER`
- **Body:** `{ name, email, password, school?, subject?, phone? }`
- **Location:** Line 128

### `POST /api/auth/register/parent`
- **Auth:** None | **Role:** Forced to `PARENT`
- **Body:** `{ name, email, password, phone? }`
- **Location:** Line 129

### `POST /api/auth/login`
- **Auth:** None | **Role:** Validates password against existing user
- **Body:** `{ email, password }`
- **Response:** `{ success: true, token, user: { id, name, email, role } }`
- **Models:** `User`
- **Location:** Line 132

### `GET /api/auth/me`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Response:** Full user profile (id, name, email, role, isVerified, phone, grade, board, school, subject, avatarUrl, xp)
- **Models:** `User`
- **Location:** Line 194

### `PATCH /api/auth/profile`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Body:** `{ name?, phone?, grade?, board?, school?, subject?, avatarUrl? }`
- **Models:** `User`
- **Location:** Line 228

### `POST /api/auth/logout`
- **Auth:** None | **Role:** None (Stateless acknowledgment)
- **Response:** `{ success: true, message: "Logged out" }`
- **Location:** Line 251

### `POST /api/auth/send-otp`
- **Auth:** None | **Role:** None
- **Body:** `{ email, purpose? }`
- **Models:** `Otp`, `User`
- **Location:** Line 288

### `POST /api/auth/verify-otp`
- **Auth:** None | **Role:** None
- **Body:** `{ email, code }`
- **Models:** `Otp`, `User` (updates `isVerified: true`)
- **Location:** Line 307

### `POST /api/auth/forgot-password`
- **Auth:** None | **Role:** None
- **Body:** `{ email }`
- **Models:** `User`, `Otp`
- **Location:** Line 356

### `POST /api/auth/reset-password`
- **Auth:** None | **Role:** None
- **Body:** `{ email, code, newPassword }`
- **Models:** `Otp`, `User`
- **Location:** Line 380

---

## 3. Student Curriculum & Testing (`/api/student`)

### `GET /api/student/boards`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** `{ success: true, boards: Board[] }`
- **Models:** `Board`
- **Location:** Line 504

### `GET /api/student/classes`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?boardId=`
- **Response:** `{ success: true, classes: Grade[] }`
- **Models:** `Grade`, `Subject`
- **Location:** Line 517

### `GET /api/student/subjects`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?boardId=&gradeId=`
- **Response:** `{ success: true, subjects: Subject[] }`
- **Models:** `Subject`
- **Location:** Line 538

### `GET /api/student/chapters`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?subjectId=`
- **Response:** `{ success: true, chapters: Chapter[] }`
- **Models:** `Chapter`
- **Location:** Line 558

### `GET /api/student/topics`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?chapterId=`
- **Response:** `{ success: true, topics: Topic[] }`
- **Models:** `Topic`
- **Location:** Line 577

### `GET /api/student/content`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?topicId=`
- **Response:** `{ success: true, contents: LearningContent[], completedIds: string[] }`
- **Models:** `LearningContent`, `StudentProgress`
- **Location:** Line 595

### `GET /api/student/questions`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Query:** `?topicId=&limit=`
- **Response:** Sanitized questions (omits `correct` index to prevent cheating)
- **Models:** `Question`
- **Location:** Line 629

### `POST /api/student/check`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Body:** `{ questionId, selected }`
- **Response:** `{ success: true, correct: boolean, correctIndex, explanation }`
- **Models:** `Question`
- **Location:** Line 662

### `POST /api/student/attempts`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Body:** `{ topicId, mode, answers: [{ questionId, selected }] }`
- **Response:** `{ success: true, attempt: Attempt, perQuestion: [...] }`
- **Models:** `Attempt`, `Question`
- **Location:** Line 685

### `GET /api/student/results`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** `{ success: true, attempts: Attempt[] }` (Last 50 attempts)
- **Models:** `Attempt`
- **Location:** Line 760

### `GET /api/student/weak-topics`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** `{ success: true, weakTopics: [...] }` (Topics where latest score < 60%)
- **Models:** `Attempt`, `Topic`
- **Location:** Line 778

### `POST /api/student/progress`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Body:** `{ contentId }`
- **Response:** `{ success: true, progress }`
- **Models:** `StudentProgress`
- **Location:** Line 835

### `GET /api/student/progress`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** `{ success: true, completedCount: number, totalContent: number }`
- **Models:** `StudentProgress`, `LearningContent`
- **Location:** Line 855

---

## 4. Teacher Management (`/api/teacher`)

### `GET /api/teacher/materials`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Response:** `{ success: true, materials: UploadedMaterial[] }`
- **Location:** Line 876

### `POST /api/teacher/materials`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Body:** `{ originalName, fileType, fileSize, boardId?, gradeId?, subjectId?, chapterId?, topicId? }`
- **Models:** `UploadedMaterial`
- **Location:** Line 893

### `GET /api/teacher/content`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Query:** `?topicId=`
- **Models:** `LearningContent`
- **Location:** Line 936

### `POST /api/teacher/content`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Body:** `{ topicId, title, body, order?, source?, status? }`
- **Models:** `LearningContent`
- **Location:** Line 953

### `GET /api/teacher/courses`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Response:** Courses created by this teacher with enrollment counts
- **Models:** `Course`, `Enrollment`
- **Location:** Line 1047

### `GET /api/teacher/students`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Response:** Enrolled students across teacher's courses, their attempt counts, and average scores
- **Models:** `Enrollment`, `Attempt`
- **Location:** Line 1072

### `GET /api/teacher/enrollments`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Response:** Detailed enrollment list
- **Models:** `Enrollment`
- **Location:** Line 1205

---

## 5. Courses & Enrollments (`/api/courses`, `/api/enrollments`)

### `GET /api/courses`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Response:** `{ success: true, courses: Course[] }`
- **Models:** `Course`
- **Location:** Line 1121

### `GET /api/courses/:id`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Response:** Single course details
- **Models:** `Course`
- **Location:** Line 1144

### `POST /api/courses`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Body:** `{ title, description, subject, board, price? }`
- **Models:** `Course`
- **Location:** Line 986

### `PUT /api/courses/:id`
- **Auth:** Bearer JWT | **Role:** Authoring `TEACHER` or `ADMIN`
- **Body:** `{ title?, description?, subject?, board?, price? }`
- **Models:** `Course`
- **Location:** Line 1017

### `POST /api/enrollments`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Body:** `{ courseId }` (Free courses only; paid require payment verification)
- **Models:** `Course`, `Enrollment`
- **Location:** Line 1162

### `GET /api/enrollments/my`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** Courses student is currently enrolled in
- **Models:** `Enrollment`
- **Location:** Line 1188

---

## 6. Parent Portal (`/api/parent`)

### `POST /api/parent/link`
- **Auth:** Bearer JWT | **Role:** `PARENT`
- **Body:** `{ studentEmail }`
- **Models:** `User`, `ParentChild`
- **Location:** Line 1294

### `GET /api/parent/children`
- **Auth:** Bearer JWT | **Role:** `PARENT`
- **Response:** List of linked children (id, name, email, grade, board)
- **Models:** `ParentChild`
- **Location:** Line 1321

### `GET /api/parent/child/:id/overview`
- **Auth:** Bearer JWT | **Role:** `PARENT`
- **Response:** `{ student, completedCount, attempts, weakTopics }`
- **Models:** `ParentChild`, `StudentProgress`, `Attempt`, `Topic`
- **Location:** Line 1329

---

## 7. Admin Console (`/api/admin`)

### `GET /api/admin/stats`
- **Auth:** Bearer JWT | **Role:** `ADMIN`
- **Response:** `{ stats: { users, students, teachers, parents, admins, courses, enrollments, attempts, questions } }`
- **Location:** Line 1230

### `GET /api/admin/users`
- **Auth:** Bearer JWT | **Role:** `ADMIN`
- **Query:** `?role=`
- **Response:** `{ success: true, users: AdminUser[] }`
- **Location:** Line 1254

### `GET /api/admin/courses`
- **Auth:** Bearer JWT | **Role:** `ADMIN`
- **Response:** All courses with teacher info
- **Location:** Line 1276

---

## 8. Games & Arcade (`/api/games`)

### `GET /api/games`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Response:** Hardcoded catalog of 4 games
- **Location:** Line 1374

### `POST /api/games/submit`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Body:** `{ gameId, topicId?, correct, total }`
- **Response:** `{ success: true, score, xpAwarded, totalXp }`
- **Models:** `GameScore`, `User` (increments `xp`)
- **Location:** Line 1398

### `GET /api/games/leaderboard`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Response:** Top 50 students ranked by `xp desc`
- **Models:** `User`
- **Location:** Line 1445

### `GET /api/games/me`
- **Auth:** Bearer JWT | **Role:** `STUDENT`
- **Response:** Student's total XP, game counts, and recent game scores
- **Models:** `User`, `GameScore`
- **Location:** Line 1460

---

## 9. AI Integration (`/api/ai`)

### `POST /api/ai/tutor`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Body:** `{ message, conversationId? }`
- **Response:** `{ success: true, configured: boolean, conversationId, reply }`
- **Models:** `AiMessage`
- **Location:** Line 1522

### `POST /api/ai/generate-content`
- **Auth:** Bearer JWT | **Role:** `TEACHER`
- **Body:** `{ topic, chapter?, subject?, difficulty?, count?, topicId?, save? }`
- **Response:** `{ success: true, count, saved, questions: [...] }`
- **Models:** `Question`
- **Location:** Line 1578

---

## 10. Payments & Razorpay (`/api/payments`)

### `GET /api/payments/config`
- **Auth:** None | **Role:** None
- **Response:** `{ success: true, configured: boolean, keyId: string | null }`
- **Location:** Line 1663

### `POST /api/payments/order`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Body:** `{ courseId }`
- **Models:** `Course`, `Payment`
- **Location:** Line 1671

### `POST /api/payments/verify`
- **Auth:** Bearer JWT | **Role:** Any authenticated user
- **Body:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId }`
- **Models:** `Payment`, `Enrollment` (Creates enrollment on success)
- **Location:** Line 1730

### `POST /api/payments/webhook`
- **Auth:** None (Validates HMAC header `x-razorpay-signature`) | **Role:** None
- **Models:** `Payment`, `Enrollment`
- **Location:** Line 1789
