import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { assessmentsRouter } from "./routes/assessments.js";
import { authRouter } from "./routes/auth.js";
import { fitnessRouter } from "./routes/fitness.js";
import { goalsRouter } from "./routes/goals.js";
import { healthRouter } from "./routes/health.js";
import { intakeRouter } from "./routes/intake.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { passportRouter } from "./routes/passport.js";
import { socialRouter } from "./routes/social.js";
import { usersRouter } from "./routes/users.js";
import { errorHandler } from "./lib/http.js";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  app.use(helmet());
  app.use(cors({ origin: frontendUrl, credentials: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/intake", intakeRouter);
  app.use("/users", usersRouter);
  app.use("/assessments", assessmentsRouter);
  app.use("/fitness", fitnessRouter);
  app.use("/social", socialRouter);
  app.use("/goals", goalsRouter);
  app.use("/marketplace", marketplaceRouter);
  app.use("/passport", passportRouter);
  app.use(errorHandler);

  return app;
}
