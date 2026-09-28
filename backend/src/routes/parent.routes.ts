import { Router } from "express";
import {
  linkChild,
  getChildren,
  getChildOverview,
} from "../controllers/parent.controller";
import { requireRole } from "../middleware/auth";

const router = Router();

router.post("/link", requireRole("PARENT"), linkChild);
router.get("/children", requireRole("PARENT"), getChildren);
router.get("/child/:id/overview", requireRole("PARENT"), getChildOverview);

export default router;
