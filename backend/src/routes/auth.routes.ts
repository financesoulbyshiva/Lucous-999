import { Router } from "express";
import {
  registerUser,
  login,
  getMe,
  updateProfile,
  logout,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", (req: any, res: any) => registerUser(req, res, null));
router.post("/register/student", (req: any, res: any) => registerUser(req, res, "STUDENT"));
router.post("/register/teacher", (req: any, res: any) => registerUser(req, res, "TEACHER"));
router.post("/register/parent", (req: any, res: any) => registerUser(req, res, "PARENT"));
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);
router.post("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
