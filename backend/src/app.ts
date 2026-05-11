import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { courseRoutes } from "./courses/routes.js";
import { lessonRoutes } from "./lessons/routes.js";
import { errorHandler } from "./shared/http/errorHandler.js";
import { notFoundHandler } from "./shared/http/notFoundHandler.js";
import { authRoutes } from "./users/routes.js";

export const app = express();
const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", lessonRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
