import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { body } from "express-validator";
import * as aiController from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { globalLimiter } from "../middleware/rateLimiter";

const router = Router();

router.use(authenticate, globalLimiter);

router.post("/chat", [body("message").trim().notEmpty()], validate, aiController.chat);

router.post(
  "/recommend-ca",
  [body("needs").trim().notEmpty()],
  validate,
  asyncHandler(aiController.getCARecommendations)
);

router.post(
  "/analyze-document",
  [body("documentContent").notEmpty()],
  validate,
  asyncHandler(aiController.analyzeDocument)
);

router.post("/compliance", aiController.getComplianceSuggestions);
router.post("/faq", [body("question").trim().notEmpty()], validate, aiController.taxFAQ);

export default router;
