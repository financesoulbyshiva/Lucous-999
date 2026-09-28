import { Router } from "express";
import {
  getConfig,
  createOrder,
  verifyPayment,
  handleWebhook,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/config", getConfig);
router.post("/order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
