import { Router } from "express";
import {
  getGames,
  submitGame,
  getLeaderboard,
  getMyStats,
} from "../controllers/game.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getGames);
router.post("/submit", requireRole("STUDENT"), submitGame);
router.get("/leaderboard", authenticate, getLeaderboard);
router.get("/me", requireRole("STUDENT"), getMyStats);

export default router;
