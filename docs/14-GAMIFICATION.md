# 14 - Gamification Engine: LUCOUS

## 1. Overview & Mechanics

Gamification is a core pillar of the LUCOUS value proposition, designed to drive student engagement through:
- **XP (Experience Points):** Numerical rewards representing study effort and accuracy.
- **Arcade Games:** Timed and focused MCQ challenges mapped to syllabus topics.
- **Leaderboard:** Platform-wide ranking of top learners based on accumulated XP.
- **Badges & Streaks:** Visual milestones commemorating achievements (e.g. 7-day streak, Speed Demon).

---

## 2. XP (Experience Points) Architecture

### Persistence & Storage
- Stored as an integer on the user document: [`backend/prisma/schema.prisma:28`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma#L28):
  ```prisma
  xp Int @default(0) // accumulated game XP (leaderboard)
  ```
- Evaluated and incremented via atomic MongoDB update in [`backend/server.js:1431`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1431):
  ```javascript
  const xp = correct * game.xpPerCorrect;
  await prisma.user.update({
    where: { id: req.userId },
    data: { xp: { increment: xp } }
  });
  ```

### Critical Discovery: XP Disconnect Between Quizzes and Games
- **Games Module (`/api/games/submit`):** Correctly awards and increments `User.xp` in the database.
- **Standard Assessments (`/api/student/attempts`):** Creates an `Attempt` document, but **does not increment `User.xp`**.
- **Play Mode in `QuizRunner`:** Shows `+10 points` in the UI ([`src/components/student/quiz-runner.tsx:158`](file:///c:/Shiva/Lucous2509-main/src/components/student/quiz-runner.tsx#L158)), but does not call `/api/games/submit` or increment the persistent `User.xp` in MongoDB.

---

## 3. Game Modes Catalog

The backend defines 3 game modes in [`backend/server.js:1391`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1391):

```javascript
const GAMES = [
  { id: "rapid-fire", title: "Rapid Fire", description: "10 questions, instant scoring. +10 XP each.", xpPerCorrect: 10, limit: 10 },
  { id: "topic-blitz", title: "Topic Blitz", description: "5 fast questions on one topic. +15 XP each.", xpPerCorrect: 15, limit: 5 },
  { id: "endurance", title: "Endurance", description: "Up to 20 questions. +8 XP each.", xpPerCorrect: 8, limit: 20 },
];
```

The frontend landing page defines an extended set of 6 games in [`src/lib/data.ts:84`](file:///c:/Shiva/Lucous2509-main/src/lib/data.ts#L84):
1. *Quiz Battle* (1v1 Duels)
2. *Speed Challenge* (Timer sprint)
3. *Formula Rush* (STEM equations)
4. *Memory Match* (Card flip memory)
5. *Concept Quest* (Story progression)
6. *Boss Raid* (Collaborative team battle)

*Note:* Multiplayer and boss mechanics exist strictly as presentational marketing descriptions. The playable game runner ([`src/components/student/games-view.tsx:103`](file:///c:/Shiva/Lucous2509-main/src/components/student/games-view.tsx#L103)) executes solo MCQ questions sourced from the selected `Topic`.

---

## 4. Leaderboard Subsystem (`GET /api/games/leaderboard`)

Implemented in [`backend/server.js:1445`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1445):
```javascript
const users = await prisma.user.findMany({
  where: { role: "STUDENT", xp: { gt: 0 } },
  orderBy: { xp: "desc" },
  take: 10,
  select: { id: true, name: true, xp: true },
});
```
- Filters students with `xp > 0`.
- Orders descending by total XP.
- Limits to the top 10 users.
- Displayed in the "Leaderboard" tab of [`src/components/student/games-view.tsx:156`](file:///c:/Shiva/Lucous2509-main/src/components/student/games-view.tsx#L156).

---

## 5. Badges & Streaks: Current Status

- **Landing Page ([`src/lib/data.ts:715`](file:///c:/Shiva/Lucous2509-main/src/lib/data.ts#L715)):** Defines 8 badges (*First Steps*, *Streak Starter*, *Speed Demon*, *Boss Slayer*, *Sharp Shooter*, *Deep Thinker*, *Team Player*, *Quest Legend*).
- **Hero Mock Dashboard ([`src/components/site/sections/hero.tsx:77`](file:///c:/Shiva/Lucous2509-main/src/components/site/sections/hero.tsx#L77)):** Displays a "12 day streak" chip.
- **Codebase Audit Result:** **🔴 NOT IMPLEMENTED IN BACKEND**.
  - There is no `Badge` model, `UserBadge` join table, or `streak` column in [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma).
  - Daily logins, streak resets, and badge unlocking logic do not exist in the backend.
