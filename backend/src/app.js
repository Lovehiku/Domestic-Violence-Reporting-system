import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { env } from "./config/env.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "http://localhost:5179",
  "http://localhost:3000",
];

app.use(helmet());
app.use(
  cors({
    origin: true, // Reflect the request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(generalLimiter);

// NOTE: At-rest encryption can be added via encrypted SQLite file systems or DB-level encryption.
// NOTE: In-transit encryption should be enforced through HTTPS/TLS in production deployment.
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, now: new Date().toISOString() }),
);
app.use("/api/auth", authRoutes);
app.use("/api/reports", incidentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/support-requests", supportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/case-history", caseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
