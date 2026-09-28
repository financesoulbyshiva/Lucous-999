import { Router } from "express";
import {
  getBoards,
  getClasses,
  getSubjects,
  getChapters,
  getTopics,
} from "../controllers/curriculum.controller";
import { requireStudent } from "../middleware/auth";

const router = Router();

router.get("/boards", requireStudent, getBoards);
router.get("/classes", requireStudent, getClasses);
router.get("/subjects", requireStudent, getSubjects);
router.get("/chapters", requireStudent, getChapters);
router.get("/topics", requireStudent, getTopics);

export default router;
