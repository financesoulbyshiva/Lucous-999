import { Router } from "express";
import {
  createCourse,
  updateCourse,
  listCourses,
  getCourseById,
  createEnrollment,
  getMyEnrollments,
} from "../controllers/course.controller";
import { authenticate, requireRole } from "../middleware/auth";

const courseRoutes = Router();

// /api/courses endpoints
courseRoutes.post("/", requireRole("TEACHER"), createCourse);
courseRoutes.get("/", authenticate, listCourses);
courseRoutes.put("/:id", authenticate, updateCourse);
courseRoutes.get("/:id", authenticate, getCourseById);

// /api/enrollments endpoints
export const enrollmentRoutes = Router();
enrollmentRoutes.post("/", requireRole("STUDENT"), createEnrollment);
enrollmentRoutes.get("/my", requireRole("STUDENT"), getMyEnrollments);

export default courseRoutes;
