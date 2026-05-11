import { Router } from "express";
import { CourseRepository } from "../courses/CourseRepository.js";
import { database } from "../database/database.js";
import { asyncHandler } from "../shared/http/asyncHandler.js";
import { authMiddleware } from "../users/authMiddleware.js";
import { LessonController } from "./LessonController.js";
import { LessonRepository } from "./LessonRepository.js";
import { LessonService } from "./LessonService.js";

const courses = new CourseRepository(database);
const lessons = new LessonRepository(database);
const lessonService = new LessonService(lessons, courses);
const lessonController = new LessonController(lessonService);

export const lessonRoutes = Router();

lessonRoutes.use(authMiddleware);
lessonRoutes.get("/courses/:courseId/lessons", asyncHandler(lessonController.index));
lessonRoutes.post("/courses/:courseId/lessons", asyncHandler(lessonController.create));
lessonRoutes.put("/lessons/:id", asyncHandler(lessonController.update));
lessonRoutes.delete("/lessons/:id", asyncHandler(lessonController.delete));
