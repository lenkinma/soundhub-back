import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { authRouter } from "@/api/auth/authRouter";
import { meRouter } from "@/api/me/meRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { trackRouter } from "@/api/track/trackRouter";
import { commentRouter } from "@/api/comment/commentRouter";
import { likeRouter } from "@/api/like/likeRouter";
import { subscriptionRouter } from "@/api/subscription/subscriptionRouter";
const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/tracks", trackRouter);
app.use(commentRouter);
app.use(likeRouter);
app.use("/subscriptions", subscriptionRouter);
// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
