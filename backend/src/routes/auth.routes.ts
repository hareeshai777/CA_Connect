import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("phone").optional().isMobilePhone("en-IN"),
    body("role").optional().isIn(["CLIENT", "CA_PROFESSIONAL"]),
  ],
  validate,
  authController.register
);

router.post("/verify-otp", otpLimiter, [
  body("userId").notEmpty(),
  body("otp").isLength({ min: 6, max: 6 }),
], validate, authController.verifyOTP);

router.post("/resend-otp", otpLimiter, [body("email").isEmail()], validate, authController.resendOTP);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  authController.login
);

router.post(
  "/google",
  [body("credential").notEmpty()],
  validate,
  authController.googleSignIn
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty()],
  validate,
  authController.refreshToken
);

router.post("/logout", authenticate, authController.logout);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("userId").notEmpty(),
    body("token").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  validate,
  authController.resetPassword
);

router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  authController.changePassword
);

router.get("/me", authenticate, authController.getMe);

export default router;
