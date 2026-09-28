import { Router } from "express";
import {
  getBoards,
  getClasses,
  getSubjects,
  getChapters,
  getTopics,
} from "../controllers/curriculum.controller";
import {
  getContent,
  getQuestions,
  checkAnswer,
  submitAttempt,
  getResults,
  getWeakTopics,
  saveProgress,
  getProgress,
} from "../controllers/student.controller";
import { requireStudent } from "../middleware/auth";

const router = Router();

// Preserved curriculum cascade paths on /api/student/*
router.get("/boards", requireStudent, getBoards);
router.get("/classes", requireStudent, getClasses);
router.get("/subjects", requireStudent, getSubjects);
router.get("/chapters", requireStudent, getChapters);
router.get("/topics", requireStudent, getTopics);

// Student learning & assessment paths
router.get("/content", requireStudent, getContent);
router.get("/questions", requireStudent, getQuestions);
router.post("/check", requireStudent, checkAnswer);
router.post("/attempts", requireStudent, submitAttempt);
router.get("/results", requireStudent, getResults);
router.get("/weak-topics", requireStudent, getWeakTopics);
router.post("/progress", requireStudent, saveProgress);
router.get("/progress", requireStudent, getProgress);

export default router;
