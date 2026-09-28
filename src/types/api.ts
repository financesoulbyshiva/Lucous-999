// Shared API data contracts for LUCOUS

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
  board?: { name: string };
  grade?: { name: string };
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
  topic: { id: string; name: string; chapter: { id: string; name: string } };
}

export interface PerQuestion {
  questionId: string | number;
  selected: number;
  correctIndex: number | null;
  wasCorrect: boolean;
  explanation: string | null;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  chapterName: string;
  score: number;
  action: "Practice" | "Retest";
}

// ------------------------- Courses + enrollment ----------------------------

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  board: string;
  price: number;
  currency: string;
  teacherId: string;
  teacher?: { id: string; name: string };
  _count?: { enrollments: number };
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: string;
  course?: Course & { teacher?: { id: string; name: string } };
}

// --------------------------------- Games -----------------------------------

export interface Game {
  id: string;
  title: string;
  description: string;
  xpPerCorrect: number;
  limit: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
}

export interface GameStats {
  totalXp: number;
  gamesPlayed: number;
  bestScore: number;
  recent: {
    id: string;
    gameId: string;
    correct: number;
    total: number;
    score: number;
    xp: number;
    createdAt: string;
    topic?: { name: string } | null;
  }[];
}

// --------------------------------- Admin -----------------------------------

export interface AdminStats {
  users: number;
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  courses: number;
  enrollments: number;
  attempts: number;
  questions: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  grade?: string | null;
  board?: string | null;
  school?: string | null;
  subject?: string | null;
  xp: number;
  createdAt: string;
}

// --------------------------------- Parent ----------------------------------

export interface Child {
  id: string;
  name: string;
  email: string;
  grade?: string | null;
  board?: string | null;
}

export interface ChildOverview {
  student: Child & { xp: number };
  completedCount: number;
  attempts: Attempt[];
  weakTopics: { topicId: string; topicName: string; chapterName: string; score: number }[];
}

// ----------------------------------- AI ------------------------------------

export interface TutorResponse {
  configured: boolean;
  conversationId: string;
  reply: string;
}

export interface GeneratedQuestion {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: number;
  explanation?: string | null;
}

// -------------------------------- Payments ---------------------------------

export interface PaymentConfig {
  configured: boolean;
  keyId: string | null;
}

export interface OrderResponse {
  order: { id: string; amount: number; currency: string };
  course: { id: string; title: string };
}

// --------------------------------- Profile ---------------------------------

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  grade?: string | null;
  board?: string | null;
  school?: string | null;
  subject?: string | null;
  avatarUrl?: string | null;
  xp?: number;
}
