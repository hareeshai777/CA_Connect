import { Router } from "express";
import express from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.razorpayWebhook
);

router.get("/history", authenticate, paymentController.getPaymentHistory);

export default router;
