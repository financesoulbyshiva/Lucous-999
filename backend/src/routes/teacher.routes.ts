import { Router } from "express";
import {
  getMaterials,
  createMaterial,
  getContent,
  createContent,
  getCourses,
  getStudents,
  getEnrollments,
} from "../controllers/teacher.controller";
import { requireTeacher, requireRole } from "../middleware/auth";

const router = Router();

router.get("/materials", requireTeacher, getMaterials);
router.post("/materials", requireTeacher, createMaterial);
router.get("/content", requireTeacher, getContent);
router.post("/content", requireTeacher, createContent);
router.get("/courses", requireRole("TEACHER"), getCourses);
router.get("/students", requireRole("TEACHER"), getStudents);
router.get("/enrollments", requireRole("TEACHER"), getEnrollments);

export default router;
