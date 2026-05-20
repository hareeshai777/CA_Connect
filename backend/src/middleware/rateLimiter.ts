import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many OTP requests." },
});
