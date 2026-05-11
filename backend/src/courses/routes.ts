import { Router } from "express";
import { database } from "../database/database.js";
import { asyncHandler } from "../shared/http/asyncHandler.js";
import { authMiddleware } from "../users/authMiddleware.js";
import { UserRepository } from "../users/UserRepository.js";
import { CourseController } from "./CourseController.js";
import { CourseRepository } from "./CourseRepository.js";
import { CourseService } from "./CourseService.js";

const users = new UserRepository(database);
const courses = new CourseRepository(database);
const courseService = new CourseService(courses, users);
const courseController = new CourseController(courseService);

export const courseRoutes = Router();

courseRoutes.use(authMiddleware);
courseRoutes.get("/", asyncHandler(courseController.index));
courseRoutes.post("/", asyncHandler(courseController.create));
courseRoutes.get("/:id", asyncHandler(courseController.show));
courseRoutes.put("/:id", asyncHandler(courseController.update));
courseRoutes.delete("/:id", asyncHandler(courseController.delete));
