import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { globalLimiter } from "./middleware/rateLimiter";

import authRoutes from "./routes/auth.routes";
import caRoutes from "./routes/ca.routes";
import bookingRoutes from "./routes/booking.routes";
import paymentRoutes from "./routes/payment.routes";
import serviceRoutes from "./routes/service.routes";
import adminRoutes from "./routes/admin.routes";
import aiRoutes from "./routes/ai.routes";
import contactRoutes from "./routes/contact.routes";
import assistanceRoutes from "./routes/assistance.routes";
import commissionRoutes from "./routes/commission.routes";
import caseRoutes from "./routes/case.routes";
import clientRoutes from "./routes/client.routes";

import { startNotificationCron } from "./services/notification.service";

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
]);

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.has(origin)) return true;
  // Allow any Vercel deployment (preview + production)
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  // Allow any Netlify deployment
  if (/^https:\/\/.*\.netlify\.app$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
}));

app.use(compression());
app.use(morgan("combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(globalLimiter);

app.get("/health", (_, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/ca", caRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/assistance", assistanceRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/client", clientRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);
  startNotificationCron();
});

export default app;
