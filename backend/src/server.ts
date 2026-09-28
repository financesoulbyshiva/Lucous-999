import express from "express";
import cors from "cors";
import env from "./config/env";
import prisma from "./config/prisma";
import errorHandler from "./middleware/error-handler";

import authRoutes from "./routes/auth.routes";
import curriculumRoutes from "./routes/curriculum.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import courseRoutes, { enrollmentRoutes } from "./routes/course.routes";
import parentRoutes from "./routes/parent.routes";
import adminRoutes from "./routes/admin.routes";
import gameRoutes from "./routes/game.routes";
import aiRoutes from "./routes/ai.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

// CORS configuration supporting configured frontend origins
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.options("/*splat", cors());

// Express JSON body parser with raw body buffer preservation for webhook signature checks
app.use(
  express.json({
    verify: (req: any, _res: any, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);

// System health check endpoint
app.get("/api/health", async (_req: any, res: any) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({
      success: true,
      message: "LUCOUS backend is running",
      database: "connected",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error?.message,
    });
  }
});

// Mount domain routes
app.use("/api/auth", authRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);

// Global central error handler middleware
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`LUCOUS backend running on http://localhost:${env.PORT}`);
});

export default app;
