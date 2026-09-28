# 18 - Target Workflow Requirements

> ⚠️ **IMPORTANT NOTICE:**  
> **THIS DOCUMENT DESCRIBES TARGET STAKEHOLDER REQUIREMENTS — NOT CURRENT CODEBASE IMPLEMENTATION.**  
> None of the workflows detailed in this document should be assumed to be fully operational in the existing codebase without consulting the gap analysis in [`docs/17-CURRENT-ISSUES-AND-GAPS.md`](file:///c:/Shiva/Lucous2509-main/docs/17-CURRENT-ISSUES-AND-GAPS.md).

---

## 1. Teacher Target Workflow

```mermaid
flowchart TD
    TSignup["Teacher Signup Form\n(Name, Email, Password, Credentials)"]
    Pending["Account State: PENDING_APPROVAL\n(Displays Pending Screen)"]
    AdminReview["Admin Reviews Teacher Profile & Credentials"]
    Decision{"Admin Decision"}
    Reject["Status: REJECTED\n(Notification / Login Blocked)"]
    Approve["Status: APPROVED\n(Welcome Email / Access Granted)"]
    TLogin["Teacher Login Allowed"]
    TDash["Teacher Dashboard"]
    
    TSignup --> Pending --> AdminReview --> Decision
    Decision -- Reject --> Reject
    Decision -- Approve --> Approve --> TLogin --> TDash

    subgraph ContentCreation["Teacher Content Creation & Publishing Lifecycle"]
        TDash --> Action1["Create AI Lesson\n(Prompt / Syllabus Ingestion)"]
        TDash --> Action2["Add / Create Games\n(Arcade Game Configuration)"]
        TDash --> Action3["Add / Create Tests & Quizzes\n(MCQs, Open-Ended, Rubrics)"]
        
        Action1 --> Bundle["Compile Lesson Bundle"]
        Action2 --> Bundle
        Action3 --> Bundle
        
        Bundle --> PublishAction["Publish Action"]
        PublishAction --> CodeGen["Generate Unique Code\n(e.g., 'MATH-X-492')"]
    end

    subgraph ContentManagement["Lifecycle Management"]
        CodeGen --> StateManage{"Management Controls"}
        StateManage --> Edit["Edit Content / Questions"]
        StateManage --> Unpublish["Unpublish / Retract from Students"]
        StateManage --> Republish["Republish Changes"]
        StateManage --> Archive["Archive / Delete"]
    end
```

### Acceptance Criteria for Teacher Workflow
1. **Approval Gate:** Newly signed-up teachers cannot obtain a JWT session or access `/teacher/dashboard` until an administrator marks their status as `APPROVED`.
2. **AI Lesson Creation:** Teachers can input curriculum parameters or notes to generate complete lesson units (explanatory texts, summaries, key formulas).
3. **Game & Quiz Authoring:** Teachers can attach specific questions to arcade game modes (Speed Challenge, Quiz Battle) and configure passing thresholds.
4. **Unique Code Generation:** Publishing an assignment or lesson package produces a distinct, shareable alphanumeric code.
5. **Full Lifecycle Controls:** Every published item must support:
   - **Publish:** Makes content discoverable to students who enter the code.
   - **Unpublish:** Hides content from active student view while preserving history.
   - **Edit:** Modifies questions, texts, or parameters with automatic versioning.
   - **Manage:** Monitors student completion rates, average scores, and individual student submissions.

---

## 2. Student Target Workflow

```mermaid
flowchart TD
    SAuth["Student Signup / Login"]
    SDash["Student Dashboard"]
    EnterCode["Enter Unique Code Dialog"]
    ContentUnlock["Access Assigned Learning Content Bundle"]
    
    SAuth --> SDash --> EnterCode --> ContentUnlock
    
    ContentUnlock --> Step1["1. Start AI Lesson\n(Interactive explanation, concept checks)"]
    Step1 --> Step2["2. Play Educational Game\n(Gamified reinforcement & XP gain)"]
    Step2 --> Step3["3. Give Test / Quiz\n(Formal assessment with timer)"]
    Step3 --> Step4["4. Submit Answers"]
    
    Step4 --> Result["Instant Result Delivery\n(Score %, Correct/Incorrect Breakdown)"]
    Result --> TrackPerf["Track Performance\n(Updated analytics, streak, leaderboard)"]
    TrackPerf --> IdentifyWeak["Identify Weak Topics\n(Topics scored < 60%)"]
    IdentifyWeak --> AdaptiveRetest["Adaptive Learning / Retest Engine\n(Targeted practice until mastery >= 60%)"]
```

### Acceptance Criteria for Student Workflow
1. **Code Redemption:** Students can enter a teacher's unique code to enroll in a private class or unlock a custom curriculum bundle.
2. **Integrated 3-Step Sequence:** The bundle guides the student seamlessly through:
   - **Lesson:** Concept exploration.
   - **Game:** Fast-paced gamified retention check.
   - **Test:** Graded verification.
3. **Instant Evaluation:** Scores, XP increments, and answer rationales are rendered immediately upon test submission.
4. **Weak Topic Remediation:** The platform automatically highlights topics where the score was under 60% and suggests focused retests.

---

## 3. Parent Target Workflow

```mermaid
flowchart TD
    PAuth["Parent Signup / Login"]
    PDash["Parent Dashboard"]
    LinkStudent["Link Student\n(via Connection Code or Student Email)"]
    Overview["Child Overview Hub"]
    
    PAuth --> PDash --> LinkStudent --> Overview
    
    Overview --> Track1["Track Learning Progress\n(Lessons completed, daily streak, time spent)"]
    Overview --> Track2["Track Test Results\n(Exam scores, date history, accuracy rates)"]
    Overview --> Track3["Track Weak Topics\n(Specific chapters & concepts requiring support)"]
```

### Acceptance Criteria for Parent Workflow
1. **Secure Student Linking:** Links parent accounts to students with mutual confirmation (or teacher/student connection code).
2. **Transparent Progress Tracking:** Real-time visibility into lessons completed and active study streaks.
3. **Actionable Insights:** Direct identification of weak topics so parents know where their child requires additional tutoring or practice.

---

## 4. Admin Target Workflow

```mermaid
flowchart TD
    AdminAuth["Admin Login"]
    AdminDash["Admin Console"]
    
    AdminAuth --> AdminDash
    
    AdminDash --> Task1["Review Teacher Accounts\n(Inspect pending registrations & credentials)"]
    Task1 --> Decision{"Approve / Reject Action"}
    Decision -- Approve --> Task1A["Mark APPROVED\n(Notifies Teacher)"]
    Decision -- Reject --> Task1B["Mark REJECTED\n(Provide feedback reason)"]
    
    AdminDash --> Task2["Manage Users\n(Inspect, edit, suspend, or ban accounts)"]
    AdminDash --> Task3["Manage Courses & Lessons\n(Content moderation, publish/unpublish overrides)"]
    AdminDash --> Task4["Platform Analytics\n(DAU, completion rates, financial revenue, server health)"]
```

### Acceptance Criteria for Admin Workflow
1. **Teacher Queue:** Dedicated interface listing all `PENDING_APPROVAL` teacher accounts with one-click Approve and Reject actions.
2. **User Moderation:** Complete administrative control over all user accounts (role changes, verification resets, suspension).
3. **Content Oversight:** Ability to review, edit, unpublish, or delete any course, lesson, or question pool violating platform standards.
4. **Platform Analytics:** Deep-dive charts showing active users, test completion metrics, revenue volume, and error rates.
