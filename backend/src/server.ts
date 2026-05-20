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

import { startNotificationCron } from "./services/notification.service";

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: [env.FRONTEND_URL, "http://localhost:3000"],
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

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);
  startNotificationCron();
});

export default app;
