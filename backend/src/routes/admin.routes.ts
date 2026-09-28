import { Router } from "express";
import {
  getStats,
  getUsers,
  getCourses,
} from "../controllers/admin.controller";
import { requireRole } from "../middleware/auth";

const router = Router();

router.get("/stats", requireRole("ADMIN"), getStats);
router.get("/users", requireRole("ADMIN"), getUsers);
router.get("/courses", requireRole("ADMIN"), getCourses);

export default router;
