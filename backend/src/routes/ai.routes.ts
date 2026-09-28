import { Router } from "express";
import { aiTutor, generateContent } from "../controllers/ai.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.post("/tutor", authenticate, aiTutor);
router.post("/generate-content", requireRole("TEACHER"), generateContent);

export default router;
