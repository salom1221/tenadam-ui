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
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    "http://localhost:3000",
    "https://tenadam-ui-backend-tgfz.vercel.app",
  ]
    .filter(Boolean)
    .flatMap((origin) => origin!.split(","))
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
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
